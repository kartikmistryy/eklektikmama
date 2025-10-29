import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GoogleSheetsLog from '@/models/GoogleSheetsLog';

export async function GET(req) {
  try {
    console.log('=== TESTING DIRECT LOG SAVE ===');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Create a test log entry
    const testLog = new GoogleSheetsLog({
      operation: 'add',
      sheetName: 'Test Sheet',
      spreadsheetId: 'test_spreadsheet_id',
      changes: { test: 'direct save' },
      source: 'system',
      sourceDetails: 'Direct database save test',
      success: true
    });
    
    console.log('📝 Saving test log...');
    const savedLog = await testLog.save();
    console.log('✅ Test log saved with ID:', savedLog._id);
    
    // Count total logs
    const totalLogs = await GoogleSheetsLog.countDocuments();
    console.log('📊 Total logs in database:', totalLogs);
    
    // Get recent logs
    const recentLogs = await GoogleSheetsLog.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select('operation sheetName timestamp success');
    
    console.log('📋 Recent logs:', recentLogs.length);
    
    console.log('=== END DIRECT LOG TEST ===\n');
    
    return NextResponse.json({
      success: true,
      message: 'Direct log test completed',
      savedLogId: savedLog._id,
      totalLogs: totalLogs,
      recentLogs: recentLogs,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in direct log test:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
