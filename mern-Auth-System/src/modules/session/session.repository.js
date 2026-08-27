const Session = require("./session.model");

class SessionRepository {

  async create(data) {
    return await Session.create(data);
  }

  async findByRefreshToken(refreshToken) {
    return await Session.findOne({
      refreshToken,
      revoked: false,
      expiresAt: {
        $gt: new Date(),
      },
    });
  }

  async findByUserId(userId) {
    return await Session.find({
      userId,
      revoked: false,
      expiresAt: {
        $gt: new Date(),
      },
    }).sort({
      lastActiveAt: -1,
    });
  }

  async findById(sessionId) {
    return await Session.findById(sessionId);
  }

  async revokeByRefreshToken(refreshToken) {
    return await Session.findOneAndUpdate(
      {
        refreshToken,
      },
      {
        revoked: true,
        revokedAt: new Date(),
      },
      {
        new: true,
      }
    );
  }

  async revokeById(sessionId, userId) {
    return await Session.findOneAndUpdate(
      {
        _id: sessionId,
        userId,
      },
      {
        revoked: true,
        revokedAt: new Date(),
      },
      {
        new: true,
      }
    );
  }

  async revokeAllByUserId(userId) {
    return await Session.updateMany(
      {
        userId,
        revoked: false,
      },
      {
        revoked: true,
        revokedAt: new Date(),
      }
    );
  }

  async revokeOtherSessions(userId, currentRefreshToken) {
    return await Session.updateMany(
      {
        userId,
        revoked: false,
        refreshToken: { $ne: currentRefreshToken },
      },
      {
        revoked: true,
        revokedAt: new Date(),
      }
    );
  }

  async updateLastActive(sessionId) {
    return await Session.findByIdAndUpdate(
      sessionId,
      {
        lastActiveAt: new Date(),
      },
      {
        new: true,
      }
    );
  }
}

module.exports =
  new SessionRepository();