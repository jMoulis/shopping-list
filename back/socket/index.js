const listController = require('./list_controller');
const categoryController = require('./category_controller');

module.exports = io => {
  io.on('connection', socket => {
    console.log('Connected');
    socket.emit('CONNECT_SUCCESS', { message: 'Welcome to shopping List' });
    listController({ socket, io });
    categoryController({ socket, io });
  });
};
