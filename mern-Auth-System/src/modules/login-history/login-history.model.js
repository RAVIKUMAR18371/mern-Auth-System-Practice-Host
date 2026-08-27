const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },

    ipAddress: {
      type: String,
      default: "Unknown",
    },

    userAgent: {
      type: String,
      default: "Unknown",
    },

    device: {
      type: String,
      default: "Unknown",
    },

    browser: {
      type: String,
      default: "Unknown",
    },

    operatingSystem: {
      type: String,
      default: "Unknown",
    },

    failureReason: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model(
  "LoginHistory",
  loginHistorySchema
);