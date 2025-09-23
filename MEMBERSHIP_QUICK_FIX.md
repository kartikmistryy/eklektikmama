# 🚨 URGENT: Membership System Fix Required

## Problem Identified
Your membership system is failing because **all environment variables are missing**. The payment processes but fails to save data because the system can't connect to:
- Stripe (for payment processing)
- Google Sheets (for data storage)
- MongoDB (for database)

## Immediate Fix Steps

### 1. Create Environment File
Create a `.env.local` file in your project root with these variables:

```bash
# STRIPE CONFIGURATION
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID=price_your_monthly_price_id_here
STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID=price_your_annual_price_id_here
STRIPE_MEMBERSHIP_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# GOOGLE SHEETS CONFIGURATION
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
MEMBERSHIP_SPREADSHEET=your_membership_spreadsheet_id_here

# DATABASE CONFIGURATION
MONGODB_URI=mongodb://localhost:27017/eklektikmama

# APPLICATION CONFIGURATION
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Get Stripe Credentials
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret Key** (starts with `sk_test_`)
3. Copy your **Publishable Key** (starts with `pk_test_`)
4. Create membership products and get their Price IDs
5. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/membership`

### 3. Get Google Sheets Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a service account
3. Download the JSON key file
4. Create a Google Sheet for membership data
5. Share the sheet with your service account email

### 4. Set Up MongoDB
- **Local**: Install MongoDB locally
- **Atlas**: Create a free MongoDB Atlas account

### 5. Test the Fix
After setting up all credentials:
```bash
node run-membership-tests.js
```

## Test Scripts Created
I've created comprehensive test scripts for you:
- `run-membership-tests.js` - Complete system test
- `test-membership-flow.js` - Core functionality test
- `test-membership-webhook.js` - Stripe webhook test
- `test-membership-sheets.js` - Google Sheets test

## Quick Debug
Check if your environment is working:
```bash
curl http://localhost:3000/api/debug-membership
```

## Expected Behavior After Fix
✅ Payment processes successfully  
✅ Data saves to Google Sheets  
✅ Welcome email sends  
✅ User sees success page  
✅ Membership is active in database  

## Need Help?
1. Check the test output for specific error messages
2. Verify all environment variables are set correctly
3. Test each component individually using the test scripts
4. Check Stripe webhook logs in your dashboard

The membership system code is correct - it just needs the proper environment configuration!
