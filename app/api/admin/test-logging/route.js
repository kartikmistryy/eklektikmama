import { NextResponse } from 'next/server';
import { logGoogleSheetsOperation } from '@/lib/googleSheetsLogger';

export async function GET(req) {
  try {
    console.log('=== TESTING GOOGLE SHEETS LOGGING ===');
    
    // Test logging a sample operation
    const testLog = await logGoogleSheetsOperation({
      operation: 'test',
      sheetName: 'Test Sheet',
      spreadsheetId: 'test_spreadsheet_id',
      changes: { test: 'data' },
      source: 'test',
      sourceDetails: 'Testing logging functionality',
      success: true
    });
    
    console.log('✅ Test log created:', testLog);
    console.log('=== END TESTING LOGGING ===\n');
    
    return NextResponse.json({
      success: true,
      message: 'Logging test completed',
      testLog: testLog,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error testing logging:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}








