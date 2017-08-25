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
const publishUpload = require('../../src/middleware/publishUpload');

test.cb('should publish an upload message and redirect to homepage', (t) => {
  const redisPub = { publish: sinon.mock() };

  const mockRes = {
    locals: {
      image: { foo: 'bar' },
      editedImage: new Buffer('grey-bar'),
    },
    redirect: sinon.mock(),
  };

  redisPub.publish
    .once()
    .withArgs('upload', new Buffer.from(JSON.stringify(Object.assign(
      {},
      mockRes.locals.image,
      { buffer: mockRes.locals.editedImage }
    ))));

  mockRes.redirect
    .once()
    .callsFake((path) => {
      t.is(path, '/');
      redisPub.publish.verify();
      mockRes.redirect.verify();
      t.end();
    });

  publishUpload(redisPub)({}, mockRes);
});
