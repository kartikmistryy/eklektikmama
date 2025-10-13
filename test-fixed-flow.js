#!/usr/bin/env node

/**
 * Test Fixed Flow
 * Tests the fixed membership discount flow
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFixedFlow() {
  console.log('🧪 Testing Fixed Membership Discount Flow\n');
  
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
    
    console.log('\n🎯 What I Fixed:');
    console.log('1. ✅ Added multiple fallback approaches to ensure discount is applied');
    console.log('2. ✅ Added better debugging to track the entire flow');
    console.log('3. ✅ Added fallback that tries to apply discount even if state is not updated');
    console.log('4. ✅ Added verification that discount is stored in localStorage');
    
    console.log('\n🔧 Test the Complete Flow:');
    console.log('1. Go to /shop in your app');
    console.log('2. Enter email: kaushikvnk@gmail.com');
    console.log('3. Click "Verify"');
    console.log('4. Open browser console (F12) and look for:');
    console.log('   - "🔄 Starting membership verification for: kaushikvnk@gmail.com"');
    console.log('   - "✅ Membership verification completed, result: {...}"');
    console.log('   - "🔍 Checking membership status: {...}"');
    console.log('   - "🎯 Membership verified, applying discount..." OR "🔄 Fallback: Trying to apply discount anyway..."');
    console.log('   - "🔄 applyMemberDiscount called for: kaushikvnk@gmail.com"');
    console.log('   - "📊 Discount application result: {...}"');
    console.log('   - "✅ Discount stored in localStorage"');
    console.log('   - "🔍 Stored discount in localStorage: {...}"');
    
    console.log('\n💡 Expected Result:');
    console.log('The discount should now be stored in localStorage and the cart state should show:');
    console.log('{');
    console.log('  cartId: "gid://shopify/Cart/...",');
    console.log('  discountCodes: [...], // Should show applied discount codes');
    console.log('  isMember: true,');
    console.log('  memberDiscount: { // Should no longer be null');
    console.log('    code: "MEMBER10",');
    console.log('    email: "kaushikvnk@gmail.com",');
    console.log('    applied: true,');
    console.log('    timestamp: 1234567890');
    console.log('  }');
    console.log('}');
    
    console.log('\n🚀 Try the flow now!');
    console.log('The system should now properly store the discount in localStorage.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFixedFlow();
