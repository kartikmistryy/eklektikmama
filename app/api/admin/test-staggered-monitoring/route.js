import { NextResponse } from 'next/server';
import { checkSheetsSubset, getMonitoringStatus, resetMonitoringCycle } from '@/lib/staggeredSheetMonitoring';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'check';
    const batchSize = parseInt(searchParams.get('batchSize')) || 3;
    
    console.log('=== TESTING STAGGERED MONITORING ===');
    console.log('Action:', action);
    console.log('Batch Size:', batchSize);
    
    if (action === 'status') {
      const status = getMonitoringStatus();
      return NextResponse.json({
        success: true,
        action: 'status',
        status: status,
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'reset') {
      resetMonitoringCycle();
      return NextResponse.json({
        success: true,
        action: 'reset',
        message: 'Monitoring cycle reset',
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'check') {
      const result = await checkSheetsSubset(batchSize);
      
      return NextResponse.json({
        success: true,
        action: 'check',
        batchSize: batchSize,
        result: result,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Staggered Monitoring Test API',
      usage: {
        status: 'GET /api/admin/test-staggered-monitoring?action=status',
        check: 'GET /api/admin/test-staggered-monitoring?action=check&batchSize=3',
        reset: 'GET /api/admin/test-staggered-monitoring?action=reset'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in staggered monitoring test:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}








