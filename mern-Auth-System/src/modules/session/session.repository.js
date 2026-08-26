const Session = require("./session.model");

class SessionRepository {
  async create(sessionData) {
    return Session.create(sessionData);
  }

  async findByRefreshToken(refreshToken) {
    return Session.findOne({
      refreshToken,
      revoked: false,
    });
  }

  async revokeByRefreshToken(refreshToken) {
    return Session.findOneAndUpdate(
      {
        refreshToken,
        revoked: false,
      },
      {
        revoked: true,
      },
      {
        new: true,
      }
    );
  }

  async revokeAllByUserId(userId) {
    return Session.updateMany(
      {
        userId,
        revoked: false,
      },
      {
        revoked: true,
      }
    );
  }
}

module.exports = new SessionRepository();