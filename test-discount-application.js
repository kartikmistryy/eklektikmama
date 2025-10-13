#!/usr/bin/env node

/**
 * Test Discount Application
 * Tests if the discount is properly applied to the cart
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testDiscountApplication() {
  console.log('🧪 Testing Discount Application\n');
  
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
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Go to /shop in your app');
    console.log('2. Enter email: kaushikvnk@gmail.com');
    console.log('3. Click "Verify" - should show "Membership Verified!"');
    console.log('4. Add products to cart');
    console.log('5. Check cart - should show discount info');
    console.log('6. Open browser console (F12) to see debug logs');
    console.log('7. Click "Checkout" - check console for discount application logs');
    console.log('8. Verify discount is applied in Shopify checkout');
    
    console.log('\n🔍 What to look for in console:');
    console.log('- "🔄 Starting checkout process..."');
    console.log('- "🎯 Member discount detected, ensuring it\'s applied to cart..."');
    console.log('- "✅ Discount applied to cart successfully"');
    console.log('- "🔄 Cart updated with discount: {...}"');
    
    console.log('\n❌ If you see errors:');
    console.log('- "❌ Failed to apply discount to cart"');
    console.log('- Check if MEMBER10 exists in Shopify admin');
    console.log('- Check if discount is active in Shopify admin');
    console.log('- Check if there are restrictions on the discount');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDiscountApplication();
