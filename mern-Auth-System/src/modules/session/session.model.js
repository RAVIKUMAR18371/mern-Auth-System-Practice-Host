const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshToken: {
      type: String,
      required: true,
      unique: true,
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

    ipAddress: {
      type: String,
      default: "Unknown",
    },

    userAgent: {
      type: String,
      default: "Unknown",
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revoked: {
      type: Boolean,
      default: false,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports =
  mongoose.model("Session", sessionSchema);