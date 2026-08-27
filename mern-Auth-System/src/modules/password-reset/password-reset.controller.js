const userService = require("../user/user.service");

const passwordResetService = require("./password-reset.service");

class PasswordResetController {
  
  // FORGOT PASSWORD
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // 1. Validate email
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // 2. Find user
      const user =
        await userService.getUserByEmail(email);

      // IMPORTANT:
      // Don't reveal whether an email exists
      // in a production authentication system.
      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            "If an account exists with this email, a password reset OTP has been sent.",
        });
      }

      // 3. Generate and send reset OTP
      const reset =
        await passwordResetService.createResetOtp(
          user._id,
          user.email
        );

      // 4. Response
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset OTP has been sent.",
        data: {
          otpExpiresAt: reset.expiresAt,
        },
      });
    } catch (error) {
      console.error(
        "Forgot Password Controller Error:",
        error
      );

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to process forgot password request",
      });
    }
  }

  
  // VERIFY RESET OTP
  
  async verifyResetOtp(req, res) {
    try {
      const { userId, email, identifier, otp } = req.body;
      const targetIdentifier = userId || email || identifier;

      // 1. Validate input
      if (!targetIdentifier || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "User identifier (email or userId) and OTP are required",
        });
      }

      // 2. Verify OTP
      const result = await passwordResetService.verifyResetOtp(
        targetIdentifier,
        otp
      );

      // 3. Success
      return res.status(200).json({
        success: true,
        message:
          "Password reset OTP verified successfully",
        data: {
          userId: result.userId,
          email: result.email,
        },
      });
    } catch (error) {
      console.error(
        "Verify Reset OTP Controller Error:",
        error
      );

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to verify reset OTP",
      });
    }
  }

  // RESET PASSWORD
  async resetPassword(req, res) {
    try {
      const { userId, email, identifier, otp, newPassword, password } = req.body;
      const targetIdentifier = userId || email || identifier;
      const targetPassword = newPassword || password;

      if (!targetIdentifier || !otp || !targetPassword) {
        return res.status(400).json({
          success: false,
          message: "User identifier, OTP, and new password are required",
        });
      }

      await passwordResetService.resetPassword(
        targetIdentifier,
        otp,
        targetPassword
      );

      return res.status(200).json({
        success: true,
        message: "Password reset successfully. You can now login with your new password.",
      });
    } catch (error) {
      console.error("Reset Password Controller Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to reset password",
      });
    }
  }
}

module.exports = new PasswordResetController();