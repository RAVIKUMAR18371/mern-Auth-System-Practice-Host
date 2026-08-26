const express = require("express");

const router = express.Router();

const controller =
  require("./registration-verification.controller");

router.post(
  "/send-email-otp",
  controller.sendEmailOtp.bind(controller)
);

router.post(
  "/verify-email",
  controller.verifyEmailOtp.bind(controller)
);

router.post(
  "/send-phone-otp",
  controller.sendPhoneOtp.bind(controller)
);

router.post(
  "/verify-phone",
  controller.verifyPhoneOtp.bind(controller)
);

module.exports = router;