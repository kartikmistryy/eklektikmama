const https = require('https');

console.log('🔍 Checking your webhook configuration...\n');

// Test if your webhook is accessible from the internet
const testUrl = 'https://www.eklektikmama.com/api/webhooks/membership';

console.log(`Testing webhook URL: ${testUrl}`);

const req = https.request(testUrl, { method: 'GET' }, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Your webhook endpoint is accessible from the internet!');
    console.log('✅ This means Stripe can reach your webhook');
  } else if (res.statusCode === 405) {
    console.log('✅ Your webhook endpoint is accessible (Method Not Allowed is expected for GET)');
    console.log('✅ This means Stripe can reach your webhook');
  } else {
    console.log('❌ Your webhook endpoint returned an unexpected status');
  }
});

req.on('error', (error) => {
  console.log('❌ Error accessing webhook:', error.message);
  console.log('\n🔧 This means your webhook URL is not accessible from the internet');
  console.log('🔧 You need to update your Stripe webhook URL to:');
  console.log('   https://www.eklektikmama.com/api/webhooks/membership');
});

req.end();
