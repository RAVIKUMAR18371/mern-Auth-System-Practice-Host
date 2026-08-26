const registrationService =
  require("./registration-verification.service");

class RegistrationVerificationController {

  async sendEmailOtp(req, res) {

    try {

      const {
        email,
        phone,
      } = req.body;

      if (!email || !phone) {
        return res.status(400).json({
          success: false,
          message:
            "Email and phone are required",
        });
      }

      const result =
        await registrationService.sendEmailOtp(
          email,
          phone
        );

      return res.status(200).json(
        result
      );

    } catch (error) {

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to send email OTP",
      });
    }
  }

  async verifyEmailOtp(req, res) {

    try {

      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "Email and OTP are required",
        });
      }

      const result =
        await registrationService.verifyEmailOtp(
          email,
          otp
        );

      return res.status(200).json(
        result
      );

    } catch (error) {

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to verify email",
      });
    }
  }

  async sendPhoneOtp(req, res) {

    try {

      const {
        email,
        phone,
      } = req.body;

      if (!email || !phone) {
        return res.status(400).json({
          success: false,
          message:
            "Email and phone are required",
        });
      }

      const result =
        await registrationService.sendPhoneOtp(
          email,
          phone
        );

      return res.status(200).json(
        result
      );

    } catch (error) {

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to send phone OTP",
      });
    }
  }

  async verifyPhoneOtp(req, res) {

    try {

      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "Email and OTP are required",
        });
      }

      const result =
        await registrationService.verifyPhoneOtp(
          email,
          otp
        );

      return res.status(200).json(
        result
      );

    } catch (error) {

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to verify phone",
      });
    }
  }
}

module.exports =
  new RegistrationVerificationController();