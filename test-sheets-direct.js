// Test Google Sheets directly using the googleapis library
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testGoogleSheetsDirect() {
  try {
    console.log('🔍 Testing Google Sheets Direct Access...');
    console.log('MEMBERSHIP_SPREADSHEET ID:', process.env.MEMBERSHIP_SPREADSHEET);
    
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY || !process.env.MEMBERSHIP_SPREADSHEET) {
      console.error('❌ Missing required environment variables');
      return;
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get spreadsheet info
    console.log('📄 Getting spreadsheet info...');
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.MEMBERSHIP_SPREADSHEET,
    });

    console.log('✅ Connected to spreadsheet:', spreadsheetInfo.data.properties.title);
    console.log('📋 Available sheets:', spreadsheetInfo.data.sheets.map(sheet => sheet.properties.title));

    // Check if Members sheet exists
    const membersSheet = spreadsheetInfo.data.sheets.find(sheet => sheet.properties.title === 'Members');
    
    if (!membersSheet) {
      console.log('❌ Members sheet not found');
      console.log('Available sheets:', spreadsheetInfo.data.sheets.map(sheet => sheet.properties.title));
      return;
    }

    console.log('✅ Found Members sheet');

    // Read data from Members sheet
    console.log('📊 Reading data from Members sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.MEMBERSHIP_SPREADSHEET,
      range: 'Members!A:Z',
    });

    const rows = response.data.values || [];
    console.log(`📝 Total rows in Members sheet: ${rows.length}`);

    if (rows.length === 0) {
      console.log('❌ No data found in Members sheet');
      return;
    }

    console.log('\n📊 Members Sheet Data:');
    console.log('=====================================');
    
    // Show header row
    if (rows.length > 0) {
      console.log('Headers:', rows[0]);
    }

    // Show data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      console.log(`\nRow ${i}:`);
      console.log(`  Email: ${row[1] || 'N/A'}`);
      console.log(`  First Name: ${row[2] || 'N/A'}`);
      console.log(`  Last Name: ${row[3] || 'N/A'}`);
      console.log(`  Plan Type: ${row[5] || 'N/A'}`);
      console.log(`  Status: ${row[6] || 'N/A'}`);
      console.log(`  Current Period End: ${row[9] || 'N/A'}`);
      console.log(`  Notes: ${row[16] || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Error accessing Google Sheets:', error.message);
    console.error('Full error:', error);
  }
}

testGoogleSheetsDirect();
