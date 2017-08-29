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

const list = conn => (limit = 12) => new Promise((resolve, reject) => {
  const sql = 'SELECT * FROM `photos` ORDER BY `id` DESC LIMIT ?';
  conn.query(sql, [limit], (err, res) => (err ? reject(err) : resolve(res)));
});

const upsert = conn => photo => new Promise((resolve, reject) => {
  const sql = 'INSERT INTO `photos` SET ? ON DUPLICATE KEY UPDATE data=VALUES(data)';
  conn.query(sql, photo, (err, res) => (err ? reject(err) : resolve(res)));
});

module.exports = conn => ({
  list: list(conn),
  upsert: upsert(conn),
});
