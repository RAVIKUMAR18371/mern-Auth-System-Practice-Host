const OTP = require("./otp.model");

class OTPRepository {

  // Create OTP
  async create(data) {
    return await OTP.create(data);
  }

  // Find latest OTP for a user
  async findLatestByUserId(userId) {
    return await OTP.findOne({
      userId: userId,
      expiresAt: {
        $gt: new Date(),
      },
    }).sort({
      createdAt: -1,
    });
  }

  // Mark OTP as used
  async markAsUsed(otpId) {
    return await OTP.findByIdAndUpdate(
      otpId,
      {
        isUsed: true,
      },
      {
        new: true,
      }
    );
  }

  // Delete all previous OTPs
  async deleteByUserId(userId) {
    return await OTP.deleteMany({
      userId,
    });
  }

  // Invalidate previous OTPs
  async invalidatePreviousOtps(userId) {
    return await OTP.deleteMany({
      userId,
    });
  }
}

module.exports = new OTPRepository();