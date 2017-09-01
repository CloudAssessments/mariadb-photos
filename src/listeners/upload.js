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
const photoStoreWithConn = require('../stores/photo');

module.exports = (dbConn, queryConn, io) => (channel, message) => {
  try {
    const photoStore = photoStoreWithConn(dbConn, queryConn);
    const parsedMessage = JSON.parse(message);

    const photo = {
      name: parsedMessage.name,
      mime_type: parsedMessage.mimeType,
      data: new Buffer.from(parsedMessage.buffer.data),
    };

    return photoStore.upsert(photo)
      .then(() => io.emit('broadcast', 'uploaded'));
  } catch (e) {
    /* istanbul ignore if */
    if (!process.env.AVA_PATH) {
      console.error('UploadError: ', e);
    }
    return Promise.reject(e);
  }
};
