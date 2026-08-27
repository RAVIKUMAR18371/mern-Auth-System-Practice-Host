const loginHistoryService = require("./login-history.service");

class LoginHistoryController {
  // GET LOGIN HISTORY
 
  async getLoginHistory(req, res) {
    try {
      // User ID comes from authenticate middleware
      const userId = req.user.userId;

      const history =
        await loginHistoryService.getLoginHistory(
          userId
        );

      return res.status(200).json({
        success: true,
        message:
          "Login history fetched successfully",
        data: {
          history,
        },
      });
    } catch (error) {
      console.error(
        "Get Login History Error:",
        error
      );

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch login history",
      });
    }
  }

  
  // GET RECENT LOGIN HISTORY
  
  async getRecentLoginHistory(req, res) {
    try {
      const userId = req.user.userId;

      const limit = Number(req.query.limit) || 10;

      const history =
        await loginHistoryService.getRecentLoginHistory(
          userId,
          limit
        );

      return res.status(200).json({
        success: true,
        message:
          "Recent login history fetched successfully",
        data: {
          history,
        },
      });
    } catch (error) {
      console.error(
        "Get Recent Login History Error:",
        error
      );

      return res.status(
        error.statusCode || 500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch recent login history",
      });
    }
  }

  // CLEAR LOGIN HISTORY
  async clearLoginHistory(req, res) {
    try {
      const userId = req.user.userId;

      await loginHistoryService.deleteLoginHistory(userId);

      return res.status(200).json({
        success: true,
        message: "Login history cleared successfully",
      });
    } catch (error) {
      console.error("Clear Login History Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to clear login history",
      });
    }
  }
}

module.exports = new LoginHistoryController();