const mysql2 = require('mysql2');

const conn = mysql2.createConnection({
  host: process.env.MARIA_HOST,
  port: process.env.MARIA_PORT,
  user: process.env.MARIA_USER || 'root',
  password: process.env.MARIA_PASSWORD,
});

const dropDatabase = () => new Promise((resolve, reject) =>
  conn.query('DROP DATABASE IF EXISTS `photo_demo`', (err, res) =>
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
