const loginHistoryRepository = require("./login-history.repository");
const {
  parseRequestMetadata,
  getDevice,
  getBrowser,
  getOperatingSystem,
} = require("../../utils/user-agent");

class LoginHistoryService {

  // RECORD LOGIN ATTEMPT
  async recordLoginAttempt({
    userId,
    status,
    req,
    failureReason = null,
  }) {
    const meta = parseRequestMetadata(req);

    const loginHistory = {
      userId,
      status,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      device: meta.device,
      browser: meta.browser,
      operatingSystem: meta.operatingSystem,
      failureReason,
    };

    return await loginHistoryRepository.create(
      loginHistory
    );
  }

  // GET LOGIN HISTORY
 
  async getLoginHistory(userId) {
    return await loginHistoryRepository.findByUserId(
      userId
    );
  }


  // GET RECENT LOGIN HISTORY
 
  async getRecentLoginHistory(
    userId,
    limit = 10
  ) {
    return await loginHistoryRepository.findRecentByUserId(
      userId,
      limit
    );
  }

  
  // DELETE LOGIN HISTORY
 
  async deleteLoginHistory(userId) {
    return await loginHistoryRepository.deleteByUserId(
      userId
    );
  }

  
  // DEVICE DETECTION
  getDevice(userAgent) {
    return getDevice(userAgent);
  }

  // BROWSER DETECTION
  
  getBrowser(userAgent) {
    return getBrowser(userAgent);
  }

  
  // OPERATING SYSTEM DETECTION

  getOperatingSystem(userAgent) {
    return getOperatingSystem(userAgent);
  }
}

module.exports = new LoginHistoryService();