const userService = require("../user/user.service");
const otpService = require("../otp/otp.service");

const {
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/refresh-token");

const sessionService =
  require("../session/session.service");

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

  async refresh(req, res) {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify JWT
    const decoded =
      verifyRefreshToken(refreshToken);

    // Check session in database
    const session =
      await sessionService.findByRefreshToken(
        refreshToken
      );

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or revoked",
      });
    }

    // Generate new access token
    const accessToken =
      generateAccessToken({
        userId: decoded.userId,
        role: decoded.role,
      });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
  }
  
async resendOtp(req, res) {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const user =
      await userService.getUserByEmail(
        email
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Email is already verified",
      });
    }

    // Generate and send new OTP
    await otpService.resendOtp(
      user._id,
      user.email
    );

    return res.status(200).json({
      success: true,
      message:
        "OTP resent successfully",
    });

  } catch (error) {

    console.error(
      "Resend OTP controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to resend OTP",
    });
  }
}


  // Logout Function
  async logout(req, res) {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    // No refresh token
    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "Already logged out",
      });
    }

    // Revoke session in database
    await sessionService.revokeSession(
      refreshToken
    );

    // Clear refresh-token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}

  
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
      
      const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
       role: user.role,
      });

      const expiresAt = new Date(
       Date.now() + 7 * 24 * 60 * 60 * 1000
        );

    await sessionService.createSession(
     user._id,
     refreshToken,
      expiresAt
      );

      res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
       sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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