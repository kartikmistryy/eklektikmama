# Discount Code Troubleshooting Guide

## 🚨 Issue: Discount Code Still Shows Manual Input

### ✅ Step 1: Verify MEMBER10 Exists in Shopify Admin

1. **Go to Shopify Admin** → Discounts
2. **Create new discount** (if not exists):
   - **Code**: `MEMBER10`
   - **Type**: Percentage
   - **Value**: 10%
   - **Status**: Active
   - **Usage limits**: None
   - **Customer eligibility**: All customers
   - **Minimum requirements**: None
3. **Save the discount**

### ✅ Step 2: Test the Complete Flow

1. **Go to** `/shop` in your app
2. **Enter email**: `kaushikvnk@gmail.com`
3. **Click "Verify"** → Should show "Membership Verified!"
4. **Add products** to cart
5. **Check cart** → Should show discount info
6. **Open browser console** (F12) to see debug logs
7. **Click "Checkout"** → Check console for discount application logs

### 🔍 Step 3: Check Console Logs

Look for these logs in the browser console:

```
🔄 Starting checkout process...
📊 Current cart state: { cartId: "...", discountCodes: [...], isMember: true, memberDiscount: "..." }
🎯 Member discount detected, ensuring it's applied to cart...
📝 Discount code: MEMBER10
⚠️ No discount codes found on cart, applying now...
✅ Discount applied to cart: {...}
```

### ❌ Common Issues & Solutions

#### Issue 1: "MEMBER10 doesn't exist in Shopify admin"
**Solution**: Create the discount code in Shopify admin as described in Step 1

#### Issue 2: "Discount code is not active"
**Solution**: Check that the discount is set to "Active" status in Shopify admin

#### Issue 3: "There are restrictions on the discount"
**Solution**: Remove all restrictions from the discount code in Shopify admin

#### Issue 4: "No discount codes found on cart"
**Solution**: The discount application is failing. Check:
- Shopify API credentials are correct
- Store domain is correct
- Access token has proper permissions

#### Issue 5: "Failed to apply discount to cart"
**Solution**: Check the error message in console for specific details

### 🛠️ Debug Steps

1. **Check browser console** for error messages
2. **Verify MEMBER10 exists** in Shopify admin
3. **Test API endpoints**:
   ```bash
   curl -X POST http://localhost:3000/api/membership/verify \
     -H "Content-Type: application/json" \
     -d '{"email":"kaushikvnk@gmail.com"}'
   ```
4. **Check cart state** in browser console
5. **Verify Shopify credentials** in environment variables

### 🎯 Expected Behavior

When working correctly:
1. **Member verifies email** → System generates `MEMBER10` code
2. **Discount applied to cart** → Using Shopify GraphQL API
3. **Cart shows discount** → Both calculated and applied discounts visible
4. **Checkout redirect** → Simple redirect (discount already applied to cart)
5. **Shopify checkout** → Shows discounted prices automatically

### 🚀 Final Test

1. **Clear browser cache** and localStorage
2. **Go to** `/shop`
3. **Enter email**: `kaushikvnk@gmail.com`
4. **Click "Verify"**
5. **Add products** to cart
6. **Check cart** for discount info
7. **Click "Checkout"** and check console logs
8. **Verify discount** is applied in Shopify checkout

### 📞 If Still Not Working

1. **Check Shopify admin** for discount code status
2. **Verify API credentials** are correct
3. **Check browser console** for specific error messages
4. **Test with a different email** that has active membership
5. **Contact support** with console logs and error messages
