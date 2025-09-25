import { NextResponse } from "next/server";
import { getGoogleSheet } from "@/lib/googleSheets";
import { spreadsheetIds } from "@/lib/eventForms";

export async function GET() {
  try {
    console.log('=== TESTING FAMILY DAY SPREADSHEET ===');
    
    // Check if family day spreadsheet ID is configured
    const familyDaySpreadsheetId = spreadsheetIds.familyDay;
    console.log('Family Day Spreadsheet ID:', familyDaySpreadsheetId);
    
    if (!familyDaySpreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'FAMILY_DAY_SPREADSHEET_ID environment variable not set',
        spreadsheetId: familyDaySpreadsheetId
      });
    }
    
    // Try to connect to the spreadsheet
    console.log('Attempting to connect to family day spreadsheet...');
    const doc = await getGoogleSheet(familyDaySpreadsheetId);
    console.log('✅ Successfully connected to family day spreadsheet');
    
    // List all sheets in the spreadsheet
    const sheets = doc.sheetsByTitle;
    console.log('Available sheets:', Object.keys(sheets));
    
    return NextResponse.json({
      success: true,
      message: 'Family Day spreadsheet connection successful',
      spreadsheetId: familyDaySpreadsheetId,
      availableSheets: Object.keys(sheets),
      totalSheets: Object.keys(sheets).length
    });
    
  } catch (error) {
    console.error('❌ Family Day spreadsheet test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
