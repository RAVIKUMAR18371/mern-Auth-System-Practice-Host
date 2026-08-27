const userService = require("../user/user.service");

const otpService = require("../otp/otp.service");

const registrationVerificationService =
  require("../otp/registration-verification.service");

const {
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/refresh-token");

const sessionService =
  require("../session/session.service");

const loginHistoryService = require("../login-history/login-history.service");
  
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
  generateAccessToken,
} = require("../../utils/jwt");


class AuthController {

  // =====================================================
  // REFRESH ACCESS TOKEN
  // =====================================================

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

      // Verify refresh JWT
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
          message:
            "Session expired or revoked",
        });
      }

      // Update last active time for this session
      await sessionService.updateLastActive(session._id);

      // Generate new access token
      const accessToken =
        generateAccessToken({
          userId: decoded.userId,
          role: decoded.role,
        });

      return res.status(200).json({
        success: true,
        message:
          "Access token refreshed successfully",

        data: {
          accessToken,
        },
      });

    } catch (error) {

      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired refresh token",
      });
    }
  }


  // =====================================================
  // RESEND EXISTING USER OTP
  // =====================================================

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

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to resend OTP",
      });
    }
  }


  // =====================================================
  // LOGOUT
  // =====================================================

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
      res.clearCookie(
        "refreshToken",
        {
          httpOnly: true,

          secure:
            process.env.NODE_ENV ===
            "production",

          sameSite: "strict",
        }
      );

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


  // =====================================================
  // REGISTER
  // =====================================================

  async register(req, res) {

    try {

      // =================================================
      // 1. VALIDATE REGISTRATION DATA
      // =================================================

      const { error, value } =
        validateCreateUser(req.body);

      if (error) {

        return res.status(400).json({
          success: false,
          message: "Validation failed",

          errors:
            error.details.map(
              (detail) =>
                detail.message
            ),
        });
      }


      // =================================================
      // 2. CHECK EMAIL + PHONE VERIFICATION
      // =================================================

      /*
        IMPORTANT:

        User must verify BOTH:

        Email → Nodemailer OTP
        Phone → Twilio OTP

        BEFORE we create the actual user.
      */

      const verification =
        await registrationVerificationService
          .checkBothVerified(
            value.email
          );


      // =================================================
      // 3. CREATE USER
      // =================================================

      const user =
        await userService.createUser({
          ...value,
          phone: verification?.phone || req.body.phone
        });


      // =================================================
      // 4. REGISTRATION SUCCESS
      // =================================================

      return res.status(201).json({

        success: true,

        message:
          "User registered successfully",

        data: {
          user,
        },
      });

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

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


  // =====================================================
  // OLD USER EMAIL OTP VERIFICATION
  // =====================================================

  async verifyOtp(req, res) {

    try {

      // Validate OTP request
      const { error, value } =
        validateVerifyOtp(req.body);

      if (error) {

        return res.status(400).json({
          success: false,
          message: "Validation failed",

          errors:
            error.details.map(
              (detail) =>
                detail.message
            ),
        });
      }


      // Verify OTP
      await otpService.verifyOtp(
        value.userId,
        value.code
      );


      // Mark user as verified
      const user =
        await userService.markUserAsVerified(
          value.userId
        );


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


  // Get Session
  async getSessions(req, res) {
  try {

    const refreshToken =
      req.cookies.refreshToken;

    const sessions =
      await sessionService.getUserSessions(
        req.user.userId
      );

    const formattedSessions =
      sessions.map((session) => ({
        sessionId: session._id,

        device: session.device,

        browser: session.browser,

        operatingSystem:
          session.operatingSystem,

        ipAddress:
          session.ipAddress,

        lastActiveAt:
          session.lastActiveAt,

        createdAt:
          session.createdAt,

        current:
          session.refreshToken ===
          refreshToken,
      }));

    return res.status(200).json({
      success: true,
      message:
        "Active sessions fetched successfully",
      data: {
        sessions: formattedSessions,
      },
    });

  } catch (error) {

    console.error(
      "Get sessions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch active sessions",
    });
  }
}

  // Revoke Specific Session
  async revokeSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.userId;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
      }

      const revokedSession = await sessionService.revokeSessionById(sessionId, userId);

      if (!revokedSession) {
        return res.status(404).json({
          success: false,
          message: "Session not found or already revoked",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Session revoked successfully",
      });
    } catch (error) {
      console.error("Revoke session error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to revoke session",
      });
    }
  }

  // Revoke All Other Sessions
  async revokeOtherSessions(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const userId = req.user.userId;

      await sessionService.revokeOtherSessions(userId, refreshToken);

      return res.status(200).json({
        success: true,
        message: "All other sessions revoked successfully",
      });
    } catch (error) {
      console.error("Revoke other sessions error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to revoke other sessions",
      });
    }
  }

  // =====================================================
  // LOGIN
  // =====================================================
async login(req, res) {
  try {
    // ==========================================
    // 1. VALIDATE LOGIN DATA
    // ==========================================
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

    // ==========================================
    // 2. FIND USER (By Email, Phone, or Identifier)
    // ==========================================
    const identifier = value.email || value.phone || value.identifier;
    const user =
      await userService.getUserByEmailOrPhone(
        identifier
      );

    // User does not exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // 3. CHECK EMAIL VERIFICATION
    // ==========================================
    if (!user.isVerified) {
      await loginHistoryService.recordLoginAttempt({
        userId: user._id,
        status: "FAILED",
        req,
        failureReason: "Email not verified",
      });

      return res.status(403).json({
        success: false,
        message:
          "Please verify your email first",
      });
    }

    // ==========================================
    // 4. CHECK PASSWORD
    // ==========================================
    const isPasswordValid =
      await userService.validatePassword(
        user,
        value.password
      );

    // Invalid password
    if (!isPasswordValid) {
      // Record failed login
      await loginHistoryService.recordLoginAttempt({
        userId: user._id,
        status: "FAILED",
        req,
        failureReason:
          "Invalid password",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // 5. GENERATE ACCESS TOKEN
    // ==========================================
    const accessToken =
      generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
      });

    // ==========================================
    // 6. GENERATE REFRESH TOKEN
    // ==========================================
    const refreshToken =
      generateRefreshToken({
        userId: user._id.toString(),
        role: user.role,
      });

    // ==========================================
    // 7. CREATE SESSION
    // ==========================================
    const expiresAt = new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    );

    await sessionService.createSession(
      user._id,
      refreshToken,
      expiresAt,
      req
    );

    // ==========================================
    // 8. SET REFRESH TOKEN COOKIE
    // ==========================================
    res.cookie(
      "refreshToken",
      refreshToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "strict",

        maxAge:
          7 * 24 * 60 * 60 * 1000,
      }
    );

    // ==========================================
    // 9. RECORD SUCCESSFUL LOGIN
    // ==========================================
    await loginHistoryService.recordLoginAttempt({
      userId: user._id,
      status: "SUCCESS",
      req,
    });

    // ==========================================
    // 10. RETURN RESPONSE
    // ==========================================
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
    console.error(
      "Login controller error:",
      error
    );

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


  // =====================================================
  // GET CURRENT USER
  // =====================================================

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

        message:
          "User profile fetched successfully",

        data: {

          user: {

            id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,

            isVerified:
              user.isVerified,
          },
        },
      });

    } catch (error) {

      console.error(
        "Get Me Error:",
        error
      );

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


  
  // ADMIN AUTHORIZATION TEST// 

  async adminTest(req, res) {

    return res.status(200).json({

      success: true,

      message:
        "Admin authorization successful",

      data: {

        userId:
          req.user.userId,

        role:
          req.user.role,
      },
    });
  }
}


module.exports =
  new AuthController();