import { NextResponse } from "next/server";
import { google } from 'googleapis';

export async function GET() {
  try {
    // Check if credentials are available
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets credentials not found',
        missing: {
          client_email: !process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          private_key: !process.env.GOOGLE_SHEETS_PRIVATE_KEY
        }
      });
    }

    // Initialize Google Sheets API
    console.log('🔐 Initializing Google Sheets authentication...');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('✅ Auth initialized, getting client...');
    const sheets = google.sheets({ version: 'v4', auth });

    // Test with a sample spreadsheet ID (you can change this)
    const testSpreadsheetId = process.env.CINEMA_MORNING_SPREADSHEET_ID;
    
    if (!testSpreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'No test spreadsheet ID available'
      });
    }

    console.log('🧪 Testing spreadsheet access...');
    const response = await sheets.spreadsheets.get({
      spreadsheetId: testSpreadsheetId,
    });

    console.log('✅ Successfully accessed spreadsheet');

    return NextResponse.json({
      success: true,
      message: 'Google Sheets connection successful',
      spreadsheet: {
        title: response.data.properties.title,
        id: testSpreadsheetId,
        sheets: response.data.sheets.map(sheet => sheet.properties.title)
      }
    });

  } catch (error) {
    console.error('❌ Google Sheets test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        message: error.message,
        code: error.code,
        status: error.status
      }
    }, { status: 500 });
  }
}
