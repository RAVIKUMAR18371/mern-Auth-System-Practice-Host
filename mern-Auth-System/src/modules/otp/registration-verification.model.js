const mongoose = require("mongoose");

const registrationVerificationSchema =
  new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      emailOtpHash: {
        type: String,
        default: null,
      },

      phoneOtpHash: {
        type: String,
        default: null,
      },

      emailOtpExpiresAt: {
        type: Date,
        default: null,
      },

      phoneOtpExpiresAt: {
        type: Date,
        default: null,
      },

      emailVerified: {
        type: Boolean,
        default: false,
      },

      phoneVerified: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

// Automatically delete abandoned
// verification records after 30 minutes.
registrationVerificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 1800 }
);

module.exports =
  mongoose.model(
    "RegistrationVerification",
    registrationVerificationSchema
  );