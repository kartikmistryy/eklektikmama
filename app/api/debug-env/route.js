import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const envCheck = {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      GOOGLE_SHEETS_CLIENT_EMAIL: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      GOOGLE_SHEETS_PRIVATE_KEY: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      GOOGLE_SHEETS_SPREADSHEET_ID: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    };

    // Test Google Sheets if credentials are available
    let sheetsTest = null;
    if (envCheck.GOOGLE_SHEETS_CLIENT_EMAIL && 
        envCheck.GOOGLE_SHEETS_PRIVATE_KEY && 
        envCheck.GOOGLE_SHEETS_SPREADSHEET_ID) {
      
      try {
        const auth = new google.auth.JWT(
          process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          undefined,
          process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
          ["https://www.googleapis.com/auth/spreadsheets"]
        );

        const sheets = google.sheets({ version: 'v4', auth });
        
        // Try to read the spreadsheet
        const response = await sheets.spreadsheets.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        });

        sheetsTest = {
          success: true,
          spreadsheetTitle: response.data.properties.title,
          sheets: response.data.sheets.map(sheet => sheet.properties.title)
        };
      } catch (error) {
        sheetsTest = {
          success: false,
          error: error.message,
          code: error.code
        };
      }
    }

    return NextResponse.json({
      environment: envCheck,
      googleSheets: sheetsTest,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error.message
    }, { status: 500 });
  }
}
