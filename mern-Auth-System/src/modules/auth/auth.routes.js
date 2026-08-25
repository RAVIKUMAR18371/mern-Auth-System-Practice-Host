const express = require("express");

const authController =
  require("./auth.controller");

const router = express.Router();

router.post(
  "/register",
  authController.register.bind(authController)
);

router.post(
  "/verify-otp",
  authController.verifyOtp.bind(authController)
);

router.post(
  "/login",
  authController.login.bind(authController)
);

module.exports = router;