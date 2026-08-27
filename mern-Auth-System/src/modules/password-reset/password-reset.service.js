const crypto = require("crypto");

const passwordResetRepository = require("./password-reset.repository");
const userService = require("../user/user.service");
const userRepository = require("../user/user.repository");
const sessionService = require("../session/session.service");

const {
  hashPassword,
  comparePassword,
} = require("../../utils/password");

const { sendOtpEmail } = require("../../services/email.service");

const AppError = require("../../utils/app-error");

class PasswordResetService {
  
  // GENERATE 6-DIGIT RESET OTP
  generateResetOtp() {
    return crypto
      .randomInt(100000, 1000000)
      .toString();
  }


  // CREATE PASSWORD RESET OTP
  
  async createResetOtp(userId, email) {
    // 1. Invalidate previous reset requests
    await passwordResetRepository.invalidatePreviousTokens(
      userId
    );

    // 2. Generate new 6-digit OTP
    const otp = this.generateResetOtp();

    // 3. Hash OTP before storing
    const hashedOtp = await hashPassword(otp);

    // 4. OTP expires after 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // 5. Save reset record
    await passwordResetRepository.create({
      userId,
      token: hashedOtp,
      expiresAt,
      isUsed: false,
      attempts: 0,
    });

    // 6. Send OTP to email
    await sendOtpEmail(email, otp);

    // Development-only logging
    if (process.env.NODE_ENV !== "production") {
      console.log("=================================");
      console.log("PASSWORD RESET OTP:", otp);
      console.log("USER ID:", userId);
      console.log("EMAIL:", email);
      console.log("=================================");
    }

    return {
      expiresAt,
    };
  }

  // Helper to resolve user by identifier (email or userId)
  async resolveUser(identifier) {
    if (!identifier) return null;
    if (typeof identifier === "string" && identifier.includes("@")) {
      return await userService.getUserByEmail(identifier);
    }
    try {
      const user = await userService.getUserById(identifier);
      if (user) return user;
    } catch (e) {
      // ignore ObjectId cast error if string is not ObjectId
    }
    return await userService.getUserByEmailOrPhone(identifier);
  }

  // VERIFY PASSWORD RESET OTP
  
  async verifyResetOtp(identifier, enteredOtp) {
    const user = await this.resolveUser(identifier);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const userId = user._id;

    // 1. Find latest active reset OTP
    const resetRecord =
      await passwordResetRepository.findLatestByUserId(
        userId
      );

    if (!resetRecord) {
      throw new AppError(
        "Reset OTP not found or expired",
        400
      );
    }

    // 2. Check maximum attempts
    if (resetRecord.attempts >= 5) {
      await passwordResetRepository.markAsUsed(
        resetRecord._id
      );

      throw new AppError(
        "Too many incorrect OTP attempts",
        429
      );
    }

    // 3. Check expiry
    if (resetRecord.expiresAt < new Date()) {
      await passwordResetRepository.markAsUsed(
        resetRecord._id
      );

      throw new AppError(
        "Reset OTP has expired",
        400
      );
    }

    // 4. Compare entered OTP with stored hash
    const isValid = await comparePassword(
      enteredOtp,
      resetRecord.token
    );

    // 5. Invalid OTP
    if (!isValid) {
      resetRecord.attempts += 1;

      await resetRecord.save();

      throw new AppError(
        "Invalid reset OTP",
        400
      );
    }

    return { success: true, userId, email: user.email };
  }

  // RESET PASSWORD WITH OTP
  async resetPassword(identifier, otp, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new AppError("Password must be at least 6 characters long", 400);
    }

    const user = await this.resolveUser(identifier);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userId = user._id;

    // 1. Find latest active reset record
    const resetRecord = await passwordResetRepository.findLatestByUserId(userId);
    if (!resetRecord) {
      throw new AppError("Reset OTP not found or expired", 400);
    }

    // 2. Check attempts and expiry
    if (resetRecord.attempts >= 5) {
      await passwordResetRepository.markAsUsed(resetRecord._id);
      throw new AppError("Too many incorrect OTP attempts", 429);
    }

    if (resetRecord.expiresAt < new Date()) {
      await passwordResetRepository.markAsUsed(resetRecord._id);
      throw new AppError("Reset OTP has expired", 400);
    }

    // 3. Verify OTP
    const isValid = await comparePassword(otp, resetRecord.token);
    if (!isValid) {
      resetRecord.attempts += 1;
      await resetRecord.save();
      throw new AppError("Invalid reset OTP", 400);
    }

    // 4. Hash new password and update user record
    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = await userRepository.findById(userId);
    updatedUser.password = hashedPassword;
    await updatedUser.save();

    // 5. Mark reset record as used
    await passwordResetRepository.markAsUsed(resetRecord._id);

    // 6. Invalidate all existing sessions for security
    await sessionService.revokeAllSessions(userId);

    return true;
  }

  
  // INVALIDATE ALL RESET REQUESTS
  
  async invalidateResetRequests(userId) {
    return await passwordResetRepository.invalidatePreviousTokens(
      userId
    );
  }
}

module.exports = new PasswordResetService();