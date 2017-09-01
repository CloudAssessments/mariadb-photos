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
const getPhotos = require('../../src/middleware/getPhotos');

test.beforeEach((t) => {
  t.context.mockDbConn = {
    query: sinon.mock(),
  };

  t.context.mockQueryConn = {
    query: sinon.mock(),
  };

  t.context.mockRes = { locals: {} };
  t.context.mockNext = sinon.mock();
});

test.cb('should add photos to res.locals from mysql', (t) => {
  const rows = [
    {
      name: 'testImage1.jpeg',
      mime_type: 'image/jpeg',
      data: new Buffer('foo'),
    },
    {
      name: 'testImage2.png',
      mime_type: 'image/png',
      data: new Buffer('bar'),
    },
  ];

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
        args[2](null, rows);
      }

      calls += 1;
    });

  t.context.mockNext
    .once()
    .callsFake(() => {
      t.deepEqual(t.context.mockRes.locals.photos, rows);
      t.context.mockDbConn.query.verify();
      t.context.mockQueryConn.query.verify();
      t.context.mockNext.verify();
      t.end();
    });

  getPhotos(t.context.mockDbConn, t.context.mockQueryConn)(
    {}, t.context.mockRes, t.context.mockNext
  );
});

test.cb('should add error to res.locals if one occurs', (t) => {
  let calls = 1;

  t.context.mockDbConn.query
    .once()
    .callsFake((sql, cb) => {
      t.is(sql, 'CREATE DATABASE IF NOT EXISTS `photo_demo`');
      cb(null, {});
    });

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

  t.context.mockNext
    .once()
    .callsFake(() => {
      t.is(t.context.mockRes.locals.error.message, 'oops');
      t.context.mockDbConn.query.verify();
      t.context.mockQueryConn.query.verify();
      t.context.mockNext.verify();
      t.end();
    });

  getPhotos(t.context.mockDbConn, t.context.mockQueryConn)(
    {}, t.context.mockRes, t.context.mockNext
  );
});


test.cb('should catch ECONNREFUSED errors and make better messages', (t) => {
  t.context.mockDbConn.query
    .once()
    .callsFake((sql, cb) => {
      t.is(sql, 'CREATE DATABASE IF NOT EXISTS `photo_demo`');
      cb({
        code: 'ECONNREFUSED',
        address: '127.0.0.1',
        port: '3306',
      });
    });

  t.context.mockQueryConn.query.never();

  // t.context.mockQueryConn.query
  //   .once()
  //   .callsFake((...args) => {
  //     console.log('debugT1', args);
  //   });

  t.context.mockNext
    .once()
    .callsFake(() => {
      t.is(t.context.mockRes.locals.error.code, 'MYSQL_CONNECTION_REFUSED');
      t.is(t.context.mockRes.locals.error.message, 'COULD NOT CONNECT TO 127.0.0.1:3306');
      t.context.mockDbConn.query.verify();
      t.context.mockQueryConn.query.verify();
      t.context.mockNext.verify();
      t.end();
    });

  getPhotos(t.context.mockDbConn, t.context.mockQueryConn)(
    {}, t.context.mockRes, t.context.mockNext
  );
});
