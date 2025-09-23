#!/usr/bin/env node

/**
 * Membership Google Sheets Test Script
 * Tests Google Sheets integration for membership data
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

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

async function testManualMembershipSignup() {
  log('\n🧪 Testing Manual Membership Signup (includes Google Sheets)...', 'cyan');
  
  const testData = {
    email: `test-${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    phone: '+971501234567',
    membershipType: 'monthly',
    paymentMethod: 'Test Payment',
    paymentReference: `TEST-${Date.now()}`
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/membership/manual-signup`, {
      method: 'POST',
      body: testData
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      log('✅ Manual membership signup successful (includes Google Sheets)', 'green');
      return true;
    } else {
      log('❌ Manual membership signup failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing manual signup: ${error.message}`, 'red');
    return false;
  }
}

async function testMembershipList() {
  log('\n🧪 Testing Membership List (reads from Google Sheets)...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/membership/list`, {
      method: 'GET'
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200 && Array.isArray(response.data)) {
      log(`✅ Membership list retrieved successfully (${response.data.length} members)`, 'green');
      return true;
    } else {
      log('❌ Membership list retrieval failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing membership list: ${error.message}`, 'red');
    return false;
  }
}

async function testMembershipUpdate() {
  log('\n🧪 Testing Membership Update (updates Google Sheets)...', 'cyan');
  
  // First, get a list of memberships to find one to update
  try {
    const listResponse = await makeRequest(`${BASE_URL}/api/membership/list`, {
      method: 'GET'
    });

    if (listResponse.status !== 200 || !Array.isArray(listResponse.data) || listResponse.data.length === 0) {
      log('⚠️  No memberships found to update, skipping test', 'yellow');
      return true;
    }

    const testMember = listResponse.data[0];
    const updateData = {
      email: testMember.email,
      status: 'active',
      notes: `Updated by test script at ${new Date().toISOString()}`
    };

    const response = await makeRequest(`${BASE_URL}/api/membership/update`, {
      method: 'POST',
      body: updateData
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      log('✅ Membership update successful (includes Google Sheets)', 'green');
      return true;
    } else {
      log('❌ Membership update failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing membership update: ${error.message}`, 'red');
    return false;
  }
}

async function testEnvironmentVariables() {
  log('\n🧪 Testing Google Sheets Environment Variables...', 'cyan');
  
  const requiredVars = [
    'GOOGLE_SHEETS_CLIENT_EMAIL',
    'GOOGLE_SHEETS_PRIVATE_KEY',
    'MEMBERSHIP_SPREADSHEET'
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

async function runSheetsTests() {
  log('🚀 Starting Membership Google Sheets Tests', 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');

  const results = {
    environment: await testEnvironmentVariables(),
    connection: await testGoogleSheetsConnection(),
    manualSignup: await testManualMembershipSignup(),
    list: await testMembershipList(),
    update: await testMembershipUpdate()
  };

  log('\n📊 Google Sheets Test Results Summary:', 'bright');
  log('====================================', 'bright');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test.padEnd(15)}: ${status}`, color);
  });

  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    log('\n🎉 All Google Sheets tests passed!', 'green');
  } else {
    log('\n⚠️  Some Google Sheets tests failed. Check the issues above.', 'yellow');
    log('\n🔧 Common fixes for Google Sheets issues:', 'cyan');
    log('1. Check GOOGLE_SHEETS_CLIENT_EMAIL is correct', 'yellow');
    log('2. Verify GOOGLE_SHEETS_PRIVATE_KEY is properly formatted (with \\n for newlines)', 'yellow');
    log('3. Ensure MEMBERSHIP_SPREADSHEET ID is correct and accessible', 'yellow');
    log('4. Check that the service account has edit permissions on the spreadsheet', 'yellow');
    log('5. Verify the spreadsheet has a "Members" sheet or it can be created', 'yellow');
  }

  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSheetsTests().catch(console.error);
}

module.exports = {
  runSheetsTests,
  testGoogleSheetsConnection,
  testManualMembershipSignup,
  testMembershipList,
  testMembershipUpdate,
  testEnvironmentVariables
};
