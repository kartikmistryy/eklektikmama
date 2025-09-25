import { NextResponse } from "next/server";
import { getGoogleSheet } from "@/lib/googleSheets";
import { spreadsheetIds } from "@/lib/eventForms";

export async function GET() {
  try {
    console.log('=== TESTING FAMILY DAY SHEET DATA ===');
    
    const familyDaySpreadsheetId = spreadsheetIds.familyDay;
    const doc = await getGoogleSheet(familyDaySpreadsheetId);
    
    // Check the specific sheet for the current event
    const sheetName = '04-10-2025_BYOBaby_Family_Boun_9681b3';
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      return NextResponse.json({
        success: false,
        error: `Sheet ${sheetName} not found`,
        availableSheets: Object.keys(doc.sheetsByTitle)
      });
    }
    
    console.log(`Found sheet: ${sheetName}`);
    
    // Get all rows from the sheet
    const rows = await sheet.getRows();
    console.log(`Total rows in sheet: ${rows.length}`);
    
    // Log each row's data
    const rowData = [];
    rows.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row._rawData);
      rowData.push({
        rowIndex: index + 1,
        rawData: row._rawData,
        numberOfTickets: row.get('Number of Tickets'),
        guardianName: row.get('Guardian Name'),
        childName: row.get('Child Name'),
        parent1Name: row.get('Parent 1 Name'),
        child1Name: row.get('Child 1 Name')
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'Family Day sheet data retrieved successfully',
      sheetName,
      totalRows: rows.length,
      rowData
    });
    
  } catch (error) {
    console.error('❌ Family Day sheet data test failed:', error);
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
