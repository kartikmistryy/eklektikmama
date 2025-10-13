// Test script to verify the discount flow
// Run with: node test-discount-flow.js

const testDiscountFlow = async () => {
  console.log('🧪 Testing discount flow...');
  
  try {
    // Test 1: Check if MEMBER10 exists in Shopify
    console.log('\n1️⃣ Testing if MEMBER10 discount code exists...');
    
    // You can test this by going to your Shopify checkout and manually entering MEMBER10
    console.log('📝 Manual test: Go to your Shopify checkout and enter MEMBER10');
    console.log('   - If it works: Discount code exists ✅');
    console.log('   - If it fails: Need to create MEMBER10 in Shopify admin ❌');
    
    // Test 2: Check API endpoint
    console.log('\n2️⃣ Testing API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/membership/discount-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    
    const data = await response.json();
    console.log('📊 API Response:', data);
    
    if (data.hasDiscount) {
      console.log('✅ API is working - discount code generated');
      console.log('🎯 Discount code:', data.discountCode);
    } else {
      console.log('❌ API issue - no membership found');
      console.log('💡 You need to create a test membership in your database');
    }
    
    // Test 3: Check localStorage
    console.log('\n3️⃣ Testing localStorage...');
    console.log('📝 Check browser localStorage for "member-discount" key');
    console.log('   - Should contain discount code and email');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Create MEMBER10 discount code in Shopify admin');
    console.log('2. Create a test membership in your database');
    console.log('3. Test the complete flow in your app');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testDiscountFlow();

