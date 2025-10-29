import { NextResponse } from 'next/server';
import { checkAllSheetsForChanges, getCacheStatus } from '@/lib/googleSheetsChangeDetector';

export async function POST(req) {
  try {
    console.log('=== MANUAL SHEET CHANGE DETECTION TRIGGERED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    const results = await checkAllSheetsForChanges();
    
    const summary = {
      totalSheetsChecked: results.length,
      totalChangesFound: results.reduce((sum, result) => sum + result.changes.length, 0),
      sheetsWithChanges: results.filter(result => result.changes.length > 0).length,
      firstTimeChecks: results.filter(result => result.isFirstCheck).length
    };
    
    console.log('📊 Detection Summary:', summary);
    console.log('=== END CHANGE DETECTION ===\n');
    
    return NextResponse.json({
      success: true,
      message: 'Sheet change detection completed',
      summary: summary,
      results: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in sheet change detection:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'status';
    
    if (action === 'status') {
      // Get cache status
      const cacheStatus = getCacheStatus();
      
      return NextResponse.json({
        success: true,
        action: 'status',
        cacheStatus: cacheStatus,
        message: 'Use POST to trigger change detection',
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'trigger') {
      // Trigger change detection via GET (for easy testing)
      const results = await checkAllSheetsForChanges();
      
      return NextResponse.json({
        success: true,
        action: 'trigger',
        results: results,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sheet Change Detection API',
      usage: {
        status: 'GET /api/admin/check-sheet-changes?action=status',
        trigger: 'GET /api/admin/check-sheet-changes?action=trigger',
        manual: 'POST /api/admin/check-sheet-changes'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in sheet change detection API:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

