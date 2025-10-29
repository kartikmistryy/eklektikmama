import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { spreadsheetIds } from '@/lib/eventForms';

export async function GET(req) {
  try {
    console.log('=== LISTING ALL CONFIGURED SPREADSHEETS ===');
    
    const serviceAccountAuth = new google.auth.JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });
    
    // Get all configured spreadsheets
    const allSpreadsheets = {
      membership: {
        id: process.env.MEMBERSHIP_SPREADSHEET,
        name: 'Membership',
        type: 'membership'
      },
      ...Object.entries(spreadsheetIds).reduce((acc, [segment, spreadsheetId]) => {
        if (spreadsheetId) {
          acc[segment] = {
            id: spreadsheetId,
            name: segment,
            type: 'event'
          };
        }
        return acc;
      }, {})
    };
    
    // Remove duplicates and null values
    const uniqueSpreadsheets = {};
    Object.values(allSpreadsheets).forEach(spreadsheet => {
      if (spreadsheet.id && !uniqueSpreadsheets[spreadsheet.id]) {
        uniqueSpreadsheets[spreadsheet.id] = spreadsheet;
      }
    });
    
    console.log('📋 Found spreadsheets:', Object.keys(uniqueSpreadsheets));
    
    // Get sheets for each spreadsheet
    const spreadsheetDetails = [];
    
    for (const [spreadsheetId, spreadsheetInfo] of Object.entries(uniqueSpreadsheets)) {
      try {
        console.log(`📊 Getting sheets for ${spreadsheetInfo.name} (${spreadsheetId})...`);
        
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
        
        spreadsheetDetails.push({
          ...spreadsheetInfo,
          spreadsheetId,
          sheets: sheetList,
          totalSheets: sheetList.length
        });
        
        console.log(`✅ Found ${sheetList.length} sheets in ${spreadsheetInfo.name}`);
        
      } catch (error) {
        console.error(`❌ Error getting sheets for ${spreadsheetInfo.name}:`, error.message);
        spreadsheetDetails.push({
          ...spreadsheetInfo,
          spreadsheetId,
          error: error.message,
          sheets: [],
          totalSheets: 0
        });
      }
    }
    
    const totalSheets = spreadsheetDetails.reduce((sum, spreadsheet) => sum + spreadsheet.totalSheets, 0);
    
    console.log(`📊 Total: ${spreadsheetDetails.length} spreadsheets, ${totalSheets} sheets`);
    console.log('=== END LISTING SPREADSHEETS ===\n');
    
    return NextResponse.json({
      success: true,
      summary: {
        totalSpreadsheets: spreadsheetDetails.length,
        totalSheets: totalSheets,
        spreadsheetsWithErrors: spreadsheetDetails.filter(s => s.error).length
      },
      spreadsheets: spreadsheetDetails,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error listing all spreadsheets:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}




