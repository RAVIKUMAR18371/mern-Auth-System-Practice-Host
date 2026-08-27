const registrationRepository =
  require("./registration-verification.repository");

const userRepository =
  require("../user/user.repository");

const {
  generateOtp,
} = require("../../utils/otp");

const {
  hashPassword,
  comparePassword,
} = require("../../utils/password");

const {
  sendOtpEmail,
} = require("../../services/email.service");

const {
  sendOtpSms,
} = require("../../services/sms.service");

const AppError =
  require("../../utils/app-error");

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return "+" + cleaned;
  }
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.length === 10) {
    return "+91" + cleaned;
  }
  return phone.startsWith("+") ? phone : "+" + cleaned;
};

class RegistrationVerificationService {

  // =====================================================
  // SEND EMAIL OTP
  // =====================================================

  async sendEmailOtp(email, phone) {

    email = email.toLowerCase().trim();
    phone = formatPhoneNumber(phone);
    phone = phone.trim();

    // Check if user already exists
    const existingUser =
      await userRepository.findByEmail(
        email
      );

    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        409
      );
    }

    const otp = generateOtp();

    const otpHash =
      await hashPassword(otp);

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    let verification =
      await registrationRepository.findByEmail(
        email
      );

    if (!verification) {

      verification =
        await registrationRepository.create({
          email,
          phone,
          emailOtpHash: otpHash,
          emailOtpExpiresAt: expiresAt,
          emailVerified: false,
          phoneVerified: false,
        });

    } else {

      verification =
        await registrationRepository.updateById(
          verification._id,
          {
            phone,
            emailOtpHash: otpHash,
            emailOtpExpiresAt: expiresAt,
            emailVerified: false,
          }
        );
    }

    await sendOtpEmail(
      email,
      otp
    );

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        "DEV EMAIL OTP:",
        otp
      );
    }

    return {
      success: true,
      message:
        "Email OTP sent successfully",
    };
  }

  // =====================================================
  // VERIFY EMAIL OTP
  // =====================================================

  async verifyEmailOtp(email, otp) {

    email = email.toLowerCase().trim();

    const verification =
      await registrationRepository.findByEmail(
        email
      );

    if (!verification) {
      throw new AppError(
        "Registration verification not found",
        404
      );
    }

    if (
      !verification.emailOtpHash ||
      !verification.emailOtpExpiresAt
    ) {
      throw new AppError(
        "Email OTP not found",
        400
      );
    }

    if (
      verification.emailOtpExpiresAt <
      new Date()
    ) {
      throw new AppError(
        "Email OTP has expired",
        400
      );
    }

    otp = String(otp).trim();

    const valid =
      await comparePassword(
        otp,
        verification.emailOtpHash
      );

    if (!valid) {
      throw new AppError(
        "Invalid email OTP",
        400
      );
    }

    await registrationRepository.updateById(
      verification._id,
      {
        emailVerified: true,
        emailOtpHash: null,
        emailOtpExpiresAt: null,
      }
    );

    return {
      success: true,
      message:
        "Email verified successfully",
    };
  }

  // =====================================================
  // SEND PHONE OTP
  // =====================================================

  async sendPhoneOtp(email, phone) {

    email = email.toLowerCase().trim();
    phone = formatPhoneNumber(phone);

    const existingUser =
      await userRepository.findByEmail(
        email
      );

    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        409
      );
    }

    const otp = generateOtp();

    const otpHash =
      await hashPassword(otp);

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    let verification =
      await registrationRepository.findByEmail(
        email
      );

    if (!verification) {

      verification =
        await registrationRepository.create({
          email,
          phone,
          phoneOtpHash: otpHash,
          phoneOtpExpiresAt: expiresAt,
        });

    } else {

      verification =
        await registrationRepository.updateById(
          verification._id,
          {
            phone,
            phoneOtpHash: otpHash,
            phoneOtpExpiresAt: expiresAt,
            phoneVerified: false,
          }
        );
    }

    await sendOtpSms(
      phone,
      otp
    );

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        "DEV PHONE OTP:",
        otp
      );
    }

    return {
      success: true,
      message:
        "Phone OTP sent successfully",
    };
  }

  // =====================================================
  // VERIFY PHONE OTP
  // =====================================================

  async verifyPhoneOtp(email, otp) {

    email = email.toLowerCase().trim();

    const verification =
      await registrationRepository.findByEmail(
        email
      );

    if (!verification) {
      throw new AppError(
        "Registration verification not found",
        404
      );
    }

    if (
      !verification.phoneOtpHash ||
      !verification.phoneOtpExpiresAt
    ) {
      throw new AppError(
        "Phone OTP not found",
        400
      );
    }

    if (
      verification.phoneOtpExpiresAt <
      new Date()
    ) {
      throw new AppError(
        "Phone OTP has expired",
        400
      );
    }

    otp = String(otp).trim();

    const valid =
      await comparePassword(
        otp,
        verification.phoneOtpHash
      );

    if (!valid) {
      throw new AppError(
        "Invalid phone OTP",
        400
      );
    }

    await registrationRepository.updateById(
      verification._id,
      {
        phoneVerified: true,
        phoneOtpHash: null,
        phoneOtpExpiresAt: null,
      }
    );

    return {
      success: true,
      message:
        "Phone verified successfully",
    };
  }

  // =====================================================
  // CHECK BOTH VERIFICATIONS
  // =====================================================

  async checkBothVerified(email) {

    email = email.toLowerCase().trim();

    const verification =
      await registrationRepository.findByEmail(
        email
      );

    if (!verification) {
      throw new AppError(
        "Please verify your email and phone first",
        403
      );
    }

    if (!verification.emailVerified) {
      throw new AppError(
        "Please verify your email first",
        403
      );
    }

    if (!verification.phoneVerified) {
      throw new AppError(
        "Please verify your phone first",
        403
      );
    }

    return verification;
  }
}

module.exports =
  new RegistrationVerificationService();