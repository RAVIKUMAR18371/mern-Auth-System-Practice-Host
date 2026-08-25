const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically delete OTP after expiration
otpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("OTP", otpSchema);