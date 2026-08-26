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