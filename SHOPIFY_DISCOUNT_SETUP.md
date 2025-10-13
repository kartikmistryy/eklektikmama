# 🛍️ Shopify Discount Code Setup Guide

## **Step 1: Create Discount Code in Shopify Admin**

### **Go to Shopify Admin:**
1. **Login** to your Shopify admin dashboard
2. **Navigate** to: `Discounts` → `Create discount`
3. **Choose**: `Discount code` (not automatic discount)

### **Configure the Discount:**
```
Discount Code: MEMBER10
Title: Member Discount (10% off)
Description: Exclusive discount for Eklektik Mama members
```

### **Discount Settings:**
```
Type: Percentage
Value: 10
Minimum requirements: None (or set minimum order amount)
Customer eligibility: All customers
Usage limits: No limit (or set reasonable limit)
```

### **Active Dates:**
```
Start date: Today
End date: No end date (or set far future date)
```

### **Save the discount code!**

## **Step 2: Test the Integration**

### **Test the API:**
```bash
curl -X POST http://localhost:3000/api/membership/discount-code \
  -H "Content-Type: application/json" \
  -d '{"email":"your-member-email@example.com"}'
```

### **Expected Response:**
```json
{
  "hasDiscount": true,
  "discountCode": "MEMBER10",
  "discountPercentage": 10,
  "message": "Member discount code ready"
}
```

## **Step 3: Verify in Your Shop**

### **Test Flow:**
1. **Go to** `/shop` in your application
2. **Enter member email** in the discount section
3. **Verify membership** (should show success)
4. **Add products** to cart
5. **Check cart** - should show `MEMBER10` discount code
6. **Proceed to checkout** - should show 10% discount

## **Step 4: Alternative - Dynamic Code Creation**

If you want to create discount codes dynamically, you can use Shopify's Admin API:

### **Create Discount via API:**
```javascript
// Add this to your discount code generation
const createShopifyDiscount = async (code, percentage) => {
  const response = await fetch(`https://${SHOPIFY_SHOP}.myshopify.com/admin/api/2023-10/price_rules.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_rule: {
        title: `Member Discount ${code}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: 'percentage',
        value: `-${percentage}`,
        customer_selection: 'all',
        starts_at: new Date().toISOString(),
        usage_limit: 1
      }
    })
  });
  
  const priceRule = await response.json();
  
  // Create discount code
  const codeResponse = await fetch(`https://${SHOPIFY_SHOP}.myshopify.com/admin/api/2023-10/price_rules/${priceRule.price_rule.id}/discount_codes.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      discount_code: {
        code: code
      }
    })
  });
  
  return codeResponse.json();
};
```

## **Step 5: Troubleshooting**

### **If Discount Doesn't Show:**

1. **Check Shopify Admin:**
   - Is the discount code active?
   - Are the dates correct?
   - Is the percentage set correctly?

2. **Check Your Code:**
   - Is the discount code being applied to the cart?
   - Check browser console for errors
   - Verify API responses

3. **Test Manually:**
   - Go to Shopify checkout
   - Manually enter `MEMBER10` in discount code field
   - Does it work?

### **Common Issues:**

**Issue**: Discount code not recognized
**Solution**: Make sure the code exists in Shopify admin

**Issue**: Discount shows but doesn't apply
**Solution**: Check minimum requirements and customer eligibility

**Issue**: Code works manually but not automatically
**Solution**: Check cart API integration

## **Step 6: Security Considerations**

### **For Production:**
1. **Set usage limits** in Shopify admin
2. **Monitor usage** through Shopify analytics
3. **Set expiration dates** for security
4. **Track usage** in your database

### **Member Validation:**
- Only verified members can use the code
- Code is tied to member email
- Usage is logged for security

## **Step 7: Advanced Configuration**

### **Multiple Discount Codes:**
If you want different codes for different membership types:

```javascript
const getDiscountCode = (membershipType) => {
  switch(membershipType) {
    case 'premium': return 'PREMIUM15';
    case 'basic': return 'MEMBER10';
    default: return 'MEMBER10';
  }
};
```

### **Conditional Discounts:**
```javascript
const getDiscountPercentage = (membershipType) => {
  switch(membershipType) {
    case 'premium': return 15;
    case 'basic': return 10;
    default: return 10;
  }
};
```

## **🎉 Result**

After completing these steps:
- ✅ Members get 10% discount automatically
- ✅ Discount shows in Shopify checkout
- ✅ System is secure and tracks usage
- ✅ Non-members cannot use the discount

The key is creating the `MEMBER10` discount code in your Shopify admin dashboard!

