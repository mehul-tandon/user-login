#!/usr/bin/env node

/**
 * Migration script to move from file-based storage to a database
 * This is useful when moving from development to production
 */

const fs = require('fs').promises;
const path = require('path');

class DataMigrator {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.tokensFile = path.join(this.dataDir, 'refresh_tokens.json');
  }

  /**
   * Read data from JSON files
   */
  async readFileData() {
    try {
      const usersData = await fs.readFile(this.usersFile, 'utf8');
      const tokensData = await fs.readFile(this.tokensFile, 'utf8');
      
      return {
        users: JSON.parse(usersData),
        tokens: JSON.parse(tokensData)
      };
    } catch (error) {
      console.error('Error reading file data:', error.message);
      throw error;
    }
  }

  /**
   * Export data to SQL format
   */
  async exportToSQL() {
    const data = await this.readFileData();
    
    let sql = '-- Migration SQL for User Authentication System\n\n';
    
    // Create tables
    sql += `-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);

`;

    // Insert users
    if (data.users.length > 0) {
      sql += '-- Insert users\n';
      for (const user of data.users) {
        sql += `INSERT INTO users (id, email, password, first_name, last_name, is_verified, is_active, created_at, updated_at, last_login) VALUES (
  ${user.id},
  '${user.email.replace(/'/g, "''")}',
  '${user.password}',
  '${user.first_name.replace(/'/g, "''")}',
  '${user.last_name.replace(/'/g, "''")}',
  ${user.is_verified},
  ${user.is_active},
  '${user.created_at}',
  '${user.updated_at}',
  ${user.last_login ? `'${user.last_login}'` : 'NULL'}
);\n`;
      }
    }

    // Insert tokens
    if (data.tokens.length > 0) {
      sql += '\n-- Insert refresh tokens\n';
      for (const token of data.tokens) {
        sql += `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) VALUES (
  ${token.id},
  ${token.user_id},
  '${token.token}',
  '${token.expires_at}',
  '${token.created_at}'
);\n`;
      }
    }

    return sql;
  }

  /**
   * Export data to JSON format (for NoSQL databases)
   */
  async exportToJSON() {
    const data = await this.readFileData();
    
    return {
      users: data.users.map(user => ({
        ...user,
        _id: user.id.toString(),
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
        lastLogin: user.last_login ? new Date(user.last_login) : null
      })),
      refreshTokens: data.tokens.map(token => ({
        ...token,
        _id: token.id.toString(),
        userId: token.user_id.toString(),
        expiresAt: new Date(token.expires_at),
        createdAt: new Date(token.created_at)
      }))
    };
  }

  /**
   * Generate migration files
   */
  async generateMigrationFiles() {
    try {
      // Create migrations directory
      const migrationsDir = path.join(process.cwd(), 'migrations');
      await fs.mkdir(migrationsDir, { recursive: true });

      // Generate SQL migration
      const sql = await this.exportToSQL();
      const sqlFile = path.join(migrationsDir, `migration_${Date.now()}.sql`);
      await fs.writeFile(sqlFile, sql);
      console.log(`✅ SQL migration file created: ${sqlFile}`);

      // Generate JSON export
      const jsonData = await this.exportToJSON();
      const jsonFile = path.join(migrationsDir, `data_export_${Date.now()}.json`);
      await fs.writeFile(jsonFile, JSON.stringify(jsonData, null, 2));
      console.log(`✅ JSON export file created: ${jsonFile}`);

      // Generate summary
      console.log('\n📊 Migration Summary:');
      console.log(`   Users: ${jsonData.users.length}`);
      console.log(`   Refresh Tokens: ${jsonData.refreshTokens.length}`);
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Backup current data
   */
  async backupData() {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      await fs.mkdir(backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

      const data = await this.readFileData();
      await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
      
      console.log(`✅ Data backed up to: ${backupFile}`);
      return backupFile;
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const migrator = new DataMigrator();
  
  console.log('🚀 Starting data migration process...\n');
  
  try {
    // Create backup first
    await migrator.backupData();
    
    // Generate migration files
    await migrator.generateMigrationFiles();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated migration files');
    console.log('2. Set up your production database');
    console.log('3. Run the SQL migration or import JSON data');
    console.log('4. Update your application to use database storage');
    console.log('5. Test thoroughly before going live');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DataMigrator;
