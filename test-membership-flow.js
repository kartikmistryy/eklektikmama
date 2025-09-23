#!/usr/bin/env node

/**
 * Comprehensive Membership Flow Test Script
 * Tests the complete membership signup and payment process
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_DATA = {
  email: TEST_EMAIL,
  firstName: 'Test',
  lastName: 'User',
  phone: '+971501234567',
  membershipType: 'monthly'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            rawData: data
          });
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

async function testMembershipCheckout() {
  log('\n🧪 Testing Membership Checkout API...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/membership/checkout`, {
      method: 'POST',
      body: TEST_DATA
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.url) {
      log('✅ Checkout session created successfully', 'green');
      return response.data;
    } else {
      log('❌ Checkout session creation failed', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error testing checkout: ${error.message}`, 'red');
    return null;
  }
}

async function testMembershipWebhook() {
  log('\n🧪 Testing Membership Webhook...', 'cyan');
  
  try {
    // Test webhook endpoint availability
    const response = await makeRequest(`${BASE_URL}/api/webhooks/membership`, {
      method: 'POST',
      body: { test: 'webhook' }
    });

    log(`Status: ${response.status}`, response.status === 400 ? 'yellow' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 400 && response.data.error?.includes('signature')) {
      log('✅ Webhook endpoint is accessible (signature verification working)', 'green');
      return true;
    } else {
      log('❌ Webhook endpoint issue', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing webhook: ${error.message}`, 'red');
    return false;
  }
}

async function testGoogleSheetsConnection() {
  log('\n🧪 Testing Google Sheets Connection...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-sheets`, {
      method: 'GET'
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      log('✅ Google Sheets connection working', 'green');
      return true;
    } else {
      log('❌ Google Sheets connection failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing Google Sheets: ${error.message}`, 'red');
    return false;
  }
}

async function testEnvironmentVariables() {
  log('\n🧪 Testing Environment Variables...', 'cyan');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_MEMBERSHIP_WEBHOOK_SECRET',
    'GOOGLE_SHEETS_CLIENT_EMAIL',
    'GOOGLE_SHEETS_PRIVATE_KEY',
    'MEMBERSHIP_SPREADSHEET',
    'MONGODB_URI'
  ];

  let allPresent = true;

  for (const varName of requiredVars) {
    try {
      const response = await makeRequest(`${BASE_URL}/api/debug-env`, {
        method: 'GET'
      });

      if (response.status === 200 && response.data[varName]) {
        log(`✅ ${varName}: Present`, 'green');
      } else {
        log(`❌ ${varName}: Missing`, 'red');
        allPresent = false;
      }
    } catch (error) {
      log(`❌ ${varName}: Error checking - ${error.message}`, 'red');
      allPresent = false;
    }
  }

  return allPresent;
}

async function testDatabaseConnection() {
  log('\n🧪 Testing Database Connection...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-db`, {
      method: 'GET'
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      log('✅ Database connection working', 'green');
      return true;
    } else {
      log('❌ Database connection failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing database: ${error.message}`, 'red');
    return false;
  }
}

async function testMembershipVerification() {
  log('\n🧪 Testing Membership Verification API...', 'cyan');
  
  try {
    // Test with a fake session ID
    const response = await makeRequest(`${BASE_URL}/api/membership/verify-payment`, {
      method: 'POST',
      body: { sessionId: 'cs_test_fake_session_id' }
    });

    log(`Status: ${response.status}`, response.status === 400 ? 'yellow' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 400 && response.data.error?.includes('Invalid session ID')) {
      log('✅ Membership verification API working (correctly rejecting invalid session)', 'green');
      return true;
    } else {
      log('❌ Membership verification API issue', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing membership verification: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Comprehensive Membership Flow Tests', 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Test Email: ${TEST_EMAIL}`, 'blue');

  const results = {
    environment: await testEnvironmentVariables(),
    database: await testDatabaseConnection(),
    googleSheets: await testGoogleSheetsConnection(),
    webhook: await testMembershipWebhook(),
    checkout: await testMembershipCheckout(),
    verification: await testMembershipVerification()
  };

  log('\n📊 Test Results Summary:', 'bright');
  log('========================', 'bright');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test.padEnd(15)}: ${status}`, color);
  });

  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    log('\n🎉 All tests passed! Membership system is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the issues above.', 'yellow');
    log('\n🔧 Common fixes:', 'cyan');
    log('1. Ensure all environment variables are set correctly', 'yellow');
    log('2. Check that Stripe webhook is configured and pointing to /api/webhooks/membership', 'yellow');
    log('3. Verify Google Sheets credentials and spreadsheet ID', 'yellow');
    log('4. Ensure MongoDB connection is working', 'yellow');
  }

  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testMembershipCheckout,
  testMembershipWebhook,
  testGoogleSheetsConnection,
  testEnvironmentVariables,
  testDatabaseConnection,
  testMembershipVerification
};
