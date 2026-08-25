const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // 3. Extract JWT
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // 4. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    // 5. Store decoded user information
    // for controllers and authorization middleware
    req.user = decoded;

    // 6. Continue to next middleware/controller
    next();

  } catch (error) {
    console.error(
      "Authentication Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

module.exports = {
  authenticate,
};