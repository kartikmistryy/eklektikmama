# 🎯 Complete Stripe Membership System Setup Guide

## 🚀 **What You Get:**
- **Fully automated membership system** with Stripe subscriptions
- **10% discount** automatically applied to event tickets for members
- **Automatic renewals** - no manual work required
- **Professional member experience** with self-service portal
- **Comprehensive admin panel** for managing members
- **Google Sheets integration** for tracking and analytics
- **Automated email notifications** for all membership events

---

## 📋 **Setup Checklist:**

### **1. Environment Variables (Required)**
Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)

# Membership Product IDs (from Stripe Dashboard)
STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID=price_...
STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID=price_...

# Webhook Secret (from Stripe Dashboard)
STRIPE_MEMBERSHIP_WEBHOOK_SECRET=whsec_...

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Database (already configured)
MONGODB_URI=mongodb://...

# Google Sheets (already configured)
GOOGLE_SHEETS_CREDENTIALS=...
MEMBERSHIP_SPREADSHEET=your_google_sheets_id_here

# Email Service (already configured)
RESEND_API_KEY=...
```

### **2. Stripe Dashboard Setup (5 minutes)**

#### **Step 1: Create Products**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Click "Add Product"
3. **Monthly Membership:**
   - Name: "Eklektik AF Monthly Membership"
   - Price: AED 50.00
   - Billing: Recurring monthly
   - Copy the Price ID (starts with `price_`)
4. **Annual Membership:**
   - Name: "Eklektik AF Annual Membership" 
   - Price: AED 490.00
   - Billing: Recurring yearly
   - Copy the Price ID (starts with `price_`)

#### **Step 2: Set Up Webhook**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** `https://yourdomain.com/api/webhooks/membership`
4. **Events to send:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.upcoming`
   - `customer.subscription.trial_will_end`
5. Copy the webhook secret (starts with `whsec_`)

#### **Step 3: Enable Customer Portal**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Settings → Billing → Customer portal
2. Click "Activate test link" (or "Activate live link" for production)
3. Configure the portal settings:
   - Allow customers to update payment methods
   - Allow customers to view billing history
   - Allow customers to cancel subscriptions

### **3. Install Dependencies**
```bash
npm install @stripe/stripe-js
```

### **4. Google Sheets Setup**
Your existing Google Sheets integration will work automatically. The system will:
- Add new members to the sheet
- Update member status and payment dates
- Track total savings per member

### **5. Email Configuration**
Your existing email service (Resend) will automatically send:
- Welcome emails for new members
- Payment confirmation emails for renewals
- Renewal reminder emails before payments

---

## 🔄 **How the System Works:**

### **Member Signup Flow:**
1. **Member visits** `/eklektikmamaMembership`
2. **Fills out form** with personal details
3. **Clicks "Join Now"** → Redirected to Stripe Checkout
4. **Completes payment** → Stripe processes subscription
5. **Webhook triggered** → System creates membership record
6. **Welcome email sent** → Member gets confirmation
7. **Google Sheets updated** → Admin can track member

### **Event Booking with Discount:**
1. **Member books event** → System checks membership status
2. **If active member** → 10% discount automatically applied
3. **Payment processed** → Member pays discounted price
4. **Savings tracked** → Updated in database and Google Sheets

### **Automatic Renewals:**
1. **Stripe charges card** automatically on renewal date
2. **Payment succeeds** → Membership extended, confirmation email sent
3. **Payment fails** → Stripe retries, member notified
4. **Admin can follow up** via Stripe Dashboard

### **Member Self-Service:**
1. **Member visits** `/member-dashboard`
2. **Enters email** → System shows membership status
3. **Clicks "Manage Subscription"** → Redirected to Stripe Portal
4. **Can update payment method, view history, cancel** → All handled by Stripe

---

## 🛠️ **Admin Features:**

### **Admin Panel** (`/admin/memberships`):
- **View all members** with status, expiry dates, savings
- **Add manual members** (for special cases)
- **Direct links to Stripe** for customer/subscription management
- **Real-time status updates** from webhooks

### **Stripe Dashboard:**
- **View all customers** and their subscription status
- **Handle failed payments** and retry attempts
- **Process refunds** if needed
- **View detailed billing history**

---

## 🔒 **Security & Reliability:**

### **Webhook Security:**
- All webhooks are verified using Stripe signatures
- Only legitimate Stripe events are processed
- Failed webhook processing is logged for debugging

### **Data Protection:**
- Member data stored securely in MongoDB
- Payment data handled entirely by Stripe (PCI compliant)
- No sensitive payment information stored locally

### **Error Handling:**
- System continues working even if Google Sheets fails
- Email failures don't break the membership process
- Comprehensive error logging for debugging

---

## 🧪 **Testing:**

### **Test Mode:**
1. Use Stripe test keys (`sk_test_` and `pk_test_`)
2. Use test card numbers from [Stripe docs](https://stripe.com/docs/testing)
3. Test webhook locally using Stripe CLI or ngrok

### **Test Cards:**
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`

### **Test Scenarios:**
1. **New member signup** → Check database, Google Sheets, email
2. **Event booking with discount** → Verify 10% discount applied
3. **Subscription renewal** → Check automatic renewal and email
4. **Payment failure** → Test retry logic and notifications
5. **Member cancellation** → Verify access continues until period end

---

## 🚀 **Deployment:**

### **Production Checklist:**
1. **Switch to live Stripe keys** (`sk_live_` and `pk_live_`)
2. **Update webhook URL** to production domain
3. **Test with real payment methods**
4. **Monitor webhook logs** for any issues
5. **Set up Stripe monitoring** for failed payments

### **Monitoring:**
- **Stripe Dashboard** → Monitor subscription health
- **Webhook logs** → Check for processing errors
- **Google Sheets** → Track member growth and savings
- **Email delivery** → Monitor welcome/confirmation emails

---

## 💰 **Pricing & Fees:**

### **Stripe Fees:**
- **Monthly membership:** AED 50 × 2.9% = AED 1.45 per month
- **Annual membership:** AED 490 × 2.9% = AED 14.21 per year
- **Event tickets:** Existing fees unchanged

### **Value Proposition:**
- **Zero manual work** after setup
- **Professional member experience**
- **Automatic renewals and billing**
- **Comprehensive tracking and analytics**
- **Scalable to any number of members**

---

## 🆘 **Troubleshooting:**

### **Common Issues:**

#### **Webhook Not Working:**
- Check webhook URL is correct
- Verify webhook secret in environment variables
- Check Stripe webhook logs for errors

#### **Discount Not Applied:**
- Verify member status is 'active'
- Check membership verification API
- Ensure event checkout includes membership check

#### **Email Not Sending:**
- Check Resend API key configuration
- Verify email templates in `lib/memberEmails.js`
- Check webhook processing logs

#### **Google Sheets Not Updating:**
- Verify Google Sheets credentials
- Check spreadsheet ID and permissions
- Review error logs in webhook processing

### **Support:**
- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **Webhook Testing:** Use Stripe CLI for local testing
- **Error Logs:** Check your application logs for detailed error messages

---

## ✅ **Final Verification:**

After setup, verify these work:
1. ✅ Member can sign up and pay via Stripe
2. ✅ Welcome email is sent automatically
3. ✅ Member appears in Google Sheets
4. ✅ Member gets 10% discount on event tickets
5. ✅ Subscription renews automatically
6. ✅ Member can manage subscription via portal
7. ✅ Admin can view all members in admin panel
8. ✅ Webhooks process all subscription events

**🎉 Your automated membership system is ready!**

---

## 📞 **Need Help?**

If you encounter any issues during setup:
1. Check the error logs in your application
2. Verify all environment variables are set correctly
3. Test with Stripe test mode first
4. Check Stripe Dashboard for webhook delivery status

The system is designed to be robust and handle errors gracefully, so even if one component fails (like Google Sheets), the core membership functionality will continue working.
