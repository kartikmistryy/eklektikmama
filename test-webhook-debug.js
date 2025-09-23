require('dotenv').config({ path: '.env.local' });
const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testWebhookWithDebug() {
  console.log('🧪 Testing webhook with debug information...\n');
  
  const sessionId = `cs_test_${Date.now()}`;
  const email = `webhook-debug-${Date.now()}@example.com`;
  
  console.log(`Session ID: ${sessionId}`);
  console.log(`Email: ${email}`);
  
  // Create a test webhook payload
  const webhookPayload = {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId,
        customer: `cus_test_${Date.now()}`,
        payment_status: 'paid',
        customer_details: {
          email: email,
          name: 'Webhook Debug Test'
        },
        metadata: {
          firstName: 'Webhook',
          lastName: 'Debug',
          phone: '+971501234567',
          membershipType: 'monthly'
        }
      }
    }
  };

  try {
    console.log('Sending webhook event...');
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(`${BASE_URL}/api/webhooks/membership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': 't=1234567890,v1=test_signature' // Fake signature for testing
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: data
          });
        });
      });
      
      req.on('error', reject);
      req.write(JSON.stringify(webhookPayload));
      req.end();
    });

    console.log(`Webhook response status: ${response.status}`);
    console.log(`Webhook response: ${response.data}`);
    
    if (response.status === 200) {
      console.log('✅ Webhook processed successfully');
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if membership was created
      const membershipResponse = await new Promise((resolve, reject) => {
        const req = http.request(`${BASE_URL}/api/debug-membership`, {
          method: 'GET'
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
        req.end();
      });
      
      if (membershipResponse.status === 200) {
        const memberships = membershipResponse.data.recentMemberships;
        const newMembership = memberships.find(m => m.email === email);
        
        if (newMembership) {
          console.log('✅ Membership created in database');
          console.log(`   • Email: ${newMembership.email}`);
          console.log(`   • Google Sheets Row ID: ${newMembership.googleSheetsRowId || 'NULL'}`);
          
          if (newMembership.googleSheetsRowId) {
            console.log('✅ Member added to Google Sheets');
          } else {
            console.log('❌ Member NOT added to Google Sheets');
          }
        } else {
          console.log('❌ Membership not found in database');
        }
      }
    } else {
      console.log('❌ Webhook failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  }
}

testWebhookWithDebug();
