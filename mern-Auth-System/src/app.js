const express = require("express");
const cookieParser = require("cookie-parser");
const registrationVerificationRoutes =
  require("./modules/otp/registration-verification.routes");


const authRoutes = require("./modules/auth/auth.routes");

const app = express();

app.use(express.json());

app.use(cookieParser()); 

app.use(
  "/api/auth/register-verification",
  registrationVerificationRoutes
);

app.use("/api/auth", authRoutes);

module.exports = app;