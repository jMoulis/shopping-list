const listController = require('./list_controller');
const categoryController = require('./category_controller');
const authController = require('./auth_controller');
const userModel = require('../models/userModel');
const User = require('./users');

module.exports = io => {
  const usersConnected = new User();
  io.on('connection', async socket => {
    console.log('Connected');
    socket.emit('CONNECT_SUCCESS', { message: 'Welcome to shopping List' });

    socket.on('disconnect', () => {
      usersConnected.removeUser(socket.id);
    });
    listController({ socket, io, usersConnected });
    categoryController({ socket, io, usersConnected });
    authController({ socket, usersConnected });
  });
};
