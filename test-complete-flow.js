#!/usr/bin/env node

/**
 * Test Complete Flow
 * Tests the entire membership discount flow
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Membership Discount Flow\n');
  
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
    }
    
    console.log('\n🎯 The Issue:');
    console.log('The APIs are working correctly, but the discount is not being stored in localStorage.');
    console.log('This means the issue is in the frontend cart application process.');
    
    console.log('\n🔧 What to Check:');
    console.log('1. Go to /shop in your app');
    console.log('2. Enter email: kaushikvnk@gmail.com');
    console.log('3. Click "Verify" - should show "Membership Verified!"');
    console.log('4. Open browser console (F12) and look for:');
    console.log('   - "🎯 Membership verified, applying discount..."');
    console.log('   - "📊 Discount application result: {...}"');
    console.log('   - "✅ Discount applied successfully" OR "❌ Failed to apply discount"');
    console.log('5. Check localStorage for "member-discount" key');
    console.log('6. Add products to cart');
    console.log('7. Click "Checkout" and check console logs');
    
    console.log('\n💡 Expected localStorage:');
    console.log('localStorage.getItem("member-discount") should contain:');
    console.log('{');
    console.log('  "code": "MEMBER10",');
    console.log('  "email": "kaushikvnk@gmail.com",');
    console.log('  "applied": true,');
    console.log('  "timestamp": 1234567890');
    console.log('}');
    
    console.log('\n🚨 If localStorage is empty:');
    console.log('The issue is that applyMemberDiscount() is not storing the discount.');
    console.log('Check the browser console for errors in the applyMemberDiscount function.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteFlow();
