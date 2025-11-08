# Shopify Membership Verification API

## Overview

This API endpoint verifies membership status by checking Google Sheets directly. It's designed to be used from Shopify for membership verification during checkout or discount applications.

## Endpoint

**POST** `/api/membership/verify-sheets`

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "customer@example.com"
}
```

## Response

### Success - Active Member
```json
{
  "isActiveMember": true,
  "planType": "Monthly",
  "currentPeriodEnd": "2024-12-31"
}
```

### Success - Not Active Member
```json
{
  "isActiveMember": false,
  "reason": "Membership status is cancelled"
}
```

Or:
```json
{
  "isActiveMember": false,
  "reason": "Membership period has expired",
  "currentPeriodEnd": "2024-06-30"
}
```

Or:
```json
{
  "isActiveMember": false,
  "reason": "Email not found in membership records"
}
```

### Error Responses

**400 Bad Request**
```json
{
  "error": "Email required"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to verify membership",
  "message": "Error details"
}
```

## Usage Examples

### JavaScript (Shopify Theme/Checkout)
```javascript
async function checkMembership(email) {
  try {
    const response = await fetch('https://yourdomain.com/api/membership/verify-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (data.isActiveMember) {
      console.log('Member is active!', data.planType);
      // Apply discount or show member benefits
      return true;
    } else {
      console.log('Not an active member:', data.reason);
      return false;
    }
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
}

// Usage
const customerEmail = 'customer@example.com';
const isMember = await checkMembership(customerEmail);
```

### Shopify Checkout Script
```javascript
// In your Shopify checkout script
(async function() {
  const customerEmail = checkout.customer.email;
  
  if (customerEmail) {
    try {
      const response = await fetch('https://yourdomain.com/api/membership/verify-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: customerEmail }),
      });
      
      const data = await response.json();
      
      if (data.isActiveMember) {
        // Apply discount code or show member pricing
        console.log('Active member detected:', data.planType);
      }
    } catch (error) {
      console.error('Membership check failed:', error);
    }
  }
})();
```

### cURL Example
```bash
curl -X POST https://yourdomain.com/api/membership/verify-sheets \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com"}'
```

## Required Environment Variables

Make sure these are set in your `.env.local`:

- `GOOGLE_SHEETS_CLIENT_EMAIL` - Your Google Service Account email
- `GOOGLE_SHEETS_PRIVATE_KEY` - Your Google Service Account private key
- `MEMBERSHIP_SPREADSHEET` - The Google Sheets ID containing the Members sheet

## Google Sheets Structure

The API expects a sheet named "Members" with the following columns:
- **Email** (required)
- **Status** (required) - Should be "active" for active members
- **Current Period End** (required) - Date when membership expires
- **Plan Type** (optional) - e.g., "Monthly", "Annual"

## CORS Configuration

The API includes CORS headers to allow cross-origin requests. Currently set to allow all origins (`*`). For production, you may want to restrict this to your Shopify domain:

```javascript
"Access-Control-Allow-Origin": "https://your-shopify-store.myshopify.com"
```

## Notes

- The API checks Google Sheets directly (not the database)
- Email matching is case-insensitive
- Membership must have status "active" and current period must not be expired
- The API uses read-only access to Google Sheets for security


