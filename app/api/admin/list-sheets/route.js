import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req) {
  try {
    console.log('=== LISTING ALL SHEETS ===');
    
    const serviceAccountAuth = new google.auth.JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });
    const spreadsheetId = process.env.MEMBERSHIP_SPREADSHEET;
    
    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'MEMBERSHIP_SPREADSHEET environment variable not set',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      includeGridData: false,
    });
    
    const sheetList = response.data.sheets.map(sheet => ({
      sheetId: sheet.properties.sheetId,
      title: sheet.properties.title,
      rowCount: sheet.properties.gridProperties.rowCount,
      columnCount: sheet.properties.gridProperties.columnCount,
      sheetType: sheet.properties.sheetType
    }));
    
    console.log('📋 Found sheets:', sheetList.map(s => s.title));
    console.log('=== END LISTING SHEETS ===\n');
    
    return NextResponse.json({
      success: true,
      spreadsheetId: spreadsheetId,
      sheets: sheetList,
      totalSheets: sheetList.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error listing sheets:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
