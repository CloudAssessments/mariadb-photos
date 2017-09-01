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
  t.context.mockDbConn = { query: sinon.mock() };
  t.context.mockQueryConn = { query: sinon.mock() };
});

test('upsert should execute an insert query to mysql and resolve the results', (t) => {
  const testPhoto = {
    name: 'test.jpeg',
    mime_type: 'image/jpeg',
    data: new Buffer('foo'),
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
        t.is(args[1], testPhoto);
        args[2](null, { affectedRows: 1 });
      }

      calls += 1;
    });

  return photoStoreWithConn(t.context.mockDbConn, t.context.mockQueryConn)
    .upsert(testPhoto)
    .then((res) => {
      t.is(res.affectedRows, 1);
      t.context.mockDbConn.query.verify();
      t.context.mockQueryConn.query.verify();
    });
});

test('upsert should reject if query returns error', (t) => {
  const testPhoto = {
    name: 'test.jpeg',
    mime_type: 'image/jpeg',
    data: new Buffer('foo'),
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
        t.is(args[1], testPhoto);
        args[2](new Error('oops'));
      }

      calls += 1;
    });

  return t.throws(
    photoStoreWithConn(t.context.mockDbConn, t.context.mockQueryConn).upsert(testPhoto),
    'oops'
  ).then(() => t.context.mockQueryConn.query.verify());
});

test('list should retrieve all images (with limit) from mysql', (t) => {
  const testPhoto = {
    name: 'test.jpeg',
    mime_type: 'image/jpeg',
    data: new Buffer('foo'),
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
        t.is(args[0], 'SELECT * FROM `photos` ORDER BY `id` DESC LIMIT ?');
        t.is(args[1][0], 12);
        args[2](null, [testPhoto, testPhoto]);
      }

      calls += 1;
    });

  return photoStoreWithConn(t.context.mockDbConn, t.context.mockQueryConn)
    .list()
    .then((res) => {
      t.deepEqual(res, [testPhoto, testPhoto]);
      t.context.mockDbConn.query.verify();
      t.context.mockQueryConn.query.verify();
    });
});

test('list should reject if query returns error', (t) => {
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
        t.is(args[0], 'SELECT * FROM `photos` ORDER BY `id` DESC LIMIT ?');
        t.is(args[1][0], 12);
        args[2](new Error('oops'));
      }

      calls += 1;
    });

  return t.throws(
    photoStoreWithConn(t.context.mockDbConn, t.context.mockQueryConn).list(),
    'oops'
  ).then(() => t.context.mockQueryConn.query.verify());
});

test('should reject if asserting table query errors', (t) => {
  t.context.mockDbConn.query
    .once()
    .callsFake((sql, cb) => {
      t.is(sql, 'CREATE DATABASE IF NOT EXISTS `photo_demo`');
      cb(null, {});
    });

  t.context.mockQueryConn.query
    .once()
    .callsFake((sql, cb) => {
      t.true(sql.includes('CREATE TABLE'));
      cb(new Error('oops'));
    });

  return t.throws(
    photoStoreWithConn(t.context.mockDbConn, t.context.mockQueryConn).list(),
    'oops'
  ).then(() => {
    t.context.mockDbConn.query.verify();
    t.context.mockQueryConn.query.verify();
  });
});

