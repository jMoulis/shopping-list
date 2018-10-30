class Users {
  constructor() {
    this.users = [];
    this.typingUsers = [];
  }

  addUser(socketId, user) {
    this.users.push({
      firstName: user.firstName,
      _id: user._id.toString(),
      socketId,
    });
    return user;
  }

  getUsersList() {
    return this.users;
  }

  getUser(socketId) {
    return this.users.find(user => user.socketId === socketId);
  }

  getUserByUserId(userId) {
    return this.users.find(user => user._id.toString() === userId.toString());
  }

  removeUser(socketId) {
    const user = this.getUser(socketId);
    if (user) {
      this.users = this.users.filter(user => user.socketId !== socketId);
    }
    return user;
  }

  getTypingUsers() {
    return this.typingUsers;
  }

  removeTypingUser(socketId) {
    const user = this.getUser(socketId);
    if (user) {
      this.typingUsers = this.typingUsers.filter(
        user => user.socketId !== socketId,
      );
    }
    return this.typingUsers;
  }
}

module.exports = Users;
