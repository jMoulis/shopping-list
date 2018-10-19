const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
  name: String,
  status: {
    type: Boolean,
    default: false,
  },
});

const categorySchema = new mongoose.Schema({
  name: String,
  products: [productSchema],
  list: {
    type: Schema.Types.ObjectId,
    ref: 'list',
  },
});

const Category = mongoose.model('category', categorySchema);

module.exports = Category;
