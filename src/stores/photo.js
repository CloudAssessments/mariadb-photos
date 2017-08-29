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
const assertDatabase = dbConn => new Promise((resolve, reject) =>
  dbConn.query(
    'CREATE DATABASE IF NOT EXISTS `photo_demo`',
    (err, res) => (err ? reject(err) : resolve(res))
  )
);

const assertTable = queryConn => new Promise((resolve, reject) => {
  // eslint-disable-next-line
  const sql = "CREATE TABLE IF NOT EXISTS `photos` (\
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,\
    `name` varchar(128) NOT NULL,\
    `mime_type` varchar(128) NOT NULL,\
    `data` longblob NOT NULL,\
    `created` timestamp NOT NULL DEFAULT current_timestamp(),\
    PRIMARY KEY (`id`),\
    UNIQUE KEY `name` (`name`)\
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;\
  ";

  queryConn.query(sql, (err, res) => (err ? reject(err) : resolve(res)));
});

const assert = (dbConn, queryConn) => assertDatabase(dbConn)
  .then(() => assertTable(queryConn));

const list = (dbConn, queryConn) => (limit = 12) => {
  const sql = 'SELECT * FROM `photos` ORDER BY `id` DESC LIMIT ?';
  return assert(dbConn, queryConn)
    .then(() => new Promise((resolve, reject) =>
      queryConn.query(sql, [limit], (err, res) => (err ? reject(err) : resolve(res)))
    ));
};

const upsert = (dbConn, queryConn) => (photo) => {
  const sql = 'INSERT INTO `photos` SET ? ON DUPLICATE KEY UPDATE data=VALUES(data)';
  return assert(dbConn, queryConn)
    .then(() => new Promise((resolve, reject) =>
      queryConn.query(sql, photo, (err, res) => (err ? reject(err) : resolve(res)))
    ));
};

module.exports = (dbConn, queryConn) => ({
  list: list(dbConn, queryConn),
  upsert: upsert(dbConn, queryConn),
});
