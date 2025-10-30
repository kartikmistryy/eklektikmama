import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SheetCache from '@/models/SheetCache';

export async function GET(req) {
  try {
    console.log('=== TESTING CACHE SYSTEM ===');
    
    // Test database connection
    await connectDB();
    console.log('✅ Database connected');
    
    // Test cache model
    const testCacheKey = 'test_key';
    const testData = {
      cacheKey: testCacheKey,
      spreadsheetId: 'test_spreadsheet',
      sheetName: 'test_sheet',
      data: [['header1', 'header2'], ['row1col1', 'row1col2']],
      lastChecked: new Date(),
      rowCount: 2,
      lastChangeCount: 0
    };
    
    // Save test cache
    const savedCache = await SheetCache.findOneAndUpdate(
      { cacheKey: testCacheKey },
      testData,
      { upsert: true, new: true }
    );
    console.log('✅ Test cache saved:', savedCache.cacheKey);
    
    // Retrieve test cache
    const retrievedCache = await SheetCache.findOne({ cacheKey: testCacheKey });
    console.log('✅ Test cache retrieved:', retrievedCache ? 'Found' : 'Not found');
    
    // Clean up test cache
    await SheetCache.deleteOne({ cacheKey: testCacheKey });
    console.log('✅ Test cache cleaned up');
    
    // Check existing caches
    const existingCaches = await SheetCache.find({});
    console.log('📋 Existing caches:', existingCaches.length);
    
    console.log('=== END TESTING CACHE ===\n');
    
    return NextResponse.json({
      success: true,
      test: {
        databaseConnected: true,
        cacheSaved: true,
        cacheRetrieved: !!retrievedCache,
        existingCaches: existingCaches.length,
        existingCacheKeys: existingCaches.map(c => c.cacheKey)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error testing cache system:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}








