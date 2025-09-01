# Email Setup Guide

This guide explains how to set up email notifications for booking confirmations when customers complete their payments.

## Email Service Options

The system supports multiple email services. Choose the one that works best for you:

### Option 1: SendGrid (Recommended)
- **Free tier**: 100 emails/day
- **Setup**: Simple API key configuration
- **Reliability**: High deliverability

### Option 2: Resend
- **Free tier**: 100 emails/day
- **Setup**: Simple API key configuration
- **Features**: Modern API, good documentation

### Option 3: Gmail SMTP
- **Free tier**: 500 emails/day
- **Setup**: Requires app password
- **Limitations**: Personal Gmail account required

### Option 4: Console Log (Development)
- **Free tier**: Unlimited
- **Setup**: No configuration required
- **Use case**: Development and testing only

## Setup Instructions

### Option 1: SendGrid Setup

1. **Create a SendGrid account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for a free account (100 emails/day)

2. **Get your API key**
   - Go to **Settings** → **API Keys**
   - Click **Create API Key**
   - Choose **Full Access** or **Restricted Access** (Mail Send)
   - Copy the API key

3. **Set environment variable**
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   ```

### Option 2: Resend Setup

1. **Create a Resend account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account (100 emails/day)

2. **Get your API key**
   - Go to **API Keys** in your dashboard
   - Click **Create API Key**
   - Copy the API key

3. **Set environment variable**
   ```env
   RESEND_API_KEY=your_resend_api_key_here
   ```

### Option 3: Gmail SMTP Setup

1. **Enable 2-factor authentication** on your Gmail account

2. **Generate an app password**
   - Go to **Google Account** → **Security**
   - Under **2-Step Verification**, click **App passwords**
   - Generate a password for "Mail"

3. **Set environment variables**
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_app_password_here
   ```

### Option 4: No Setup Required

For development and testing, no configuration is needed. Emails will be logged to the console.

## Step 6: Test the Email Functionality

1. Visit `/admin/test-email` in your application
2. Fill in the test form with an email address
3. Click "Send Test Email"
4. Check if the email is received

## How It Works

When a customer completes a payment:

1. **Stripe Webhook** receives the payment confirmation
2. **Booking data** is saved to the database
3. **Google Sheets** is updated with the booking information
4. **Email notification** is sent via Mailchimp with:
   - Booking details (ID, guardian name, child name, tickets, amount)
   - Event details (title, date, location, description)
   - QR code for entry
   - Contact information

## Email Content

The email includes:

### Booking Details
- Booking ID
- Guardian/Parent Name
- Child Name (if provided)
- Email Address
- Number of Tickets
- Total Amount
- Payment Status

### Event Details
- Event Title
- Date & Time (in Dubai timezone)
- Location
- Description

### QR Code
- Entry QR code for quick check-in
- Instructions to save/screenshot

### Additional Features
- Responsive design
- Brand colors (Eklektik Mama theme)
- Call-to-action button to browse more events
- Contact information

## Troubleshooting

### Email Not Sending
1. Check if all environment variables are set correctly
2. Verify your Mailchimp API key is valid
3. Ensure the audience ID exists
4. Check the server logs for error messages

### API Errors
- **401 Unauthorized**: Check your API key
- **404 Not Found**: Check your audience ID
- **400 Bad Request**: Check the email format and content

### Testing
Use the test endpoint at `/api/test-email` to verify your setup before processing real payments.

## Security Notes

- Never commit your API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor your Mailchimp usage and limits

## Alternative Email Services

If you prefer not to use Mailchimp, you can modify the `lib/mailchimp.js` file to use other email services like:
- SendGrid
- AWS SES
- Nodemailer with SMTP
- Resend
- Postmark

## Support

For issues with:
- **Mailchimp setup**: Contact Mailchimp support
- **Application integration**: Check the server logs and test endpoint
- **Email delivery**: Verify your Mailchimp account status and sending limits
