const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class JWTService {
  /**
   * Generate access token
   * @param {Object} payload - User data to encode
   * @returns {String} JWT token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: 'user-auth-system',
      audience: 'user-auth-client'
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - User data to encode
   * @returns {String} Refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
      issuer: 'user-auth-system',
      audience: 'user-auth-client'
    });
  }

  /**
   * Verify access token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error('Access token verification failed:', error.message);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   * @param {String} token - Refresh token to verify
   * @returns {Object} Decoded payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      logger.error('Refresh token verification failed:', error.message);
      throw new Error('Invalid or expired refresh token');
    }
  }
}

module.exports = new JWTService();
