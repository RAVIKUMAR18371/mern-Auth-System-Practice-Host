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

  // FIND USER BY PHONE
  async findByPhone(phone) {
    return User.findOne({ phone: phone.trim() });
  }

  // FIND USER BY EMAIL OR PHONE
  async findByEmailOrPhone(identifier) {
    if (!identifier) return null;
    const clean = String(identifier).trim();
    const digits = clean.replace(/\D/g, "");

    const phoneVariants = [
      clean,
      digits,
      digits.length === 10 ? "+91" + digits : "",
      digits.length === 12 && digits.startsWith("91") ? "+" + digits : "",
      digits.length === 11 && digits.startsWith("0") ? "+91" + digits.substring(1) : ""
    ].filter(Boolean);

    return User.findOne({
      $or: [
        { email: clean.toLowerCase() },
        { phone: { $in: phoneVariants } }
      ]
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