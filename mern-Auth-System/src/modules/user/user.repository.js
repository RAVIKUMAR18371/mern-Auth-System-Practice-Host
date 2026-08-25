const User = require("./user.model");

class UserRepository {
  // CREATE USER
  async create(userData) {
    return User.create(userData);
  }

  // FIND USER BY EMAIL
  async findByEmail(email) {
    return User.findOne({
      email: email.toLowerCase(),
    });
  }

  // FIND USER BY ID
  async findById(userId) {
    return User.findById(userId);
  }

  // MARK USER AS VERIFIED
  async markAsVerified(userId) {
    return User.findByIdAndUpdate(
      userId,
      {
        isVerified: true,
        emailVerifiedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }
}

module.exports = new UserRepository();