const userModel = require('../models/userModel');

module.exports = ({ socket, usersConnected }) => {
  socket.on('LOGIN', async (data, acknowledgement) => {
    try {
      const loggedUser = await userModel.findOne(
        { email: data.email, password: data.password },
        { _id: 1 },
      );
      if (!loggedUser)
        return acknowledgement({
          error: 'Le mot de passe ou identifiant inconnus',
          success: false,
        });

      const newUser = await userModel.findOne({
        _id: loggedUser._id,
      });

      if (newUser) {
        usersConnected.addUser(socket.id, newUser);
      }

      acknowledgement({ data: loggedUser._id, success: true });
    } catch (error) {
      acknowledgement({ error: error.message, success: false });
    }
  });
  socket.on('REGISTER', async (data, acknowledgement) => {
    try {
      const existingUser = await userModel.findOne({ email: data.email });
      if (existingUser)
        return acknowledgement({ error: 'Cet email existe déjà' });
      const loggedUser = await userModel.create(data);
      acknowledgement({ data: loggedUser._id, success: true });
    } catch (error) {
      acknowledgement({ error: error.message, success: false });
    }
  });
  socket.on('FETCH_USER', async ({ loggedUserId }, acknowledgement) => {
    try {
      const user = await userModel.findOne(
        { _id: loggedUserId },
        { password: 0 },
      );
      if (!user)
        return acknowledgement({ error: 'User not found', success: false });
      acknowledgement({ data: user, success: true });
    } catch (error) {
      acknowledgement({ error: error.message, success: false });
    }
  });
};
