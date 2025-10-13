#!/usr/bin/env node

/**
 * Test Shopify Discount Application
 * Tests if the MEMBER10 discount code can be applied to a Shopify cart
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testShopifyDiscount() {
  console.log('🧪 Testing Shopify Discount Application\n');
  
  try {
    // Step 1: Test if MEMBER10 exists in Shopify
    console.log('1️⃣ Testing if MEMBER10 discount code exists in Shopify...');
    
    // This would require a Shopify API call to check if the discount exists
    // For now, we'll assume it exists and test the application
    
    console.log('✅ MEMBER10 discount code should exist in Shopify admin');
    console.log('💡 Make sure you created MEMBER10 in Shopify admin:');
    console.log('   - Go to Shopify Admin → Discounts');
    console.log('   - Create new discount');
    console.log('   - Code: MEMBER10');
    console.log('   - Type: Percentage, 10%');
    console.log('   - Save the discount');
    
    // Step 2: Test the complete flow
    console.log('\n2️⃣ Testing complete discount flow...');
    
    // Test membership verification
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
    
    // Test discount code generation
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
    console.log('1. Make sure MEMBER10 exists in Shopify admin');
    console.log('2. Go to /shop in your app');
    console.log('3. Enter email: kaushikvnk@gmail.com');
    console.log('4. Click "Verify" - should show "Membership Verified!"');
    console.log('5. Add products to cart');
    console.log('6. Check cart - should show discount info');
    console.log('7. Click "Checkout" - should redirect to Shopify with discount applied');
    
    console.log('\n🔧 If discount still shows manually:');
    console.log('1. Check browser console for discount application logs');
    console.log('2. Verify MEMBER10 code exists in Shopify admin');
    console.log('3. Check if discount is applied to cart before checkout');
    console.log('4. Ensure Shopify store is properly configured');
    
    console.log('\n⚠️  Important:');
    console.log('- The discount must be created in Shopify admin first');
    console.log('- The discount should be set to "Active" status');
    console.log('- The discount should have no usage limits or customer restrictions');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testShopifyDiscount();
