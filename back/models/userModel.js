const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  email: String,
  password: String,
  invitations: Array,
});

const User = mongoose.model('user', userSchema);

module.exports = User;
