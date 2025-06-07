#!/usr/bin/env node

/**
 * Generate secure JWT secrets for production use
 * This script creates cryptographically secure random strings
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecretGenerator {
  /**
   * Generate a cryptographically secure random string
   * @param {number} length - Length of the secret (minimum 32)
   * @returns {string} Secure random string
   */
  generateSecret(length = 64) {
    if (length < 32) {
      console.warn('⚠️  Warning: Secret length should be at least 32 characters for security');
      length = 32;
    }
    
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * Generate all required secrets
   * @returns {object} Object containing all secrets
   */
  generateAllSecrets() {
    return {
      JWT_SECRET: this.generateSecret(64),
      JWT_REFRESH_SECRET: this.generateSecret(64),
      NODE_ENV: 'production',
      BCRYPT_ROUNDS: '12',
      JWT_EXPIRES_IN: '15m'
    };
  }

  /**
   * Create .env file with generated secrets
   * @param {string} filename - Output filename
   */
  createEnvFile(filename = '.env') {
    const secrets = this.generateAllSecrets();
    
    let envContent = `# Generated Environment Configuration
# Generated on: ${new Date().toISOString()}
# 
# 🚨 SECURITY WARNING:
# - Never commit this file to version control
# - Keep these secrets secure and private
# - Rotate secrets regularly in production
# - Use different secrets for each environment

# Application Configuration
NODE_ENV=${secrets.NODE_ENV}
PORT=3000

# JWT Configuration - KEEP THESE SECRET!
JWT_SECRET=${secrets.JWT_SECRET}
JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=${secrets.JWT_EXPIRES_IN}

# Password Hashing
BCRYPT_ROUNDS=${secrets.BCRYPT_ROUNDS}

# File Storage
# Data will be stored in ./data/ directory as JSON files
# The data/ directory is excluded from version control for security
`;

    try {
      const envPath = path.join(process.cwd(), filename);
      
      // Check if file already exists
      if (fs.existsSync(envPath)) {
        console.log('⚠️  .env file already exists!');
        console.log('   To avoid overwriting, the new secrets will be saved as .env.new');
        filename = '.env.new';
      }
      
      fs.writeFileSync(path.join(process.cwd(), filename), envContent);
      
      console.log(`✅ Secure environment file created: ${filename}`);
      console.log('');
      console.log('🔐 Generated Secrets:');
      console.log(`   JWT_SECRET: ${secrets.JWT_SECRET.substring(0, 16)}...`);
      console.log(`   JWT_REFRESH_SECRET: ${secrets.JWT_REFRESH_SECRET.substring(0, 16)}...`);
      console.log('');
      console.log('🚨 IMPORTANT SECURITY REMINDERS:');
      console.log('   ❌ Never commit .env files to version control');
      console.log('   ❌ Never share these secrets publicly');
      console.log('   ✅ Keep secrets secure and private');
      console.log('   ✅ Use different secrets for each environment');
      console.log('   ✅ Rotate secrets regularly in production');
      
    } catch (error) {
      console.error('❌ Error creating .env file:', error.message);
      throw error;
    }
  }

  /**
   * Display secrets without saving to file
   */
  displaySecrets() {
    const secrets = this.generateAllSecrets();
    
    console.log('🔐 Generated Secure Secrets:');
    console.log('');
    console.log('Copy these to your .env file:');
    console.log('=====================================');
    console.log(`JWT_SECRET=${secrets.JWT_SECRET}`);
    console.log(`JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}`);
    console.log(`NODE_ENV=${secrets.NODE_ENV}`);
    console.log(`BCRYPT_ROUNDS=${secrets.BCRYPT_ROUNDS}`);
    console.log(`JWT_EXPIRES_IN=${secrets.JWT_EXPIRES_IN}`);
    console.log('=====================================');
    console.log('');
    console.log('🚨 SECURITY REMINDERS:');
    console.log('   ❌ Never commit these secrets to version control');
    console.log('   ❌ Never share these secrets publicly');
    console.log('   ✅ Store securely in your deployment platform');
    console.log('   ✅ Use different secrets for each environment');
  }

  /**
   * Validate existing .env file for security issues
   */
  validateEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('ℹ️  No .env file found. Run with --create to generate one.');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const issues = [];

    // Check for weak secrets
    const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
    const refreshSecretMatch = envContent.match(/JWT_REFRESH_SECRET=(.+)/);

    if (jwtSecretMatch) {
      const secret = jwtSecretMatch[1].trim();
      if (secret.length < 32) {
        issues.push('JWT_SECRET is too short (should be 32+ characters)');
      }
      if (secret.includes('change-this') || secret.includes('your-secret')) {
        issues.push('JWT_SECRET appears to be a default/example value');
      }
    }

    if (refreshSecretMatch) {
      const secret = refreshSecretMatch[1].trim();
      if (secret.length < 32) {
        issues.push('JWT_REFRESH_SECRET is too short (should be 32+ characters)');
      }
      if (secret.includes('change-this') || secret.includes('your-secret')) {
        issues.push('JWT_REFRESH_SECRET appears to be a default/example value');
      }
    }

    if (issues.length === 0) {
      console.log('✅ .env file looks secure!');
    } else {
      console.log('⚠️  Security issues found in .env file:');
      issues.forEach(issue => console.log(`   ❌ ${issue}`));
      console.log('');
      console.log('💡 Run with --create to generate secure secrets');
    }
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const generator = new SecretGenerator();

  console.log('🔐 JWT Secret Generator\n');

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  node scripts/generate-secrets.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --create, -c    Create .env file with generated secrets');
    console.log('  --display, -d   Display secrets without saving');
    console.log('  --validate, -v  Validate existing .env file');
    console.log('  --help, -h      Show this help message');
    return;
  }

  if (args.includes('--create') || args.includes('-c')) {
    generator.createEnvFile();
  } else if (args.includes('--display') || args.includes('-d')) {
    generator.displaySecrets();
  } else if (args.includes('--validate') || args.includes('-v')) {
    generator.validateEnvFile();
  } else {
    // Default behavior
    generator.validateEnvFile();
    console.log('');
    console.log('💡 Use --create to generate new secrets or --help for more options');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SecretGenerator;
