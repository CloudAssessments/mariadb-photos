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
const jimp = require('jimp');
const multer = require('multer');
const mysql2 = require('mysql2');
const path = require('path');
const redis = require('redis');
const socketIo = require('socket.io');

const app = express();

// initialize a socket.io connection to be attached to the http server
const io = socketIo();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

// Create MySQL Connection Config
const mysqlConfig = {
  connectionLimit: 1, // using connection pool for simpler error handling
  host: process.env.MARIA_HOST || (process.env.DOCKER_COMPOSE && 'mysql'),
  port: process.env.MARIA_PORT,
  user: process.env.MARIA_USER || 'root',
  password: process.env.MARIA_PASSWORD,
};

// MySQL Connection to create databases
const dbConn = mysql2.createPool(mysqlConfig);

// MySQL Connection to run queries on the photo_demo database
const mariaDatabase = process.env.MARIA_DATABASE || 'photo_demo';
const queryConn = mysql2.createPool({ ...mysqlConfig, database: mariaDatabase });

// Let MySQL Errors fall through so the queries can surface errors to front-end
dbConn.on('error', err => console.error('MySQL Error: ', err));
queryConn.on('error', err => console.error('MySQL Error: ', err));

// initialize redis pub/sub for image upload work
const redisServer = {
  host: process.env.REDIS_HOST || (process.env.DOCKER_COMPOSE && 'redis'),
  port: process.env.REDIS_PORT,
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
};
const pub = redis.createClient(redisServer);
const sub = redis.createClient(redisServer);
sub.on('message', require('./listeners/upload')(dbConn, queryConn, io));

sub.on('error', err => console.error('REDIS_ERROR: ', err));
sub.subscribe('upload');
sub.subscribe('uploaded');

// Routes: Homepage
app.get(
  '/',
  require('./middleware/getPhotos')(dbConn, queryConn),
  require('./middleware/homepage')
);

// Routes: Upload Photo
app.post(
  '/photo',
  multer().single('uploadedImage'),
  require('./middleware/multipartToImage'),
  require('./middleware/filterGreyscale')(jimp),
  require('./middleware/publishUpload')(pub)
);

// Routes: Show Environment and App Variables - Debug Mode Only

if (process.env.DEBUG) {
  app.get('/debug/app-vars', (req, res) => res.json({
    PORT: process.env.PORT,
    MARIA_HOST: process.env.MARIA_HOST,
    MARIA_PORT: process.env.MARIA_PORT,
    MARIA_USER: process.env.MARIA_USER,
    MARIA_PASSWORD: process.env.MARIA_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  }));
}

// Routes: Sys Alive
app.get('/sys/alive', (req, res) => res.send('mariadb-photos at your [micro]service!'));

module.exports = app;
