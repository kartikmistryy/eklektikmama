import { NextResponse } from 'next/server';
import { getSheetData, getCacheStatus } from '@/lib/googleSheetsChangeDetector';

export async function GET(req) {
  try {
    console.log('=== DEBUGGING SHEET CHANGES ===');
    
    const spreadsheetId = process.env.MEMBERSHIP_SPREADSHEET;
    const sheetName = 'Members';
    
    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'MEMBERSHIP_SPREADSHEET environment variable not set',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // Get current sheet data
    console.log('📊 Getting current sheet data...');
    const currentData = await getSheetData(spreadsheetId, sheetName);
    console.log('📋 Current data rows:', currentData.length);
    console.log('📋 First few rows:', currentData.slice(0, 3));
    
    // Get cache status
    console.log('💾 Getting cache status...');
    const cacheStatus = getCacheStatus();
    console.log('💾 Cache status:', cacheStatus);
    
    // Get cached data if available
    const cacheKey = `${spreadsheetId}_${sheetName}`;
    const cachedData = cacheStatus[cacheKey];
    
    console.log('=== END DEBUGGING ===\n');
    
    return NextResponse.json({
      success: true,
      debug: {
        spreadsheetId: spreadsheetId,
        sheetName: sheetName,
        currentDataRows: currentData.length,
        currentDataSample: currentData.slice(0, 3),
        cacheStatus: cacheStatus,
        cachedData: cachedData,
        hasCachedData: !!cachedData
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error debugging sheet changes:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}




