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

const conn = mysql2.createConnection({
  host: process.env.MARIA_HOST || (process.env.DOCKER_COMPOSE ? 'mysql' : undefined),
  port: process.env.MARIA_PORT,
  user: process.env.MARIA_USER || 'root',
  password: process.env.MARIA_PASSWORD,
});

const dropDatabase = () => new Promise((resolve, reject) =>
  conn.query(`DROP DATABASE IF EXISTS \`${database}\``, (err, res) =>
    (err ? reject(err) : resolve(res))
  )
);

dropDatabase()
  .then(() => {
    console.log('success!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
