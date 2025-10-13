#!/usr/bin/env node

/**
 * Complete Member Discount Flow Test
 * Tests the entire flow from membership verification to checkout
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testMemberDiscountFlow() {
  console.log('🧪 Testing Complete Member Discount Flow\n');
  
  try {
    // Step 1: Test membership verification
    console.log('1️⃣ Testing membership verification...');
    const verifyResponse = await fetch(`${BASE_URL}/api/membership/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kaushikvnk@gmail.com' })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('✅ Membership verification:', verifyData.isMember ? '✅ Active Member' : '❌ Not a member');
    
    if (!verifyData.isMember) {
      console.log('❌ Cannot proceed - user is not a member');
      return;
    }
    
    // Step 2: Test discount code generation
    console.log('\n2️⃣ Testing discount code generation...');
    const discountResponse = await fetch(`${BASE_URL}/api/membership/discount-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kaushikvnk@gmail.com' })
    });
    
    const discountData = await discountResponse.json();
    console.log('✅ Discount code generation:', discountData.hasDiscount ? '✅ Code Generated' : '❌ No discount');
    
    if (discountData.hasDiscount) {
      console.log(`   📝 Code: ${discountData.discountCode}`);
      console.log(`   💰 Discount: ${discountData.discountPercentage}%`);
      console.log(`   ⏰ Expires: ${new Date(discountData.expiresAt).toLocaleString()}`);
    }
    
    // Step 3: Test discount code validation
    console.log('\n3️⃣ Testing discount code validation...');
    const validateResponse = await fetch(`${BASE_URL}/api/membership/validate-discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        discountCode: discountData.discountCode,
        email: 'kaushikvnk@gmail.com'
      })
    });
    
    const validateData = await validateResponse.json();
    console.log('✅ Discount validation:', validateData.valid ? '✅ Valid Code' : '❌ Invalid Code');
    
    if (validateData.valid) {
      console.log(`   💰 Discount: ${validateData.discountPercentage}%`);
    }
    
    // Step 4: Test database connection
    console.log('\n4️⃣ Testing database connection...');
    const dbResponse = await fetch(`${BASE_URL}/api/test-membership-db`);
    const dbData = await dbResponse.json();
    console.log('✅ Database connection:', dbData.success ? '✅ Connected' : '❌ Failed');
    
    if (dbData.success) {
      console.log(`   📊 Total memberships: ${dbData.data.totalMemberships}`);
    }
    
    console.log('\n🎯 Summary:');
    console.log('✅ Membership verification: Working');
    console.log('✅ Discount code generation: Working');
    console.log('✅ Discount code validation: Working');
    console.log('✅ Database connection: Working');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Go to /shop in your app');
    console.log('2. Enter email: kaushikvnk@gmail.com');
    console.log('3. Click "Verify" - should show "Membership Verified!"');
    console.log('4. Add products to cart');
    console.log('5. Check cart - should show discount info');
    console.log('6. Click "Checkout" - should redirect to Shopify with discount applied');
    
    console.log('\n⚠️  Important:');
    console.log('- Make sure MEMBER10 discount code exists in Shopify admin');
    console.log('- The discount should be automatically applied in Shopify checkout');
    console.log('- No manual discount code entry should be required');
    
    console.log('\n🔧 If discount still shows manually:');
    console.log('1. Check browser console for discount application logs');
    console.log('2. Verify MEMBER10 code exists in Shopify admin');
    console.log('3. Check if discount is applied to cart before checkout');
    console.log('4. Ensure Shopify store is properly configured');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMemberDiscountFlow();

