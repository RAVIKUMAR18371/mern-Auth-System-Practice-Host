const crypto = require("crypto");

// Generate a secure random reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash reset token before storing in database
const hashResetToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

module.exports = {
  generateResetToken,
  hashResetToken,
};