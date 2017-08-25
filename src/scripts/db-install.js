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
const mysql2 = require('mysql2');

const database = process.env.MARIA_DATABASE || 'photo_demo';
const config = {
  host: process.env.MARIA_HOST || (process.env.DOCKER_COMPOSE ? 'mysql' : undefined),
  port: process.env.MARIA_PORT,
  user: process.env.MARIA_USER || 'root',
  password: process.env.MARIA_PASSWORD,
};

const conn = mysql2.createConnection(config);

const createDatabase = () => new Promise((resolve, reject) =>
  conn.query('CREATE DATABASE IF NOT EXISTS `photo_demo`', (err, res) =>
    (err ? reject(err) : resolve(res))
  )
);

const createPhotosTable = () => new Promise((resolve, reject) => {
  const dbConn = mysql2.createConnection({ ...config, database });

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
  dbConn.query(sql, (err, res) => (err ? reject(err) : resolve(res)));
});

createDatabase()
  .then(() => createPhotosTable())
  .then(() => {
    console.log('success!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
