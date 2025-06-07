const bcrypt = require('bcryptjs');
const db = require('../config/database');
const logger = require('../utils/logger');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.email = userData.email;
    this.password = userData.password;
    this.firstName = userData.first_name;
    this.lastName = userData.last_name;
    this.isVerified = userData.is_verified;
    this.isActive = userData.is_active;
    this.createdAt = userData.created_at;
    this.updatedAt = userData.updated_at;
    this.lastLogin = userData.last_login;
  }

  /**
   * Create a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user
   */
  static async create(userData) {
    const { email, password, firstName, lastName } = userData;
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      
      // Insert user into database
      const [result] = await db.execute(
        'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, firstName, lastName]
      );

      // Fetch and return the created user
      const [rows] = await db.execute(
        'SELECT id, email, first_name, last_name, is_verified, is_active, created_at FROM users WHERE id = ?',
        [result.insertId]
      );

      logger.info(`User created successfully: ${email}`);
      return new User(rows[0]);
    } catch (error) {
      logger.error('Error creating user:', error.message);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {String} email - User email
   * @returns {Object|null} User object or null
   */
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );

      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      logger.error('Error finding user by email:', error.message);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {Number} id - User ID
   * @returns {Object|null} User object or null
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, email, first_name, last_name, is_verified, is_active, created_at, last_login FROM users WHERE id = ? AND is_active = TRUE',
        [id]
      );

      return rows.length > 0 ? new User(rows[0]) : null;
    } catch (error) {
      logger.error('Error finding user by ID:', error.message);
      throw error;
    }
  }

  /**
   * Verify password
   * @param {String} password - Plain text password
   * @returns {Boolean} Password match result
   */
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      logger.error('Error verifying password:', error.message);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin() {
    try {
      await db.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [this.id]
      );
      logger.info(`Updated last login for user: ${this.email}`);
    } catch (error) {
      logger.error('Error updating last login:', error.message);
      throw error;
    }
  }

  /**
   * Convert user to safe object (without password)
   * @returns {Object} Safe user object
   */
  toSafeObject() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      isVerified: this.isVerified,
      isActive: this.isActive,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
}

module.exports = User;
