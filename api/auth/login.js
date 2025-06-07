const { loginValidation } = require('../../src/middleware/validation');
const User = require('../../src/models/User');
const jwtService = require('../../src/config/jwt');
const authService = require('../../src/services/authService');
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
    // Validate request body
    const { error, value } = loginValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate tokens
    const accessToken = jwtService.generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const refreshToken = jwtService.generateRefreshToken({
      userId: user.id
    });

    // Store refresh token
    await authService.storeRefreshToken(user.id, refreshToken);

    logger.info(`User logged in successfully: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeObject(),
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
