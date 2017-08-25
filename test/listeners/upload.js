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
  t.context.mockMysql = { query: sinon.mock() };
});

test('should upload a photo to mysql', (t) => {
  const testMessageJSON = {
    name: 'test.jpeg',
    mimeType: 'image/jpeg',
    buffer: JSON.parse(JSON.stringify(new Buffer('foo'))),
  };

  t.context.mockMysql.query
    .once()
    .callsFake((sql, photo, cb) => {
      t.is(sql, 'INSERT INTO `photos` SET ? ON DUPLICATE KEY UPDATE data=VALUES(data)');
      t.is(photo.name, testMessageJSON.name);
      t.is(photo.mime_type, testMessageJSON.mimeType);
      t.deepEqual(photo.data, new Buffer('foo'));
      cb(null, { affectedRows: 1 });
    });

  return upload(t.context.mockMysql)('upload', JSON.stringify(testMessageJSON))
    .then((res) => {
      t.is(res.affectedRows, 1);
      t.context.mockMysql.query.verify();
    });
});

test('should reject if message is not valid JSON', (t) => {
  t.context.mockMysql.query.never();
  return upload(t.context.mockMysql)('upload', 'invalidJSON')
    .catch(() => {
      t.pass();
      t.context.mockMysql.query.verify();
    });
});
