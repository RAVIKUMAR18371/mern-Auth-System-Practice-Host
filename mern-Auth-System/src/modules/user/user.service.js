const userRepository = require("./user.repository");
const {
  hashPassword,
  comparePassword,
} = require("../../utils/password");

const AppError = require("../../utils/app-error");
const {
  toUserResponse,
} = require("../../utils/user-response");

class UserService {
  async createUser(userData) {
    const existingUser =
      await userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        409
      );
    }

    const hashedPassword =
      await hashPassword(userData.password);

    const user = await userRepository.create({
      ...userData,
      password: hashedPassword,
      isVerified: true,
      emailVerifiedAt: new Date(),
    });

    return toUserResponse(user);
  }

  async getUserByEmail(email) {
    return userRepository.findByEmail(email);
  }

  async getUserByEmailOrPhone(identifier) {
    return userRepository.findByEmailOrPhone(identifier);
  }

  async getUserById(id) {
    return userRepository.findById(id);
  }

  async validatePassword(user, password) {
    return comparePassword(
      password,
      user.password
    );
  }

  async findById(userId) {
    return userRepository.findById(userId);
  }

  async markUserAsVerified(userId) {
    const user =
      await userRepository.markAsVerified(userId);

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    return toUserResponse(user);
  }
}

module.exports = new UserService();