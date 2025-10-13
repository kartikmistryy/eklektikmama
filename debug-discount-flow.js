#!/usr/bin/env node

/**
 * Debug Discount Flow
 * Step-by-step debugging of the discount application process
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function debugDiscountFlow() {
  console.log('🔍 Debugging Discount Flow\n');
  
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
    console.log('The discount code is being generated correctly, but it\'s not being applied to the Shopify cart.');
    console.log('This means the issue is in the cart application process, not the membership verification.');
    
    console.log('\n🔧 Possible Solutions:');
    console.log('1. Check if MEMBER10 exists in Shopify admin');
    console.log('2. Check if the discount is active in Shopify admin');
    console.log('3. Check if there are restrictions on the discount');
    console.log('4. Check if the Shopify API credentials are correct');
    console.log('5. Check if the cart is being created properly');
    
    console.log('\n🧪 Manual Test:');
    console.log('1. Go to /shop in your app');
    console.log('2. Enter email: kaushikvnk@gmail.com');
    console.log('3. Click "Verify" - should show "Membership Verified!"');
    console.log('4. Add products to cart');
    console.log('5. Open browser console (F12)');
    console.log('6. Click "Checkout" and look for these specific logs:');
    console.log('   - "🔄 Starting checkout process..."');
    console.log('   - "📊 Current cart state: {...}"');
    console.log('   - "🎯 Member discount detected, ensuring it\'s applied to cart..."');
    console.log('   - "⚠️ No discount codes found on cart, applying now..."');
    console.log('   - "✅ Discount applied to cart successfully" OR "❌ Failed to apply discount"');
    
    console.log('\n🚨 Most Likely Issue:');
    console.log('The MEMBER10 discount code exists in Shopify admin, but there might be:');
    console.log('1. Restrictions on the discount (customer requirements, minimum order, etc.)');
    console.log('2. The discount is not active');
    console.log('3. The Shopify API is not applying the discount correctly');
    console.log('4. The cart is not being updated with the discount');
    
    console.log('\n💡 Quick Fix:');
    console.log('1. Go to Shopify Admin → Discounts');
    console.log('2. Find MEMBER10 discount');
    console.log('3. Make sure it\'s set to "Active"');
    console.log('4. Remove all restrictions (customer requirements, minimum order, etc.)');
    console.log('5. Save the discount');
    console.log('6. Test again');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugDiscountFlow();
