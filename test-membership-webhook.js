#!/usr/bin/env node

/**
 * Membership Webhook Test Script
 * Simulates Stripe webhook events for membership testing
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');
const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.STRIPE_MEMBERSHIP_WEBHOOK_SECRET || 'whsec_test_secret';

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

async function testCheckoutSessionCompleted() {
  log('\n🧪 Testing checkout.session.completed webhook...', 'cyan');
  
  const testSession = {
    id: 'cs_test_' + Date.now(),
    object: 'checkout.session',
    payment_status: 'paid',
    customer: 'cus_test_' + Date.now(),
    metadata: {
      membershipType: 'monthly',
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
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
      log('✅ Checkout session completed webhook processed successfully', 'green');
      return true;
    } else {
      log('❌ Checkout session completed webhook failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing checkout session completed: ${error.message}`, 'red');
    return false;
  }
}

async function testPaymentSucceeded() {
  log('\n🧪 Testing invoice.payment_succeeded webhook...', 'cyan');
  
  const testInvoice = {
    id: 'in_test_' + Date.now(),
    object: 'invoice',
    amount_paid: 4900, // AED 49 in fils
    subscription: 'sub_test_' + Date.now(),
    customer: 'cus_test_' + Date.now()
  };

  const event = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    type: 'invoice.payment_succeeded',
    data: {
      object: testInvoice
    }
  };

  const signature = createStripeSignature(event, WEBHOOK_SECRET);

  try {
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
      log('✅ Payment succeeded webhook processed successfully', 'green');
      return true;
    } else {
      log('❌ Payment succeeded webhook failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing payment succeeded: ${error.message}`, 'red');
    return false;
  }
}

async function testSubscriptionCreated() {
  log('\n🧪 Testing customer.subscription.created webhook...', 'cyan');
  
  const testSubscription = {
    id: 'sub_test_' + Date.now(),
    object: 'subscription',
    customer: 'cus_test_' + Date.now(),
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    metadata: {
      membershipType: 'monthly',
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User'
    }
  };

  const event = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    type: 'customer.subscription.created',
    data: {
      object: testSubscription
    }
  };

  const signature = createStripeSignature(event, WEBHOOK_SECRET);

  try {
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
      log('✅ Subscription created webhook processed successfully', 'green');
      return true;
    } else {
      log('❌ Subscription created webhook failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing subscription created: ${error.message}`, 'red');
    return false;
  }
}

async function testInvalidSignature() {
  log('\n🧪 Testing invalid signature handling...', 'cyan');
  
  const event = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_invalid',
        payment_status: 'paid'
      }
    }
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/webhooks/membership`, {
      method: 'POST',
      headers: {
        'stripe-signature': 'invalid_signature'
      },
      body: event
    });

    log(`Status: ${response.status}`, response.status === 400 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 400) {
      log('✅ Invalid signature correctly rejected', 'green');
      return true;
    } else {
      log('❌ Invalid signature not properly handled', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing invalid signature: ${error.message}`, 'red');
    return false;
  }
}

async function testMissingSignature() {
  log('\n🧪 Testing missing signature handling...', 'cyan');
  
  const event = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_missing',
        payment_status: 'paid'
      }
    }
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/webhooks/membership`, {
      method: 'POST',
      body: event
    });

    log(`Status: ${response.status}`, response.status === 400 ? 'green' : 'red');
    log(`Response:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status === 400) {
      log('✅ Missing signature correctly rejected', 'green');
      return true;
    } else {
      log('❌ Missing signature not properly handled', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing missing signature: ${error.message}`, 'red');
    return false;
  }
}

async function runWebhookTests() {
  log('🚀 Starting Membership Webhook Tests', 'bright');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Webhook Secret: ${WEBHOOK_SECRET.substring(0, 10)}...`, 'blue');

  const results = {
    checkoutSessionCompleted: await testCheckoutSessionCompleted(),
    paymentSucceeded: await testPaymentSucceeded(),
    subscriptionCreated: await testSubscriptionCreated(),
    invalidSignature: await testInvalidSignature(),
    missingSignature: await testMissingSignature()
  };

  log('\n📊 Webhook Test Results Summary:', 'bright');
  log('===============================', 'bright');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test.padEnd(25)}: ${status}`, color);
  });

  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    log('\n🎉 All webhook tests passed!', 'green');
  } else {
    log('\n⚠️  Some webhook tests failed. Check the issues above.', 'yellow');
  }

  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runWebhookTests().catch(console.error);
}

module.exports = {
  runWebhookTests,
  testCheckoutSessionCompleted,
  testPaymentSucceeded,
  testSubscriptionCreated,
  testInvalidSignature,
  testMissingSignature
};
