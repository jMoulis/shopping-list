const listModel = require('../models/listModel');
const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');

module.exports = ({ io, socket, usersConnected }) => {
  socket.on('CREATE_NEW_SHOPPING_LIST', async ({ data, loggedUser }) => {
    try {
      const newList = await listModel.create({ ...data, user: loggedUser });
      const defaultCategory = await categoryModel.create({
        name: 'default',
        list: newList._id,
      });
      await listModel.updateOne(
        { _id: newList._id },
        {
          $addToSet: { categories: defaultCategory, users: loggedUser },
        },
      );

      io.to(socket.id).emit('CREATE_NEW_SHOPPING_LIST_SUCCESS', {
        payload: newList,
      });
    } catch (error) {
      io.to(socket.id).emit('CREATE_NEW_SHOPPING_LIST_FAILURE', {
        payload: {
          error: error.message,
        },
      });
    }
  });

  socket.on('FETCH_SHOPPING_LISTS', async ({ loggedUser }, acknowledgement) => {
    console.log(loggedUser);
    try {
      const shoppingLists = await listModel.find(
        {
          $or: [{ user: loggedUser }, { users: { $in: loggedUser } }],
        },
        { name: 1, user: 1 },
      );
      acknowledgement({ data: shoppingLists, success: true });
    } catch (error) {
      acknowledgement({ error: error.message, success: false });
    }
  });

  socket.on('FETCH_SHOPPING_LIST', async (id, acknowledgement) => {
    try {
      const list = await listModel.findOne({ _id: id }).populate({
        path: 'categories',
        ref: 'category',
      });
      if (!list) return acknowledgement({ error: 'no list found' });
      acknowledgement({ data: list, success: true });
    } catch (error) {
      acknowledgement({ error: error.message, success: false });
    }
  });

  socket.on('DELETE_LIST', async ({ _id }, acknowledgement) => {
    try {
      const deletedList = await listModel.findOneAndRemove({ _id });
      io.emit('DELETE_LIST_SUCCESS', {
        payload: {
          _id: deletedList._id,
        },
      });
      acknowledgement({ success: true });
    } catch (error) {
      acknowledgement({ error: error.message });
    }
  });

  socket.on(
    'INVITE_LIST',
    async ({ loggedUser, email, listId }, acknowledgement) => {
      try {
        const author = await userModel.findOne({ _id: loggedUser });
        const list = await listModel.findOne({ _id: listId });
        const guest = await userModel.findOne({ email });

        if (!guest) return acknowledgement({ error: 'User not found' });
        await userModel.updateOne(
          { email },
          {
            $addToSet: {
              invitations: {
                author: {
                  firstName: author.firstName,
                  _id: author._id,
                },
                list: {
                  _id: listId,
                  name: list.name,
                },
              },
            },
          },
        );
        const user = await userModel.findOne(
          { _id: guest._id },
          { password: 0 },
        );

        acknowledgement({ success: true });
        const userConnected = usersConnected.getUserByUserId(guest._id);
        io.to(`${userConnected.socketId}`).emit('NOTIFICATION', {
          type: 'new_invitation',
          message: `${author.firstName} vous invite à joindre la liste ${
            list.name
          }`,
          listId: list._id,
          user,
        });
      } catch (error) {
        acknowledgement({ error: error.message, success: false });
      }
    },
  );

  socket.on('JOIN_LIST', async ({ listId, loggedUserId }, acknowledgement) => {
    try {
      await listModel.updateOne(
        { _id: listId },
        {
          $addToSet: {
            users: loggedUserId,
          },
        },
      );
      await userModel.updateOne(
        { _id: loggedUserId },
        {
          $pull: {
            invitations: {
              'list._id': listId,
            },
          },
        },
      );
      socket.join(listId);
      const user = await userModel.findOne(
        { _id: loggedUserId },
        { password: 0 },
      );
      if (!user) return acknowledgement({ error: 'no user found' });
      acknowledgement({ data: user, success: true });
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on('LEAVE_LIST', async ({ listId, loggedUser }, acknowledgement) => {
    try {
      await listModel.updateOne(
        { _id: listId },
        {
          $pull: {
            users: loggedUser,
          },
        },
      );
      const user = await userModel.findOne(
        { _id: loggedUser },
        { password: 0 },
      );
      if (!user) return acknowledgement({ error: 'no user found' });
      acknowledgement({ data: user, success: true });
    } catch (error) {
      acknowledgement({ error: error.message, success: false });
    }
  });
};
