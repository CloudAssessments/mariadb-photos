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

module.exports = (req, res) => {
  const ctx = {};

  // surface errors in query string if they exist
  if (req.query && req.query.err) {
    ctx.err = req.query.err;
  }

  // surface errors in locals.error if they exist
  if (res.locals && res.locals.error) {
    ctx.err = JSON.stringify({
      code: res.locals.error.code,
      message: res.locals.error.message,
    });
  }

  // pass in photos if they exist
  if (res.locals && res.locals.photos) {
    ctx.photos = res.locals.photos.map(
      image => `data:${image.mime_type};base64,${image.data.toString('base64')}`
    );
  }

  res.render('index', ctx);
};
