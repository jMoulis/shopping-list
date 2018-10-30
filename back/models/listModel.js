const mongoose = require('mongoose');

const { Schema } = mongoose;

const listSchema = new mongoose.Schema({
  name: String,
  status: {
    type: Boolean,
    default: true,
  },
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'category',
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
});

const List = mongoose.model('list', listSchema);

module.exports = List;
