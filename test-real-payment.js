require('dotenv').config({ path: '.env.local' });
const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testRealPayment() {
  console.log('🧪 Testing Real Payment Flow...\n');
  
  try {
    // Create a real checkout session
    console.log('Creating real checkout session...');
    
    const checkoutResponse = await new Promise((resolve, reject) => {
      const req = http.request(`${BASE_URL}/api/membership/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        });
      });
      
      req.on('error', reject);
      req.write(JSON.stringify({
        email: `real-payment-test-${Date.now()}@example.com`,
        firstName: 'Real',
        lastName: 'Payment',
        phone: '+971501234567',
        membershipType: 'monthly',
        successUrl: `${BASE_URL}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${BASE_URL}/eklektikmamaMembership`
      }));
      req.end();
    });

    if (checkoutResponse.status === 200) {
      console.log('✅ Checkout session created successfully');
      console.log(`   • Session ID: ${checkoutResponse.data.id}`);
      console.log(`   • Checkout URL: ${checkoutResponse.data.url}`);
      
      console.log('\n📋 Next Steps:');
      console.log('1. Go to the checkout URL above');
      console.log('2. Complete the payment with test card: 4242 4242 4242 4242');
      console.log('3. Check your server logs for webhook processing');
      console.log('4. Check if membership appears in database and Google Sheets');
      
      console.log('\n🔍 What to look for in server logs:');
      console.log('   • "Checkout session completed: cs_live_xxxxx"');
      console.log('   • "Member added to Google Sheets with row ID: XX"');
      console.log('   • "Member welcome email sent: xxxxx"');
      console.log('   • "Membership created and activated successfully: email@example.com"');
      
    } else {
      console.log('❌ Failed to create checkout session');
      console.log(checkoutResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing real payment:', error);
  }
}

testRealPayment();
