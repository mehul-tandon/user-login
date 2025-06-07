const { registerValidation } = require('../../src/middleware/validation');
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
    const { error, value } = registerValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

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

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toSafeObject(),
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
