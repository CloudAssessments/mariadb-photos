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
  t.context.mockMysql = {
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

  t.context.mockMysql.query
    .once()
    .callsFake((sql, [limit], cb) => {
      t.is(sql, 'SELECT * FROM `photos` ORDER BY `id` DESC LIMIT ?');
      t.is(limit, 12);
      cb(null, rows);
    });

  t.context.mockNext
    .once()
    .callsFake(() => {
      t.deepEqual(t.context.mockRes.locals.photos, rows);
      t.context.mockMysql.query.verify();
      t.context.mockNext.verify();
      t.end();
    });

  getPhotos(t.context.mockMysql)({}, t.context.mockRes, t.context.mockNext);
});

test.cb('should add error to res.locals if one occurs', (t) => {
  t.context.mockMysql.query
    .once()
    .callsFake((sql, [limit], cb) => {
      t.is(sql, 'SELECT * FROM `photos` ORDER BY `id` DESC LIMIT ?');
      t.is(limit, 12);
      cb(new Error('oops'));
    });

  t.context.mockNext
    .once()
    .callsFake(() => {
      t.is(t.context.mockRes.locals.error.message, 'oops');
      t.context.mockMysql.query.verify();
      t.context.mockNext.verify();
      t.end();
    });

  getPhotos(t.context.mockMysql)({}, t.context.mockRes, t.context.mockNext);
});
