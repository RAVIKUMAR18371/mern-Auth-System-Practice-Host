const LoginHistory = require("./login-history.model");

class LoginHistoryRepository {
  // Create a new login history record
  async create(data) {
    return await LoginHistory.create(data);
  }

  // Get all login history records for a user
  async findByUserId(userId) {
    return await LoginHistory.find({
      userId,
    }).sort({
      createdAt: -1,
    });
  }

  // Get recent login history
  async findRecentByUserId(userId, limit = 10) {
    return await LoginHistory.find({
      userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(limit);
  }

  // Delete old login history records
  async deleteByUserId(userId) {
    return await LoginHistory.deleteMany({
      userId,
    });
  }
}

module.exports = new LoginHistoryRepository();