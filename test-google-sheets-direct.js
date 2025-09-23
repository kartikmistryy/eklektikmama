require('dotenv').config({ path: '.env.local' });

// Test Google Sheets via API endpoint instead
const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testGoogleSheets() {
  console.log('🧪 Testing Google Sheets integration via API...\n');
  
  const testData = {
    email: `test-direct-${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'Direct',
    phone: '+971501234567',
    membershipType: 'monthly',
    paymentMethod: 'Test',
    paymentReference: 'TEST-DIRECT-123'
  };

  try {
    console.log('Adding member via manual signup API...');
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(`${BASE_URL}/api/membership/manual-signup`, {
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
      req.write(JSON.stringify(testData));
      req.end();
    });

    if (response.status === 200 && response.data.success) {
      console.log(`✅ Successfully added member via API`);
      console.log(`   • Email: ${response.data.membership.email}`);
      console.log(`   • Google Sheets Row: ${response.data.membership.googleSheetsRowId}`);
      return true;
    } else {
      console.error('❌ API call failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error calling API:', error);
    return false;
  }
}

testGoogleSheets().then(success => {
  if (success) {
    console.log('\n🎉 Google Sheets integration is working!');
  } else {
    console.log('\n❌ Google Sheets integration has issues');
  }
  process.exit(success ? 0 : 1);
});
