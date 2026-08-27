const express = require("express");

const router = express.Router();

const loginHistoryController = require("../login-history/login-history.controller");

const passwordResetController = require("../password-reset/password-reset.controller");

const authController = require("./auth.controller");

const {
  authenticate,
} = require("../../middlewares/auth.middlewares");

const {
  authorize,
} = require("../../middlewares/authorization.middlewares");

// REGISTER
router.post(
  "/register",
  authController.register.bind(authController)
);

// Refresh access Token --> i am taking
router.post(
  "/refresh",
  authController.refresh.bind(authController)
);

// Adding the Logout Route
router.post(
  "/logout",
  authController.logout.bind(
    authController
  )
);

// LOGIN
router.post(
  "/login",
  authController.login.bind(authController)
);

// VERIFY OTP
router.post(
  "/verify-otp",
  authController.verifyOtp.bind(authController)
);

// RESEND OTP
router.post(
  "/resend-otp",
  authController.resendOtp.bind(
    authController
  )
);

// CURRENT USER
router.get(
  "/me",
  authenticate,
  authController.me.bind(authController)
);


router.get(
  "/sessions",
  authenticate,
  authController.getSessions.bind(authController)
);

// Revoke all other active sessions
router.delete(
  "/sessions",
  authenticate,
  authController.revokeOtherSessions.bind(authController)
);

// Revoke specific session by ID
router.delete(
  "/sessions/:sessionId",
  authenticate,
  authController.revokeSession.bind(authController)
);

// ADMIN ONLY
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  authController.adminTest.bind(authController)
);

//
// LOGIN HISTORY ROUTES
//

// Get complete login history
router.get(
  "/login-history",
  authenticate,
  loginHistoryController.getLoginHistory.bind(
    loginHistoryController
  )
);

// Get recent login history
router.get(
  "/login-history/recent",
  authenticate,
  loginHistoryController.getRecentLoginHistory.bind(
    loginHistoryController
  )
);

// Clear login history
router.delete(
  "/login-history",
  authenticate,
  loginHistoryController.clearLoginHistory.bind(
    loginHistoryController
  )
);


// PASSWORD RESET ROUTES

// Forgot Password
router.post(
  "/forgot-password",
  passwordResetController.forgotPassword.bind(
    passwordResetController
  )
);

// Verify Password Reset OTP
router.post(
  "/verify-reset-otp",
  passwordResetController.verifyResetOtp.bind(
    passwordResetController
  )
);

// Reset Password with OTP
router.post(
  "/reset-password",
  passwordResetController.resetPassword.bind(
    passwordResetController
  )
);

module.exports = router;