const userService = require("../user/user.service");
const otpService = require("../otp/otp.service");

const {
  validateCreateUser,
} = require("../../validators/user.validators");

const {
  validateVerifyOtp,
} = require("../../validators/otp.validator");

const {
  validateLogin,
} = require("../../validators/auth.validators");

const {
  sendOtpEmail,
} = require("../../services/email.service");

const {
  generateAccessToken,
} = require("../../utils/jwt");

class AuthController {

  async register(req, res) {
    try {
      // 1. Validate registration data
      const { error, value } =
        validateCreateUser(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map(
            (detail) => detail.message
          ),
        });
      }

      // 2. Create user
      const user =
        await userService.createUser(value);

      // 3. Generate OTP
      const otp =
        await otpService.createOtp(user.id);

  
  await sendOtpEmail(
    user.email,
    otp.code
  );


      // 5. Send response
      return res.status(201).json({
        success: true,
        message:
          "User registered successfully. OTP sent to email.",
        data: {
          user,
          otpExpiresAt: otp.expiresAt,
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Internal server error",
      });
    }
  }

 
  async verifyOtp(req, res) {
    try {
      // 1. Validate OTP request
      const { error, value } =
        validateVerifyOtp(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map(
            (detail) => detail.message
          ),
        });
      }

      // 2. Verify OTP
      await otpService.verifyOtp(
        value.userId,
        value.code
      );

      // 3. Mark user as verified
      const user =
        await userService.markUserAsVerified(
          value.userId
        );

      // 4. Send response
      return res.status(200).json({
        success: true,
        message:
          "Email verified successfully",
        data: user,
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Internal server error",
      });
    }
  }

  async login(req, res) {
    try {
      // 1. Validate login data
      const { error, value } =
        validateLogin(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map(
            (detail) => detail.message
          ),
        });
      }

      // 2. Find user by email
      const user =
        await userService.getUserByEmail(
          value.email
        );

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      // 3. Check email verification
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message:
            "Please verify your email first",
        });
      }

      // 4. Compare entered password
      //    with bcrypt hash in MongoDB
      const isPasswordValid =
        await userService.validatePassword(
          user,
          value.password
        );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      // 5. Generate JWT access token
      const accessToken =
        generateAccessToken({
          userId: user._id.toString(),
          role: user.role,
        });

      // 6. Return successful login response
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          accessToken,

          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Internal server error",
      });
    }
    }
   
    // Get the current user
async me(req, res) {
  try {
    // req.user comes from authenticate middleware
    const user =
      await userService.getUserById(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message || "Internal server error",
    });
  }
    }
    async adminTest(req, res) {
  return res.status(200).json({
    success: true,
    message: "Admin authorization successful",
    data: {
      userId: req.user.userId,
      role: req.user.role,
    },
  });
}
}

module.exports = new AuthController();