const crypto = require("crypto");

const otpRepository = require("./otp.repository");

const {
  hashPassword,
  comparePassword,
} = require("../../utils/password");

const AppError = require("../../utils/app-error");

const emailService = require("../../services/email.service");



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

    // Generate new OTP
    const code = this.generateOtp();

    // Development OTP
    if (process.env.NODE_ENV === "development") {
      console.log("=================================");
      console.log("DEV OTP:", code);
      console.log("User ID:", userId);
      console.log("=================================");
    }

    // Hash OTP before storing
    const hashedCode =
      await hashPassword(code);

    // OTP expires in 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Save OTP
    await otpRepository.create({
      userId,
      code: hashedCode,
      expiresAt,
      attempts: 0,
    });

    // Return plaintext OTP
    return {
      code,
      expiresAt,
    };
  }

  // ==========================================
  // RESEND OTP
  // ==========================================

  async resendOtp(userId, email) {
  try {
    // 1. Delete previous OTP
    await otpRepository.deleteByUserId(userId);

    // 2. Generate new OTP
    const code = this.generateOtp();

    // 3. Hash OTP before storing
    const hashedCode =
      await hashPassword(code);

    // 4. OTP expires after 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // 5. Store hashed OTP
    await otpRepository.create({
      userId,
      code: hashedCode,
      expiresAt,
      attempts: 0,
    });

    // 6. Send plaintext OTP to email
    await emailService.sendOtpEmail(
      email,
      code
    );

    // 7. Development logging
    if (process.env.NODE_ENV !== "production") {
      console.log("=================================");
      console.log("RESEND DEV OTP:", code);
      console.log("User ID:", userId);
      console.log("=================================");
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

    // 1. Find latest OTP
    const otpRecord =
      await otpRepository.findLatestByUserId(
        userId
      );

    // 2. OTP not found
    if (!otpRecord) {
      throw new AppError(
        "OTP not found or expired",
        400
      );
    }

    // 3. Check expiration
    if (
      otpRecord.expiresAt < new Date()
    ) {

      await otpRepository.deleteByUserId(
        userId
      );

      throw new AppError(
        "OTP has expired",
        400
      );
    }

    // 4. Maximum attempts
    if (otpRecord.attempts >= 5) {

      await otpRepository.deleteByUserId(
        userId
      );

      throw new AppError(
        "Too many incorrect OTP attempts",
        429
      );
    }

    // 5. Compare entered OTP
    // enteredCode = plain OTP
    // otpRecord.code = bcrypt hash

    const isValid =
      await comparePassword(
        enteredCode,
        otpRecord.code
      );

    // 6. Wrong OTP
    if (!isValid) {

      otpRecord.attempts += 1;

      await otpRecord.save();

      throw new AppError(
        "Invalid OTP",
        400
      );
    }

    // 7. Correct OTP
    await otpRepository.deleteByUserId(
      userId
    );

    return true;
  }
}

module.exports = new OtpService();

