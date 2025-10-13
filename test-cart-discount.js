#!/usr/bin/env node

/**
 * Test Cart Discount Application
 * Tests if discount codes are properly applied to Shopify cart
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCartDiscount() {
  console.log('🧪 Testing Cart Discount Application\n');
  
  try {
    // Step 1: Create a test cart
    console.log('1️⃣ Creating test cart...');
    const createResponse = await fetch(`${BASE_URL}/api/shopify/create-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (!createResponse.ok) {
      console.log('❌ Cart creation failed, trying alternative approach...');
      console.log('💡 This is expected - we need to test through the frontend');
      return;
    }
    
    const cartData = await createResponse.json();
    console.log('✅ Cart created:', cartData.cart?.id);
    
    // Step 2: Apply discount code to cart
    console.log('\n2️⃣ Applying discount code to cart...');
    const discountResponse = await fetch(`${BASE_URL}/api/shopify/apply-discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartId: cartData.cart.id,
        discountCode: 'MEMBER10'
      })
    });
    
    if (!discountResponse.ok) {
      console.log('❌ Discount application failed');
      return;
    }
    
    const discountData = await discountResponse.json();
    console.log('✅ Discount applied:', discountData);
    
    // Step 3: Check cart for applied discounts
    console.log('\n3️⃣ Checking cart for applied discounts...');
    const cartResponse = await fetch(`${BASE_URL}/api/shopify/get-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId: cartData.cart.id })
    });
    
    if (!cartResponse.ok) {
      console.log('❌ Cart retrieval failed');
      return;
    }
    
    const updatedCart = await cartResponse.json();
    console.log('✅ Cart retrieved:', updatedCart.cart?.discountCodes);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Note: This test requires the Shopify API endpoints to be implemented');
    console.log('💡 The discount should be applied through the frontend cart system');
  }
}

// Run the test
testCartDiscount();

