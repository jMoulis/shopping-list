const express = require('express');
const fs = require('fs');
require('dotenv').config();
const http = require('http');
const https = require('https');
const cors = require('cors');
const mongoose = require('mongoose');
const SocketIO = require('socket.io');
const mainSocket = require('./socket');

mongoose.Promise = global.Promise;

mongoose.connect(
  'mongodb://localhost/shopping',
  { useNewUrlParser: true },
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('database connected');
});

const app = express();
let server;
if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
  server = http.createServer(app);
} else {
  const httpsOptions = {
    key: fs.readFileSync('/etc/ssl/private/_.julienmoulis.io_private_key.key'),
    cert: fs.readFileSync('/etc/ssl/certs/julienmoulis.io_ssl_certificate.cer'),
  };
  server = https.createServer(httpsOptions, app);
}

const io = new SocketIO(server);
app.use(cors());
mainSocket(io);

server.listen(3500);

// const app = require('express')();
// const server = require('http').Server(app);
// const cors = require('cors');
// const mongoose = require('mongoose');
// const io = require('socket.io')(server);
// const mainSocket = require('./socket');

// mongoose.Promise = global.Promise;

// mongoose.connect(
//   'mongodb://localhost/shopping',
//   { useNewUrlParser: true },
// );
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//   console.log('database connected');
// });

// let server;
// if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
//   server = http.createServer(app);
// } else {
//   const httpsOptions = {
//     key: fs.readFileSync(config.key_url),
//     cert: fs.readFileSync(config.cert_url),
//   };
//   server = https.createServer(httpsOptions, app);
// }

// app.use(cors());
// mainSocket(io);

// server.listen(3500);
