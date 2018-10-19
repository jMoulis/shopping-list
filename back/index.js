const app = require('express')();
const server = require('http').Server(app);
const cors = require('cors');
const mongoose = require('mongoose');
const io = require('socket.io')(server);
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

app.use(cors());
mainSocket(io);

server.listen(3500);
