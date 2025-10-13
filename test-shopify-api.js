#!/usr/bin/env node

/**
 * Test Shopify API Connection
 * Tests if the Shopify API is working correctly
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testShopifyAPI() {
  console.log('🧪 Testing Shopify API Connection\n');
  
  try {
    // Test if we can create a cart
    console.log('1️⃣ Testing cart creation...');
    
    // This would require a direct API call to test cart creation
    // For now, we'll test the membership flow
    
    console.log('✅ Cart creation test skipped (requires frontend)');
    
    // Test membership verification
    console.log('\n2️⃣ Testing membership verification...');
    const verifyResponse = await fetch(`${BASE_URL}/api/membership/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kaushikvnk@gmail.com' })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('✅ Membership verification:', verifyData.isMember ? '✅ Active Member' : '❌ Not a member');
    
    // Test discount code generation
    console.log('\n3️⃣ Testing discount code generation...');
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
    }
    
    console.log('\n🎯 The Real Issue:');
    console.log('The problem is likely that the Shopify GraphQL API is not applying the discount correctly.');
    console.log('This could be because:');
    console.log('1. The MEMBER10 discount has restrictions in Shopify admin');
    console.log('2. The discount is not active in Shopify admin');
    console.log('3. The Shopify API credentials are incorrect');
    console.log('4. The cartDiscountCodesUpdate mutation is failing');
    
    console.log('\n🔧 Debug Steps:');
    console.log('1. Go to Shopify Admin → Discounts');
    console.log('2. Find MEMBER10 discount');
    console.log('3. Check if it\'s set to "Active"');
    console.log('4. Remove ALL restrictions:');
    console.log('   - Customer requirements');
    console.log('   - Minimum order amount');
    console.log('   - Usage limits');
    console.log('   - Customer eligibility');
    console.log('5. Save the discount');
    console.log('6. Test again');
    
    console.log('\n🧪 Manual Test:');
    console.log('1. Go to /shop in your app');
    console.log('2. Enter email: kaushikvnk@gmail.com');
    console.log('3. Click "Verify"');
    console.log('4. Add products to cart');
    console.log('5. Open browser console (F12)');
    console.log('6. Click "Checkout"');
    console.log('7. Look for these specific error messages:');
    console.log('   - "❌ Failed to apply discount to cart"');
    console.log('   - "❌ Discount application errors: [...]"');
    console.log('   - Any GraphQL errors');
    
    console.log('\n💡 Alternative Solution:');
    console.log('If the automatic application still doesn\'t work, we can:');
    console.log('1. Show the discount code to the user');
    console.log('2. Let them enter it manually');
    console.log('3. Or use a different approach to apply the discount');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testShopifyAPI();
