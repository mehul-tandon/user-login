const jwtService = require('../../src/config/jwt');
const authService = require('../../src/services/authService');
const User = require('../../src/models/User');
const logger = require('../../src/utils/logger');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in storage
    const isValidToken = await authService.verifyRefreshToken(decoded.userId, refreshToken);
    if (!isValidToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new access token
    const newAccessToken = jwtService.generateAccessToken({
      userId: user.id,
      email: user.email
    });

    // Generate new refresh token
    const newRefreshToken = jwtService.generateRefreshToken({
      userId: user.id
    });

    // Revoke old refresh token and store new one
    await authService.revokeRefreshToken(decoded.userId, refreshToken);
    await authService.storeRefreshToken(user.id, newRefreshToken);

    logger.info(`Tokens refreshed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
