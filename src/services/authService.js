const storage = require('../config/storage');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Store refresh token in file storage
   * @param {Number} userId - User ID
   * @param {String} token - Refresh token
   */
  async storeRefreshToken(userId, token) {
    try {
      await storage.storeRefreshToken(userId, token);
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
      return await storage.verifyRefreshToken(userId, token);
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
      await storage.revokeRefreshToken(userId, token);
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
      await storage.cleanupExpiredTokens();
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error.message);
      throw error;
    }
  }
}

module.exports = new AuthService();
