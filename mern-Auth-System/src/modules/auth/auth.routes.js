const express = require("express");

const router = express.Router();

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




// ADMIN ONLY
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  authController.adminTest.bind(authController)
);

module.exports = router;