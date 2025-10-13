// Script to create MEMBER10 discount in Shopify via API
// Run this with: node create-shopify-discount.js

const SHOPIFY_SHOP = 'your-store-name'; // Replace with your store name
const SHOPIFY_ACCESS_TOKEN = 'your-access-token'; // Get from Shopify admin

async function createMemberDiscount() {
  try {
    console.log('🔄 Creating MEMBER10 discount in Shopify...');
    
    // Step 1: Create the price rule
    const priceRuleResponse = await fetch(`https://${SHOPIFY_SHOP}.myshopify.com/admin/api/2023-10/price_rules.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_rule: {
          title: 'Member Discount (10% off)',
          target_type: 'line_item',
          target_selection: 'all',
          allocation_method: 'across',
          value_type: 'percentage',
          value: '-10',
          customer_selection: 'all',
          starts_at: new Date().toISOString(),
          usage_limit: 1000
        }
      })
    });

    if (!priceRuleResponse.ok) {
      throw new Error(`Price rule creation failed: ${priceRuleResponse.status}`);
    }

    const priceRule = await priceRuleResponse.json();
    console.log('✅ Price rule created:', priceRule.price_rule.id);

    // Step 2: Create the discount code
    const discountCodeResponse = await fetch(`https://${SHOPIFY_SHOP}.myshopify.com/admin/api/2023-10/price_rules/${priceRule.price_rule.id}/discount_codes.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        discount_code: {
          code: 'MEMBER10'
        }
      })
    });

    if (!discountCodeResponse.ok) {
      throw new Error(`Discount code creation failed: ${discountCodeResponse.status}`);
    }

    const discountCode = await discountCodeResponse.json();
    console.log('✅ Discount code MEMBER10 created successfully!');
    console.log('🎉 You can now use MEMBER10 in your checkout');

  } catch (error) {
    console.error('❌ Error creating discount:', error.message);
    console.log('💡 Make sure you have the correct Shopify credentials');
  }
}

// Run the script
createMemberDiscount();

