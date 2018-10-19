const categoryModel = require('../models/categoryModel');
const listModel = require('../models/listModel');

module.exports = ({ socket, io }) => {
  socket.on('CREATE_CATEGORY', async ({ data }) => {
    try {
      const newCategory = await categoryModel.create(data);
      await listModel.update(
        { _id: data.list },
        {
          $addToSet: {
            categories: newCategory._id,
          },
        },
      );
      io.emit('CREATE_CATEGORY_SUCCESS', {
        payload: newCategory,
      });
    } catch (error) {
      io.emit('CREATE_CATEGORY_FAILURE', {
        payload: {
          error: error.message,
        },
      });
    }
  });
  socket.on('CREATE_PRODUCT', async ({ data }, aknowledgement) => {
    try {
      await categoryModel.updateOne(
        { _id: data.category },
        {
          $addToSet: {
            products: { name: data.name },
          },
        },
      );
      const products = await categoryModel.findOne(
        { _id: data.category },
        { products: 1 },
      );
      io.emit('CREATE_PRODUCT_SUCCESS', {
        payload: products,
      });
      aknowledgement();
    } catch (error) {
      io.emit('CREATE_PRODUCT_FAILURE', {
        payload: {
          error: error.message,
        },
      });
    }
  });
  socket.on('UPDATE_STATUS_PRODUCT', async ({ data }) => {
    //     categoryId
    // productId
    // status
    try {
      await categoryModel.updateOne(
        { _id: data.categoryId, 'products._id': data.productId },
        {
          $set: {
            'products.$.status': data.status,
          },
        },
      );
      const products = await categoryModel.findOne(
        { _id: data.categoryId },
        { products: 1 },
      );
      io.emit('CREATE_PRODUCT_SUCCESS', {
        payload: products,
      });
    } catch (error) {
      io.emit('CREATE_PRODUCT_FAILURE', {
        payload: {
          error: error.message,
        },
      });
    }
  });
};
