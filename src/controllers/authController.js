const User = require('../models/User');
const jwtService = require('../config/jwt');
const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  /**
   * User registration
   */
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

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
      next(error);
    }
  }

  /**
   * User login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
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
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      
      // Check if refresh token exists in database
      const isValidRefreshToken = await authService.verifyRefreshToken(decoded.userId, refreshToken);
      if (!isValidRefreshToken) {
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

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User logout
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.userId;

      if (refreshToken) {
        await authService.revokeRefreshToken(userId, refreshToken);
      }

      logger.info(`User logged out: ${req.user?.email}`);

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: user.toSafeObject()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
