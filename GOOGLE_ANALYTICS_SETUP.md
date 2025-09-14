# Google Analytics Setup Guide

## Overview
Google Analytics has been integrated into your Eklektik Mama website. This guide will help you complete the setup.

## Files Added/Modified

### New Files Created:
1. `lib/gtag.js` - Google Analytics configuration and utility functions
2. `components/GoogleAnalytics.js` - React component for GA script injection

### Modified Files:
1. `app/layout.js` - Added GoogleAnalytics component import and usage

## Setup Steps

### 1. Get Your Google Analytics 4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Create a new property or use an existing one for your website
4. Go to **Admin** → **Data Streams** → **Web**
5. Create a new web stream or select your existing website
6. Copy your **Measurement ID** (format: G-XXXXXXXXXX)

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root with the following content:

```bash
# Google Analytics Configuration
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

**Important:** 
- Never commit `.env.local` to version control
- The variable name must start with `NEXT_PUBLIC_` to be accessible in the browser

### 3. Test the Integration

1. Start your development server: `npm run dev`
2. Open your website in a browser
3. Open Developer Tools (F12)
4. Go to the **Network** tab
5. Look for requests to `googletagmanager.com` and `google-analytics.com`
6. You can also check the **Console** for any GA-related messages

### 4. Verify in Google Analytics

1. Go to your Google Analytics dashboard
2. Navigate to **Reports** → **Realtime**
3. Visit your website in another browser tab
4. You should see your visit appear in the realtime report within a few seconds

## Available Tracking Functions

The setup includes pre-configured tracking functions for common events:

```javascript
import { trackEvent } from '../lib/gtag';

// Track button clicks
trackEvent.buttonClick('Subscribe Button', 'Homepage');

// Track form submissions
trackEvent.formSubmit('Newsletter Signup');

// Track external link clicks
trackEvent.externalLink('https://example.com');

// Track file downloads
trackEvent.fileDownload('brochure.pdf');

// Track newsletter signups
trackEvent.newsletterSignup('Footer');

// Track event bookings
trackEvent.eventBooking('Mama Breakfast');

// Track membership purchases
trackEvent.membershipPurchase('Premium');
```

## Custom Event Tracking

You can also track custom events:

```javascript
import { event } from '../lib/gtag';

event({
  action: 'custom_action',
  category: 'custom_category',
  label: 'custom_label',
  value: 1
});
```

## Page View Tracking

Page views are automatically tracked, but you can manually track them if needed:

```javascript
import { pageview } from '../lib/gtag';

pageview('/custom-page');
```

## Privacy Considerations

- The current setup respects user privacy by only loading GA when the tracking ID is provided
- Consider implementing cookie consent if required by your jurisdiction
- The setup uses Google Analytics 4 (GA4) which has better privacy controls than Universal Analytics

## Troubleshooting

### GA Not Loading
- Check that `NEXT_PUBLIC_GA_ID` is set correctly in `.env.local`
- Verify the Measurement ID format (should start with G-)
- Check browser console for any JavaScript errors

### No Data in GA
- Wait 24-48 hours for data to appear in reports
- Check Realtime reports for immediate verification
- Ensure your website is publicly accessible (not behind authentication)

### Development vs Production
- GA will only load when `NEXT_PUBLIC_GA_ID` is set
- You can use different tracking IDs for development and production
- Consider using a separate GA property for development

## Next Steps

1. Set up your `.env.local` file with your GA Measurement ID
2. Test the integration
3. Consider adding custom event tracking to important user actions
4. Set up goals and conversions in Google Analytics
5. Configure custom dimensions if needed for your business metrics
