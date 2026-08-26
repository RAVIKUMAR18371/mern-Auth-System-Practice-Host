const OTP = require("./otp.model");

class OTPRepository {

  async create(data) {
    return await OTP.create(data);
  }

  async findLatestByUserId(userId) {
    return await OTP.findOne({
      userId,
      isUsed: false,
    }).sort({
      createdAt: -1,
    });
  }

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

  async invalidatePreviousOtps(userId) {
    return await OTP.updateMany(
      {
        userId,
        isUsed: false,
      },
      {
        isUsed: true,
      }
    );
  }

  async deleteByUserId(userId) {
    return await OTP.deleteMany({
      userId,
    });
  }
}



module.exports = new OTPRepository();