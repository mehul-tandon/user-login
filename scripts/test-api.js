#!/usr/bin/env node

/**
 * API Testing Script for Serverless Authentication System
 * Tests all endpoints to ensure they work correctly
 */

const https = require('https');
const http = require('http');

class APITester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
    this.tokens = {};
  }

  /**
   * Make HTTP request
   */
  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
          } catch (error) {
            resolve({ status: res.statusCode, data: data, headers: res.headers });
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * Test health endpoint
   */
  async testHealth() {
    console.log('🔍 Testing health endpoint...');
    try {
      const response = await this.makeRequest('/api/health');
      
      if (response.status === 200 && response.data.status === 'OK') {
        console.log('✅ Health check passed');
        return true;
      } else {
        console.log('❌ Health check failed:', response);
        return false;
      }
    } catch (error) {
      console.log('❌ Health check error:', error.message);
      return false;
    }
  }

  /**
   * Test user registration
   */
  async testRegistration() {
    console.log('🔍 Testing user registration...');
    try {
      const response = await this.makeRequest('/api/auth/register', {
        method: 'POST',
        body: this.testUser
      });

      if (response.status === 201 && response.data.success) {
        console.log('✅ User registration passed');
        this.tokens.access = response.data.data.accessToken;
        this.tokens.refresh = response.data.data.refreshToken;
        return true;
      } else {
        console.log('❌ User registration failed:', response);
        return false;
      }
    } catch (error) {
      console.log('❌ User registration error:', error.message);
      return false;
    }
  }

  /**
   * Test user login
   */
  async testLogin() {
    console.log('🔍 Testing user login...');
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: this.testUser.email,
          password: this.testUser.password
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ User login passed');
        this.tokens.access = response.data.data.accessToken;
        this.tokens.refresh = response.data.data.refreshToken;
        return true;
      } else {
        console.log('❌ User login failed:', response);
        return false;
      }
    } catch (error) {
      console.log('❌ User login error:', error.message);
      return false;
    }
  }

  /**
   * Test profile access
   */
  async testProfile() {
    console.log('🔍 Testing profile access...');
    try {
      const response = await this.makeRequest('/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.tokens.access}`
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ Profile access passed');
        return true;
      } else {
        console.log('❌ Profile access failed:', response);
        return false;
      }
    } catch (error) {
      console.log('❌ Profile access error:', error.message);
      return false;
    }
  }

  /**
   * Test token refresh
   */
  async testTokenRefresh() {
    console.log('🔍 Testing token refresh...');
    try {
      const response = await this.makeRequest('/api/auth/refresh', {
        method: 'POST',
        body: {
          refreshToken: this.tokens.refresh
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ Token refresh passed');
        this.tokens.access = response.data.data.accessToken;
        this.tokens.refresh = response.data.data.refreshToken;
        return true;
      } else {
        console.log('❌ Token refresh failed:', response);
        return false;
      }
    } catch (error) {
      console.log('❌ Token refresh error:', error.message);
      return false;
    }
  }

  /**
   * Test logout
   */
  async testLogout() {
    console.log('🔍 Testing logout...');
    try {
      const response = await this.makeRequest('/api/auth/logout', {
        method: 'POST',
        body: {
          refreshToken: this.tokens.refresh
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('✅ Logout passed');
        return true;
      } else {
        console.log('❌ Logout failed:', response);
        return false;
      }
    } catch (error) {
      console.log('❌ Logout error:', error.message);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log(`🚀 Starting API tests for: ${this.baseUrl}\n`);
    
    const tests = [
      { name: 'Health Check', fn: () => this.testHealth() },
      { name: 'User Registration', fn: () => this.testRegistration() },
      { name: 'User Login', fn: () => this.testLogin() },
      { name: 'Profile Access', fn: () => this.testProfile() },
      { name: 'Token Refresh', fn: () => this.testTokenRefresh() },
      { name: 'Logout', fn: () => this.testLogout() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.name} threw error:`, error.message);
        failed++;
      }
      console.log(''); // Add spacing
    }

    console.log('📊 Test Results:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your API is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the logs above.');
    }

    return failed === 0;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3000';
  
  const tester = new APITester(baseUrl);
  const success = await tester.runAllTests();
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = APITester;
