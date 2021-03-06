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

module.exports = (dbConn, queryConn) => (req, res, next) => {
  const photoStore = photoStoreWithConn(dbConn, queryConn);
  return photoStore.list()
    .then((photos) => {
      res.locals.photos = photos;
      next();
    })
    .catch((e) => {
      // translate connection error to be more readable
      if (e.code === 'ECONNREFUSED') {
        res.locals.error = {
          code: 'MYSQL_CONNECTION_REFUSED',
          message: `COULD NOT CONNECT TO ${e.address}:${e.port}`,
        };
        return next();
      }
      res.locals.error = e;
      next();
    });
};
