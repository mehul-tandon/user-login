const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ Database connected successfully');
    connection.release();

    // Auto-setup database tables in production if needed
    if (process.env.NODE_ENV === 'production') {
      try {
        const setupDatabase = require('../../deploy-setup');
        await setupDatabase();
      } catch (setupError) {
        logger.warn('Database setup skipped (tables may already exist):', setupError.message);
      }
    }
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;
