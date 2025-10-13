#!/usr/bin/env node

/**
 * Test Discount API
 * Tests the discount code API directly
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testDiscountAPI() {
  console.log('🧪 Testing Discount Code API\n');
  
  try {
    // Test discount code generation
    console.log('1️⃣ Testing discount code generation...');
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
    } else if (discountData.error) {
      console.log(`   ❌ Error: ${discountData.error}`);
      console.log(`   📝 Details: ${discountData.details}`);
      console.log(`   🔍 Type: ${discountData.type}`);
    }
    
    console.log('\n🎯 The Issue:');
    console.log('The API works when called directly, but fails when called from the frontend.');
    console.log('This suggests there might be a timing issue or a different error in the frontend.');
    
    console.log('\n🔧 What to Check:');
    console.log('1. Go to /shop in your app');
    console.log('2. Enter email: kaushikvnk@gmail.com');
    console.log('3. Click "Verify"');
    console.log('4. Open browser console (F12) and look for:');
    console.log('   - "🔄 applyMemberDiscount called for: kaushikvnk@gmail.com"');
    console.log('   - "📊 Current cart state: {...}"');
    console.log('   - "📊 Discount code response: {...}"');
    console.log('   - "❌ Discount code API error: ..."');
    console.log('   - "❌ Error details: ..."');
    console.log('   - "❌ Error type: ..."');
    
    console.log('\n💡 Possible Issues:');
    console.log('1. Database connection timeout in frontend context');
    console.log('2. Different error handling in frontend vs direct API call');
    console.log('3. Timing issue with database operations');
    console.log('4. Different request headers or context');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDiscountAPI();
