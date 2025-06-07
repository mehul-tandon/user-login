const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class FileStorage {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.tokensFile = path.join(this.dataDir, 'refresh_tokens.json');
    this.initializeStorage();
  }

  /**
   * Initialize storage directory and files
   */
  async initializeStorage() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize users file if it doesn't exist
      try {
        await fs.access(this.usersFile);
      } catch {
        await fs.writeFile(this.usersFile, JSON.stringify([], null, 2));
        logger.info('Initialized users.json file');
      }
      
      // Initialize tokens file if it doesn't exist
      try {
        await fs.access(this.tokensFile);
      } catch {
        await fs.writeFile(this.tokensFile, JSON.stringify([], null, 2));
        logger.info('Initialized refresh_tokens.json file');
      }
      
      logger.info('✅ File storage initialized successfully');
    } catch (error) {
      logger.error('❌ File storage initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Read users from file
   * @returns {Array} Array of users
   */
  async getUsers() {
    try {
      const data = await fs.readFile(this.usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Error reading users file:', error.message);
      return [];
    }
  }

  /**
   * Write users to file
   * @param {Array} users - Array of users
   */
  async saveUsers(users) {
    try {
      await fs.writeFile(this.usersFile, JSON.stringify(users, null, 2));
      logger.info('Users saved to file successfully');
    } catch (error) {
      logger.error('Error saving users file:', error.message);
      throw error;
    }
  }

  /**
   * Read refresh tokens from file
   * @returns {Array} Array of refresh tokens
   */
  async getRefreshTokens() {
    try {
      const data = await fs.readFile(this.tokensFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Error reading tokens file:', error.message);
      return [];
    }
  }

  /**
   * Write refresh tokens to file
   * @param {Array} tokens - Array of refresh tokens
   */
  async saveRefreshTokens(tokens) {
    try {
      await fs.writeFile(this.tokensFile, JSON.stringify(tokens, null, 2));
      logger.info('Refresh tokens saved to file successfully');
    } catch (error) {
      logger.error('Error saving tokens file:', error.message);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {String} email - User email
   * @returns {Object|null} User object or null
   */
  async findUserByEmail(email) {
    const users = await this.getUsers();
    return users.find(user => user.email === email && user.isActive) || null;
  }

  /**
   * Find user by ID
   * @param {Number} id - User ID
   * @returns {Object|null} User object or null
   */
  async findUserById(id) {
    const users = await this.getUsers();
    return users.find(user => user.id === id && user.isActive) || null;
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Object} Created user
   */
  async createUser(userData) {
    const users = await this.getUsers();
    
    // Generate new ID
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser = {
      id: newId,
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null
    };
    
    users.push(newUser);
    await this.saveUsers(users);
    
    return newUser;
  }

  /**
   * Update user's last login
   * @param {Number} userId - User ID
   */
  async updateLastLogin(userId) {
    const users = await this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].last_login = new Date().toISOString();
      users[userIndex].updated_at = new Date().toISOString();
      await this.saveUsers(users);
    }
  }

  /**
   * Store refresh token
   * @param {Number} userId - User ID
   * @param {String} token - Refresh token
   */
  async storeRefreshToken(userId, token) {
    const tokens = await this.getRefreshTokens();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const newToken = {
      id: tokens.length > 0 ? Math.max(...tokens.map(t => t.id)) + 1 : 1,
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    };
    
    tokens.push(newToken);
    await this.saveRefreshTokens(tokens);
  }

  /**
   * Verify refresh token
   * @param {Number} userId - User ID
   * @param {String} token - Refresh token
   * @returns {Boolean} Token validity
   */
  async verifyRefreshToken(userId, token) {
    const tokens = await this.getRefreshTokens();
    const now = new Date().toISOString();
    
    return tokens.some(t => 
      t.user_id === userId && 
      t.token === token && 
      t.expires_at > now
    );
  }

  /**
   * Revoke refresh token
   * @param {Number} userId - User ID
   * @param {String} token - Refresh token
   */
  async revokeRefreshToken(userId, token) {
    const tokens = await this.getRefreshTokens();
    const filteredTokens = tokens.filter(t => 
      !(t.user_id === userId && t.token === token)
    );
    
    await this.saveRefreshTokens(filteredTokens);
  }

  /**
   * Clean up expired refresh tokens
   */
  async cleanupExpiredTokens() {
    const tokens = await this.getRefreshTokens();
    const now = new Date().toISOString();
    
    const validTokens = tokens.filter(t => t.expires_at > now);
    const expiredCount = tokens.length - validTokens.length;
    
    if (expiredCount > 0) {
      await this.saveRefreshTokens(validTokens);
      logger.info(`Cleaned up ${expiredCount} expired refresh tokens`);
    }
  }
}

module.exports = new FileStorage();
