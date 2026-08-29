const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const registrationVerificationRoutes =
  require("./modules/otp/registration-verification.routes");

const authRoutes = require("./modules/auth/auth.routes");

const app = express();

// CORS configuration - will be updated with frontend URL from env vars
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL || "" // Will be set in Render environment
].filter(Boolean); // Remove empty strings

app.use(cors({
  origin: allowedOrigins,
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