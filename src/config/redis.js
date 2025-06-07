const redis = require('redis');
const logger = require('../utils/logger');

let client = null;

// Only initialize Redis if URL is provided
if (process.env.REDIS_URL) {
  client = redis.createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD
  });

  client.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  client.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });

  // Connect to Redis
  client.connect().catch((err) => {
    logger.error('❌ Redis connection failed:', err.message);
  });
}

module.exports = client;
