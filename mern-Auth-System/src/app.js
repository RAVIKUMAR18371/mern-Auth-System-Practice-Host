const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const registrationVerificationRoutes =
  require("./modules/otp/registration-verification.routes");

const authRoutes = require("./modules/auth/auth.routes");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());

app.use(cookieParser()); 

app.use(
  "/api/auth/register-verification",
  registrationVerificationRoutes
);

app.use("/api/auth", authRoutes);

module.exports = app;