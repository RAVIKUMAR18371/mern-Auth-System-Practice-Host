const sessionRepository =
  require("./session.repository");

class SessionService {
  async createSession(
    userId,
    refreshToken,
    expiresAt
  ) {
    return sessionRepository.create({
      userId,
      refreshToken,
      expiresAt,
    });
  }

  async findByRefreshToken(refreshToken) {
    return sessionRepository.findByRefreshToken(
      refreshToken
    );
  }

  async revokeSession(refreshToken) {
    return sessionRepository.revokeByRefreshToken(
      refreshToken
    );
  }

  async revokeAllUserSessions(userId) {
    return sessionRepository.revokeAllByUserId(
      userId
    );
  }
}

module.exports = new SessionService();