import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    // Check if environment variables are set
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      return NextResponse.json({ 
        error: 'GOOGLE_SHEETS_CLIENT_EMAIL not configured' 
      }, { status: 400 });
    }
    
    if (!process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      return NextResponse.json({ 
        error: 'GOOGLE_SHEETS_PRIVATE_KEY not configured' 
      }, { status: 400 });
    }
    
    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      return NextResponse.json({ 
        error: 'GOOGLE_SHEETS_SPREADSHEET_ID not configured' 
      }, { status: 400 });
    }

    // Test Google Sheets authentication
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Test reading from the sheet
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Sheet1!A1:Z1', // Read first row to check headers
    });

    // Test writing a test row
    const testRow = [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }),
      'TEST EVENT',
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }),
      'Test Guardian',
      'Test Child',
      'test@example.com',
      '+1234567890',
      1,
      'TEST_TRANSACTION_ID',
      'Test',
      new Date().toISOString()
    ];

    const writeResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Sheet1!A:K',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [testRow],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Google Sheets integration is working!',
      testRow: testRow,
      headers: readResponse.data.values?.[0] || [],
      writeResponse: writeResponse.data
    });

  } catch (error) {
    console.error('Google Sheets Test Error:', error);
    return NextResponse.json({
      error: 'Google Sheets test failed',
      details: error.message
    }, { status: 500 });
  }
}
