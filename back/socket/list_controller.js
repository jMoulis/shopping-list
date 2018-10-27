const listModel = require('../models/listModel');
const categoryModel = require('../models/categoryModel');

module.exports = ({ io, socket }) => {
  socket.on('CREATE_NEW_SHOPPING_LIST', async ({ data }) => {
    try {
      const newList = await listModel.create(data);
      const defaultCategory = await categoryModel.create({
        name: 'default',
        list: newList._id,
      });
      await listModel.updateOne(
        { _id: newList._id },
        {
          $addToSet: { categories: defaultCategory },
        },
      );

      io.emit('CREATE_NEW_SHOPPING_LIST_SUCCESS', {
        payload: newList,
      });
    } catch (error) {
      io.emit('CREATE_NEW_SHOPPING_LIST_FAILURE', {
        payload: {
          error: error.message,
        },
      });
    }
  });
  socket.on('FETCH_SHOPPING_LISTS', async acknowledgement => {
    try {
      const shoppingLists = await listModel.find({}, { name: 1 });
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
};
