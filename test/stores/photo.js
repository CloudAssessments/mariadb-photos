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
const photoStoreWithConn = require('../../src/stores/photo');

test.beforeEach((t) => {
  t.context.mockMysql = { query: sinon.mock() };
});

test('upsert should execute an insert query to mysql and resolve the results', (t) => {
  const testPhoto = {
    name: 'test.jpeg',
    mime_type: 'image/jpeg',
    data: new Buffer('foo'),
  };

  t.context.mockMysql.query
    .once()
    .callsFake((sql, photo, cb) => {
      t.is(sql, 'INSERT INTO `photos` SET ? ON DUPLICATE KEY UPDATE data=VALUES(data)');
      t.is(photo, testPhoto);
      cb(null, { affectedRows: 1 });
    });

  return photoStoreWithConn(t.context.mockMysql).upsert(testPhoto)
    .then((res) => {
      t.is(res.affectedRows, 1);
      t.context.mockMysql.query.verify();
    });
});

test('upsert should reject if query returns error', (t) => {
  const testPhoto = {
    name: 'test.jpeg',
    mime_type: 'image/jpeg',
    data: new Buffer('foo'),
  };

  t.context.mockMysql.query
    .once()
    .callsFake((sql, photo, cb) => {
      t.is(sql, 'INSERT INTO `photos` SET ? ON DUPLICATE KEY UPDATE data=VALUES(data)');
      t.is(photo, testPhoto);
      cb(new Error('oops'));
    });

  return t.throws(
    photoStoreWithConn(t.context.mockMysql).upsert(testPhoto),
    'oops'
  ).then(() => t.context.mockMysql.query.verify());
});
