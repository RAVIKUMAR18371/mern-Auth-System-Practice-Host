const PasswordReset = require("./password-reset.model");

class PasswordResetRepository {
  // CREATE RESET RECORD
  async create(data) {
    return await PasswordReset.create(data);
  }


  // FIND ACTIVE RESET RECORD
  
  async findLatestByUserId(userId) {
    return await PasswordReset.findOne({
      userId,
      isUsed: false,
      expiresAt: {
        $gt: new Date(),
      },
    }).sort({
      createdAt: -1,
    });
  }

  
  // MARK RESET TOKEN AS USED
  async markAsUsed(resetId) {
    return await PasswordReset.findByIdAndUpdate(
      resetId,
      {
        isUsed: true,
      },
      {
        new: true,
      }
    );
  }


  // INVALIDATE PREVIOUS RESET TOKENS

  async invalidatePreviousTokens(userId) {
    return await PasswordReset.updateMany(
      {
        userId,
        isUsed: false,
      },
      {
        isUsed: true,
      }
    );
  }


  // DELETE RESET RECORDS FOR USER
  
  async deleteByUserId(userId) {
    return await PasswordReset.deleteMany({
      userId,
    });
  }
}

module.exports = new PasswordResetRepository();