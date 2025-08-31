# Google Sheets Setup Guide

## Quick Fix for Testing (Skip Google Sheets)

If you want to test the booking flow immediately without setting up Google Sheets:

1. **The system will now automatically fall back to database storage** when Google Sheets is not configured
2. **Your booking form will work** and proceed to Stripe checkout
3. **Data will be saved to your MongoDB database** instead of Google Sheets

## Setting Up Google Sheets (Optional)

### Step 1: Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account
5. Download the JSON key file

### Step 2: Create Google Sheets

Create 4 separate Google Sheets for each event segment:

1. **Cinema Morning** - Share with service account email
2. **Mama Breakfast** - Share with service account email  
3. **MamaFit** - Share with service account email
4. **Eklektik Edit** - Share with service account email

### Step 3: Get Spreadsheet IDs

From each Google Sheet URL, copy the ID (between `/d/` and `/edit`):
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                                                    ↑ This is the ID
```

### Step 4: Set Environment Variables

Create a `.env.local` file in your project root:

```env
# Google Service Account
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----"

# Google Sheets IDs
CINEMA_MORNING_SPREADSHEET_ID=your-cinema-morning-sheet-id
MAMA_BREAKFAST_SPREADSHEET_ID=your-mama-breakfast-sheet-id
MAMAFIT_SPREADSHEET_ID=your-mamafit-sheet-id
EKLEKTIK_EDIT_SPREADSHEET_ID=your-eklektik-edit-sheet-id
```

### Step 5: Restart Server

After setting environment variables:
```bash
npm run dev
```

## Current Status

- ✅ **Booking form works** without Google Sheets
- ✅ **Data saved to database** as fallback
- ✅ **Stripe checkout proceeds** normally
- ⚠️ **Google Sheets integration** requires setup (optional)

## Test the Current Setup

1. Try booking an event - it should work now!
2. Check the console for detailed logging
3. Visit `/api/debug-env` to see environment status
