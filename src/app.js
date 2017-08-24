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
const express = require('express');
const multer = require('multer');
const mysql2 = require('mysql2');
const path = require('path');
const redis = require('redis');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

// initialize mysql connection
const mysql = mysql2.createConnection({
  host: process.env.MARIA_HOST,
  port: process.env.MARIA_PORT,
  user: process.env.MARIA_USER,
  password: process.env.MARIA_PASSWORD,
  database: process.env.MARIA_DATABASE || 'photo_demo',
});

// initialize redis pub/sub for image upload work
const redisServer = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
};
const pub = redis.createClient(redisServer);
const sub = redis.createClient(redisServer);
sub.on('message', require('./listeners/upload')(mysql));

sub.on('error', err => console.error('REDIS_ERROR: ', err));
sub.subscribe('upload');

// Routes: Homepage
app.get('/', require('./middleware/homepage'));

// Routes: Upload Photo
app.post(
  '/photo',
  multer().single('uploadedImage'),
  require('./middleware/multipartToImage'),
  require('./middleware/publishUpload')(pub)
);

module.exports = app;
