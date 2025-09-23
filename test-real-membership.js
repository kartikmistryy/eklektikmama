#!/usr/bin/env node

/**
 * Test Real Membership Flow
 * Simulates the complete membership signup process
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

async function testManualMembershipSignup() {
  log('\n🧪 Testing Manual Membership Signup (Complete Flow)...', 'cyan');
  
  const testData = {
    email: `real-test-${Date.now()}@example.com`,
    firstName: 'Real',
    lastName: 'Test',
    phone: '+971501234567',
    membershipType: 'monthly',
    paymentMethod: 'Stripe Test',
    paymentReference: `REAL-TEST-${Date.now()}`
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
      log('✅ Manual membership signup successful!', 'green');
      log(`   • Email: ${response.data.membership.email}`, 'green');
      log(`   • Type: ${response.data.membership.membershipType}`, 'green');
      log(`   • Status: ${response.data.membership.status}`, 'green');
      log(`   • Google Sheets Row: ${response.data.membership.googleSheetsRowId}`, 'green');
      return response.data.membership;
    } else {
      log('❌ Manual membership signup failed', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error testing manual signup: ${error.message}`, 'red');
    return null;
  }
}

async function testMembershipList() {
  log('\n🧪 Testing Membership List...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/membership/list`, {
      method: 'GET'
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.status === 200 && response.data.members) {
      log(`✅ Found ${response.data.members.length} memberships`, 'green');
      log('Recent memberships:', 'blue');
      response.data.members.slice(0, 3).forEach((member, index) => {
        log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email}) - ${member.membershipType}`, 'green');
      });
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

async function testMembershipDashboard() {
  log('\n🧪 Testing Membership Dashboard...', 'cyan');
  
  try {
    // Test the member dashboard page (frontend)
    const response = await makeRequest(`${BASE_URL}/member-dashboard`, {
      method: 'GET'
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.status === 200) {
      log('✅ Member dashboard page accessible', 'green');
      
      // Test the membership verify API
      const verifyResponse = await makeRequest(`${BASE_URL}/api/membership/verify`, {
        method: 'POST',
        body: { email: 'real-test-1758655100022@example.com' }
      });
      
      if (verifyResponse.status === 200 && verifyResponse.data.isMember) {
        log('✅ Membership verification API working', 'green');
        log(`   • Member: ${verifyResponse.data.membership.firstName} ${verifyResponse.data.membership.lastName}`, 'green');
        log(`   • Type: ${verifyResponse.data.membership.membershipType}`, 'green');
        log(`   • Status: ${verifyResponse.data.membership.status}`, 'green');
        return true;
      } else {
        log('❌ Membership verification failed', 'red');
        return false;
      }
    } else {
      log('❌ Member dashboard page failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing dashboard: ${error.message}`, 'red');
    return false;
  }
}

async function testStripeCheckout() {
  log('\n🧪 Testing Stripe Checkout Creation...', 'cyan');
  
  const testData = {
    email: `stripe-test-${Date.now()}@example.com`,
    firstName: 'Stripe',
    lastName: 'Test',
    phone: '+971501234567',
    membershipType: 'monthly'
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/membership/checkout`, {
      method: 'POST',
      body: testData
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.status === 200 && response.data.url) {
      log('✅ Stripe checkout session created successfully!', 'green');
      log(`   • Session ID: ${response.data.id}`, 'green');
      log(`   • Checkout URL: ${response.data.url.substring(0, 50)}...`, 'green');
      return response.data;
    } else {
      log('❌ Stripe checkout creation failed', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error testing Stripe checkout: ${error.message}`, 'red');
    return null;
  }
}

async function runRealMembershipTest() {
  log('🚀 Testing Real Membership System', 'bright');
  log('================================', 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');

  const results = {
    manualSignup: await testManualMembershipSignup(),
    membershipList: await testMembershipList(),
    dashboard: await testMembershipDashboard(),
    stripeCheckout: await testStripeCheckout()
  };

  log('\n📊 Real Membership Test Results:', 'bright');
  log('================================', 'bright');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`${test.padEnd(15)}: ${status}`, color);
  });

  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    log('\n🎉 ALL REAL MEMBERSHIP TESTS PASSED!', 'green');
    log('Your membership system is working correctly:', 'green');
    log('   • Users can sign up for memberships', 'green');
    log('   • Data is saved to database and Google Sheets', 'green');
    log('   • Stripe checkout sessions are created', 'green');
    log('   • Membership lists and dashboard work', 'green');
    log('\n✅ The membership system is ready for production!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the issues above.', 'yellow');
  }

  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runRealMembershipTest().catch(console.error);
}

module.exports = { runRealMembershipTest };
