const https = require('https');

console.log('🔍 Checking your Stripe webhook configuration...\n');

// Test different possible webhook URLs
const possibleUrls = [
  'https://www.eklektikmama.com/api/webhooks/membership',
  'https://eklektikmama.com/api/webhooks/membership',
  'https://www.eklektikmama.com/api/webhooks/stripe',
  'https://eklektikmama.com/api/webhooks/stripe',
  'https://www.eklektikmama.com/webhooks/membership',
  'https://eklektikmama.com/webhooks/membership'
];

async function testWebhookUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'POST' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          accessible: res.statusCode === 200 || res.statusCode === 400, // 400 is expected for invalid signature
          response: data
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        accessible: false,
        error: error.message
      });
    });

    // Send a test webhook payload
    req.write(JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          payment_status: 'paid'
        }
      }
    }));
    req.end();
  });
}

async function checkAllUrls() {
  console.log('Testing possible webhook URLs...\n');
  
  for (const url of possibleUrls) {
    const result = await testWebhookUrl(url);
    
    if (result.accessible) {
      console.log(`✅ ${result.url} - Status: ${result.status} - ACCESSIBLE`);
    } else {
      console.log(`❌ ${result.url} - Status: ${result.status} - NOT ACCESSIBLE`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to your Stripe Dashboard: https://dashboard.stripe.com/webhooks');
  console.log('2. Find your membership webhook');
  console.log('3. Update the endpoint URL to: https://www.eklektikmama.com/api/webhooks/membership');
  console.log('4. Make sure these events are enabled:');
  console.log('   - checkout.session.completed');
  console.log('   - invoice.payment_succeeded');
  console.log('   - customer.subscription.created');
  console.log('   - customer.subscription.updated');
  console.log('   - customer.subscription.deleted');
  console.log('   - invoice.payment_failed');
}

checkAllUrls().catch(console.error);
