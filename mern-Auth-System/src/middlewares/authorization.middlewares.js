const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Authentication must happen first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check whether user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden",
      });
    }

    // User has permission
    next();
  };
};

module.exports = {
  authorize,
};