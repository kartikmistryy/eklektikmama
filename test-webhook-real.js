#!/usr/bin/env node

/**
 * Test Real Webhook Event
 * Simulates a real Stripe webhook event for membership
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');
const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.STRIPE_MEMBERSHIP_WEBHOOK_SECRET;

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

function createStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${payloadString}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
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

async function testRealWebhookEvent() {
  log('\n🧪 Testing Real Webhook Event...', 'cyan');
  
  if (!WEBHOOK_SECRET) {
    log('❌ STRIPE_MEMBERSHIP_WEBHOOK_SECRET not found in environment', 'red');
    return false;
  }

  // Create a realistic checkout session completed event
  const testSession = {
    id: 'cs_test_' + Date.now(),
    object: 'checkout.session',
    payment_status: 'paid',
    customer: 'cus_test_' + Date.now(),
    metadata: {
      membershipType: 'monthly',
      email: `webhook-test-${Date.now()}@example.com`,
      firstName: 'Webhook',
      lastName: 'Test',
      phone: '+971501234567'
    }
  };

  const event = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: testSession
    }
  };

  const signature = createStripeSignature(event, WEBHOOK_SECRET);

  try {
    log(`Sending webhook event for session: ${testSession.id}`, 'blue');
    log(`Email: ${testSession.metadata.email}`, 'blue');
    
    const response = await makeRequest(`${BASE_URL}/api/webhooks/membership`, {
      method: 'POST',
      headers: {
        'stripe-signature': signature
      },
      body: event
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      log('✅ Webhook event processed successfully!', 'green');
      log('Check your database and Google Sheets for the new membership', 'green');
      return true;
    } else {
      log('❌ Webhook event failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing webhook: ${error.message}`, 'red');
    return false;
  }
}

async function checkMembershipAfterWebhook() {
  log('\n🧪 Checking if membership was created...', 'cyan');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/membership/list`, {
      method: 'GET'
    });

    if (response.status === 200 && response.data.members) {
      const recentMembers = response.data.members.slice(0, 3);
      log(`Found ${response.data.members.length} total memberships`, 'green');
      log('Recent memberships:', 'blue');
      recentMembers.forEach((member, index) => {
        log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email}) - ${member.membershipType}`, 'green');
      });
      return true;
    } else {
      log('❌ Could not retrieve memberships', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error checking memberships: ${error.message}`, 'red');
    return false;
  }
}

async function runWebhookTest() {
  log('🚀 Testing Real Webhook Event Processing', 'bright');
  log('=====================================', 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Webhook Secret: ${WEBHOOK_SECRET ? 'Present' : 'Missing'}`, WEBHOOK_SECRET ? 'green' : 'red');

  if (!WEBHOOK_SECRET) {
    log('\n❌ Cannot test webhook without STRIPE_MEMBERSHIP_WEBHOOK_SECRET', 'red');
    return;
  }

  const results = {
    webhookEvent: await testRealWebhookEvent(),
    membershipCheck: await checkMembershipAfterWebhook()
  };

  log('\n📊 Webhook Test Results:', 'bright');
  log('========================', 'bright');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`${test.padEnd(20)}: ${status}`, color);
  });

  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    log('\n🎉 Webhook is working correctly!', 'green');
    log('Your membership system should process payments automatically', 'green');
  } else {
    log('\n⚠️  Webhook test failed. Check the issues above.', 'yellow');
    log('\n🔧 Possible issues:', 'cyan');
    log('1. Check webhook endpoint URL in Stripe dashboard', 'yellow');
    log('2. Verify webhook secret is correct', 'yellow');
    log('3. Check webhook events are enabled in Stripe', 'yellow');
    log('4. Check server logs for webhook processing errors', 'yellow');
  }

  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runWebhookTest().catch(console.error);
}

module.exports = { runWebhookTest };
