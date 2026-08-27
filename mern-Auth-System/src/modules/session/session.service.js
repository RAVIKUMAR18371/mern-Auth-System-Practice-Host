const sessionRepository =
  require("./session.repository");
const { parseRequestMetadata } = require("../../utils/user-agent");

class SessionService {

  async createSession(
    userId,
    refreshToken,
    expiresAt,
    metadataOrReq = {}
  ) {
    const isReqObj = metadataOrReq && (metadataOrReq.headers || metadataOrReq.ip || metadataOrReq.get);
    const parsedMetadata = isReqObj ? parseRequestMetadata(metadataOrReq) : metadataOrReq;

    return await sessionRepository.create({
      userId,
      refreshToken,
      expiresAt,

      device:
        parsedMetadata.device || "Unknown",

      browser:
        parsedMetadata.browser || "Unknown",

      operatingSystem:
        parsedMetadata.operatingSystem ||
        "Unknown",

      ipAddress:
        parsedMetadata.ipAddress || "Unknown",

      userAgent:
        parsedMetadata.userAgent || "Unknown",

      lastActiveAt: new Date(),

      revoked: false,
    });
  }

  async findByRefreshToken(refreshToken) {
    return await sessionRepository
      .findByRefreshToken(refreshToken);
  }

  async getUserSessions(userId) {
    return await sessionRepository
      .findByUserId(userId);
  }

  async revokeSession(refreshToken) {
    return await sessionRepository
      .revokeByRefreshToken(refreshToken);
  }

  async revokeSessionById(
    sessionId,
    userId
  ) {
    return await sessionRepository
      .revokeById(sessionId, userId);
  }

  async revokeAllSessions(userId) {
    return await sessionRepository
      .revokeAllByUserId(userId);
  }

  async revokeOtherSessions(userId, currentRefreshToken) {
    return await sessionRepository
      .revokeOtherSessions(userId, currentRefreshToken);
  }

  async updateLastActive(sessionId) {
    return await sessionRepository
      .updateLastActive(sessionId);
  }
}

module.exports =
  new SessionService();