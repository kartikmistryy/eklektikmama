# Eklektik AF Membership System Setup Guide

## Overview
This guide will help you set up the complete membership system with recurring payments, Google Sheets tracking, member discounts, and automated emails.

## ✅ Features Implemented

### 🎯 Core Features
- **Monthly & Annual Memberships** - Recurring subscription payments via Stripe
- **10% Member Discounts** - Automatic discount on event tickets for active members
- **Google Sheets Integration** - Complete member tracking and management
- **Automated Emails** - Welcome emails, payment confirmations, renewal reminders
- **Member Dashboard** - Self-service portal for members to manage subscriptions
- **Webhook Handlers** - Real-time subscription status updates

### 📊 Member Benefits
- 10% discount on all event tickets
- Exclusive access to member-only events
- Priority booking for popular events
- Private WhatsApp group access
- Special perks from partner brands
- Total savings tracking

## 🔧 Environment Variables Setup

Add these environment variables to your `.env.local` file:

### Stripe Configuration
```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Membership Product IDs (Create these in Stripe Dashboard)
STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID=price_...
STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID=price_...

# Webhook Secret for membership events
STRIPE_MEMBERSHIP_WEBHOOK_SECRET=whsec_...
```

### Google Sheets Integration
```env
# Google Sheets API
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Email Configuration
```env
# Email Settings (for member emails)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=hello@eklektikmama.com
```

## 🛠️ Stripe Setup Instructions

### Step 1: Create Products and Prices

1. **Go to Stripe Dashboard** → Products
2. **Create Monthly Membership Product:**
   - Name: "Eklektik AF Monthly Membership"
   - Description: "Monthly membership with 10% event discounts"
   - Price: $50 USD (or your preferred amount)
   - Billing: Recurring monthly
   - Copy the Price ID to `STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID`

3. **Create Annual Membership Product:**
   - Name: "Eklektik AF Annual Membership"
   - Description: "Annual membership with 10% event discounts"
   - Price: $500 USD (or your preferred amount)
   - Billing: Recurring yearly
   - Copy the Price ID to `STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID`

### Step 2: Set Up Webhooks

1. **Go to Stripe Dashboard** → Webhooks
2. **Add Endpoint:** `https://yourdomain.com/api/webhooks/membership`
3. **Select Events:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
4. **Copy Webhook Secret** to `STRIPE_MEMBERSHIP_WEBHOOK_SECRET`

## 📊 Google Sheets Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
2. **Create a new project** or select existing
3. **Enable Google Sheets API**
4. **Create Service Account:**
   - Go to IAM & Admin → Service Accounts
   - Create Service Account
   - Download JSON key file
   - Extract email and private key for environment variables

### Step 2: Create Google Sheet

1. **Create a new Google Sheet**
2. **Name it:** "Eklektik AF Members"
3. **Share with service account email** (from JSON file)
4. **Copy Sheet ID** to `GOOGLE_SHEET_ID`

The system will automatically create the "Members" tab with these columns:
- Row ID, Email, First Name, Last Name, Phone
- Membership Type, Status, Signup Date
- Current Period Start/End, Next Payment Date
- Stripe Customer ID, Stripe Subscription ID
- Total Savings, Notes, Last Updated

## 📧 Email Setup

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

## 🚀 API Endpoints

### Membership Checkout
```
POST /api/membership/checkout
```
**Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+971501234567",
  "membershipType": "monthly" // or "annual"
}
```

### Membership Verification
```
POST /api/membership/verify
GET /api/membership/verify?email=user@example.com
```

### Membership Cancellation
```
POST /api/membership/cancel
```
**Body:**
```json
{
  "email": "user@example.com"
}
```

### Webhook Handler
```
POST /api/webhooks/membership
```

## 🎨 Frontend Integration

### Member Dashboard
- **URL:** `/member-dashboard`
- **Features:** Check membership status, view benefits, cancel subscription

### Event Checkout Integration
- **Automatic member detection** during event booking
- **10% discount applied** automatically for active members
- **Savings tracking** in both database and Google Sheets

## 📱 User Flow

### New Member Signup
1. User visits `/eklektikmamaMembership`
2. Selects monthly or annual membership
3. Completes Stripe checkout
4. Receives welcome email
5. Added to Google Sheets
6. Can immediately use member benefits

### Event Booking with Discount
1. Member books event ticket
2. System checks membership status
3. 10% discount applied automatically
4. Savings tracked in database and Google Sheets
5. Member receives booking confirmation

### Member Management
1. Member visits `/member-dashboard`
2. Enters email to check status
3. Views membership details and benefits
4. Can cancel subscription if needed

## 🔄 Automated Processes

### Webhook Events
- **Payment Success:** Updates membership status, sends confirmation email
- **Payment Failed:** Marks membership as past_due
- **Subscription Cancelled:** Updates status, removes from active members
- **Subscription Updated:** Syncs period dates and status

### Email Automation
- **Welcome Email:** Sent immediately after successful signup
- **Payment Confirmation:** Sent after each successful payment
- **Renewal Reminder:** Sent before subscription renews
- **Cancellation Confirmation:** Sent when subscription is cancelled

## 📈 Analytics & Tracking

### Google Sheets Tracking
- **Real-time member data** sync
- **Payment history** and status updates
- **Total savings** calculation per member
- **Membership analytics** and reporting

### Database Tracking
- **Member profiles** with full subscription details
- **Savings tracking** per member
- **Status management** with automatic updates
- **Audit trail** of all membership changes

## 🛡️ Security Features

- **Email verification** for membership checks
- **Secure webhook validation** with Stripe signatures
- **Protected API endpoints** with proper error handling
- **Data encryption** for sensitive information
- **Access control** for member dashboard

## 🎯 Next Steps

1. **Set up environment variables** as outlined above
2. **Create Stripe products** and configure webhooks
3. **Set up Google Sheets** and service account
4. **Configure email settings** for automated emails
5. **Test the complete flow** with a test membership
6. **Deploy to production** and monitor webhook events

## 📞 Support

For any issues or questions:
- Check the console logs for error messages
- Verify all environment variables are set correctly
- Test webhook endpoints with Stripe CLI
- Monitor Google Sheets for data sync issues

The membership system is now fully integrated and ready to provide an excellent experience for your Eklektik AF members! 🎉
