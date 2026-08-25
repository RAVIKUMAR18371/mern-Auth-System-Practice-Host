const OTP = require("./otp.model");

class OtpRepository {
 
  async create(otpData) {
    return OTP.create(otpData);
  }

  async findLatestByUserId(userId) {
    return OTP.findOne({
      userId,
    }).sort({
      createdAt: -1,
    });
  }


  async deleteByUserId(userId) {
    return OTP.deleteMany({
      userId,
    });
  }
}

module.exports = new OtpRepository();