/*
  Copyright 2017 Linux Academy
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
const { test } = require('ava');
const sinon = require('sinon');
const upload = require('../../src/listeners/upload');

test.beforeEach((t) => {
  t.context.mockDbConn = { query: sinon.mock() };
  t.context.mockQueryConn = { query: sinon.mock() };
  t.context.mockIo = { emit: sinon.mock() };
});

test('should upload a photo to mysql', (t) => {
  const testMessageJSON = {
    name: 'test.jpeg',
    mimeType: 'image/jpeg',
    buffer: JSON.parse(JSON.stringify(new Buffer('foo'))),
  };

  t.context.mockDbConn.query
    .once()
    .callsFake((sql, cb) => {
      t.is(sql, 'CREATE DATABASE IF NOT EXISTS `photo_demo`');
      cb(null, {});
    });

  let calls = 1;
  t.context.mockQueryConn.query
    .twice()
    .callsFake((...args) => {
      if (calls === 1) {
        t.true(args[0].includes('CREATE TABLE'));
        args[1](null, {});
      }

      if (calls === 2) {
        t.is(
          args[0],
          'INSERT INTO `photos` SET ? ON DUPLICATE KEY UPDATE data=VALUES(data)'
        );
        t.is(args[1].name, testMessageJSON.name);
        t.is(args[1].mime_type, testMessageJSON.mimeType);
        t.deepEqual(args[1].data, new Buffer('foo'));
        args[2](null, { affectedRows: 1 });
      }

      calls += 1;
    });

  t.context.mockIo.emit
    .once()
    .withArgs('broadcast', 'uploaded')
    .resolves();

  const uploadWithDeps = upload(
    t.context.mockDbConn,
    t.context.mockQueryConn,
    t.context.mockIo
  );

  return uploadWithDeps('upload', JSON.stringify(testMessageJSON))
    .then(() => {
      t.context.mockDbConn.query.verify();
      t.context.mockQueryConn.query.verify();
    });
});

test('should reject if message is not valid JSON', (t) => {
  t.context.mockDbConn.query.never();
  t.context.mockQueryConn.query.never();

  const uploadWithDeps = upload(
    t.context.mockDbConn,
    t.context.mockQueryConn,
    t.context.mockIo
  );

  return uploadWithDeps('upload', 'invalidJSON')
    .catch(() => {
      t.pass();
      t.context.mockDbConn.query.verify();
      t.context.mockQueryConn.query.verify();
    });
});
