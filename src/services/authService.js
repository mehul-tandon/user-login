const db = require('../config/database');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Store refresh token in database
   * @param {Number} userId - User ID
   * @param {String} token - Refresh token
   */
  async storeRefreshToken(userId, token) {
    try {
      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );

      logger.info(`Refresh token stored for user: ${userId}`);
    } catch (error) {
      logger.error('Error storing refresh token:', error.message);
      throw error;
    }
  }

  /**
   * Verify refresh token exists and is valid
   * @param {Number} userId - User ID
   * @param {String} token - Refresh token
   * @returns {Boolean} Token validity
   */
  async verifyRefreshToken(userId, token) {
    try {
      const [rows] = await db.execute(
        'SELECT id FROM refresh_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()',
        [userId, token]
      );

      return rows.length > 0;
    } catch (error) {
      logger.error('Error verifying refresh token:', error.message);
      throw error;
    }
  }

  /**
   * Revoke refresh token
   * @param {Number} userId - User ID
   * @param {String} token - Refresh token
   */
  async revokeRefreshToken(userId, token) {
    try {
      await db.execute(
        'DELETE FROM refresh_tokens WHERE user_id = ? AND token = ?',
        [userId, token]
      );

      logger.info(`Refresh token revoked for user: ${userId}`);
    } catch (error) {
      logger.error('Error revoking refresh token:', error.message);
      throw error;
    }
  }

  /**
   * Clean up expired refresh tokens
   */
  async cleanupExpiredTokens() {
    try {
      const [result] = await db.execute(
        'DELETE FROM refresh_tokens WHERE expires_at <= NOW()'
      );

      logger.info(`Cleaned up ${result.affectedRows} expired refresh tokens`);
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error.message);
      throw error;
    }
  }
}

module.exports = new AuthService();
