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

const redirect = (res, err) => res.redirect(`/?err=${JSON.stringify(err)}`);

module.exports = jimp => (req, res, next) => {
  jimp.read(res.locals.image.buffer, (err, image) => {
    if (err) {
      return redirect(res, { code: err.code, message: err.message });
    }

    image.greyscale().getBuffer(jimp.AUTO, (bufferErr, buffer) => {
      if (bufferErr) {
        return redirect(res, { code: bufferErr.code, message: bufferErr.message });
      }

      res.locals.editedImage = buffer;
      return next();
    });
  });
};
