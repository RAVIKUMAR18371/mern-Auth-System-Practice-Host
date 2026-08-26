const crypto = require("crypto");

const otpRepository = require("./otp.repository");
const {generateOtp} = require("../../utils/otp")
const {
  hashPassword,
  comparePassword,
} = require("../../utils/password");

const AppError = require("../../utils/app-error");

class OtpService {
  // ==========================================
  // GENERATE OTP
  // ==========================================

  generateOtp() {
    return crypto
      .randomInt(100000, 1000000)
      .toString();
  }

  // ==========================================
  // CREATE OTP
  // ==========================================

  async createOtp(userId) {
    // Delete previous OTP
    await otpRepository.deleteByUserId(userId);

    // Generate new 6-digit OTP
    const code = this.generateOtp();

    // Development-only OTP logging
    // NEVER use this in production
    if (process.env.NODE_ENV === "development") {
      console.log("=================================");
      console.log("DEV OTP:", code);
      console.log("User ID:", userId);
      console.log("=================================");
    }

    // Hash OTP before storing in database
    const hashedCode = await hashPassword(code);

    // OTP expires after 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Store hashed OTP
    await otpRepository.create({
      userId,
      code: hashedCode,
      expiresAt,
      attempts: 0,
    });

    // Return plaintext OTP to controller
    // so it can be sent through email in production
    return {
      code,
      expiresAt,
    };
  }

  //==========================
  // Resend OTP
  // ===========================
  async resendOtp(userId, email) {
  try {

    // 1. Invalidate old OTPs
    await otpRepository.invalidatePreviousOtps(
      userId
    );

    // 2. Generate new OTP
    const otp = generateOtp();

    // 3. Set expiry
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // 4. Save new OTP
    await otpRepository.create({
      userId,
      otp,
      expiresAt,
      isUsed: false,
    });

    // 5. Send OTP
    await emailService.sendOtpEmail(
      email,
      otp
    );

    // 6. Development logging
    if (
      process.env.NODE_ENV !== "production"
    ) {
      console.log(
        `DEV OTP: ${otp}`
      );

      console.log(
        `User ID: ${userId}`
      );
    }

    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Resend OTP error:",
      error
    );

    throw error;
  }
}

  // ==========================================
  // VERIFY OTP
  // ==========================================

  async verifyOtp(userId, enteredCode) {
    // Find latest OTP
    const otp =
      await otpRepository.findLatestByUserId(
        userId
      );

    // OTP doesn't exist
    if (!otp) {
      throw new AppError(
        "OTP not found or expired",
        400
      );
    }

    // Check OTP expiration
    if (otp.expiresAt < new Date()) {
      await otpRepository.deleteByUserId(userId);

      throw new AppError(
        "OTP has expired",
        400
      );
    }

    // Maximum 5 attempts
    if (otp.attempts >= 5) {
      await otpRepository.deleteByUserId(userId);

      throw new AppError(
        "Too many incorrect OTP attempts",
        429
      );
    }

    // Compare entered OTP with bcrypt hash
    const isValid = await comparePassword(
      enteredCode,
      otp.code
    );

    // Wrong OTP
    if (!isValid) {
      otp.attempts += 1;

      await otp.save();

      throw new AppError(
        "Invalid OTP",
        400
      );
    }

    // Correct OTP
    await otpRepository.deleteByUserId(userId);

    return true;
  }
}

module.exports = new OtpService();






















/*
const crypto = require("crypto");

const otpRepository = require("./otp.repository");

const {
  hashPassword,
  comparePassword,
} = require("../../utils/password");

const AppError = require("../../utils/app-error");

class OtpService {
  generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  }

  async createOtp(userId) {
    // Remove previous OTP
    await otpRepository.deleteByUserId(userId);

    // Generate new OTP
    const code = this.generateOtp();

    // Hash OTP before storing
    const hashedCode = await hashPassword(code);

    // OTP expires after 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await otpRepository.create({
      userId,
      code: hashedCode,
      expiresAt,
      attempts: 0,
    });

    // Return plaintext OTP ONLY to the email service
    return {
      code,
      expiresAt,
    };
  }

  async verifyOtp(userId, enteredCode) {
    const otp = await otpRepository.findLatestByUserId(userId);

    if (!otp) {
      throw new AppError(
        "OTP not found or expired",
        400
      );
    }

    // Check expiration
    if (otp.expiresAt < new Date()) {
      await otpRepository.deleteByUserId(userId);

      throw new AppError(
        "OTP has expired",
        400
      );
    }

    // Maximum 5 attempts
    if (otp.attempts >= 5) {
      await otpRepository.deleteByUserId(userId);

      throw new AppError(
        "Too many incorrect OTP attempts",
        429
      );
    }

    // Compare entered OTP with bcrypt hash
    const isValid = await comparePassword(
      enteredCode,
      otp.code
    );

    if (!isValid) {
      otp.attempts += 1;

      await otp.save();

      throw new AppError(
        "Invalid OTP",
        400
      );
    }

    // Correct OTP
    await otpRepository.deleteByUserId(userId);

    return true;
  }
}

module.exports = new OtpService();
*/