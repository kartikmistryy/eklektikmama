import { NextResponse } from 'next/server';
import { 
  startSheetMonitoring, 
  stopSheetMonitoring, 
  getSheetMonitoringStatus, 
  triggerChangeDetection 
} from '@/lib/sheetChangeMonitor';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'status';
    
    if (action === 'status') {
      const status = getSheetMonitoringStatus();
      return NextResponse.json({
        success: true,
        action: 'status',
        monitoring: status,
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'trigger') {
      const results = await triggerChangeDetection();
      return NextResponse.json({
        success: true,
        action: 'trigger',
        results: results,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sheet Monitoring API',
      usage: {
        status: 'GET /api/admin/sheet-monitoring?action=status',
        trigger: 'GET /api/admin/sheet-monitoring?action=trigger',
        start: 'POST /api/admin/sheet-monitoring with {"action": "start", "interval": 5}',
        stop: 'POST /api/admin/sheet-monitoring with {"action": "stop"}'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in sheet monitoring API:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, interval } = body;
    
    console.log('=== SHEET MONITORING API CALLED ===');
    console.log('Action:', action);
    console.log('Interval:', interval);
    console.log('Timestamp:', new Date().toISOString());
    
    if (action === 'start') {
      const intervalMinutes = interval || 5;
      startSheetMonitoring(intervalMinutes);
      
      return NextResponse.json({
        success: true,
        action: 'start',
        message: `Sheet monitoring started with ${intervalMinutes} minute intervals`,
        interval: intervalMinutes,
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'stop') {
      stopSheetMonitoring();
      
      return NextResponse.json({
        success: true,
        action: 'stop',
        message: 'Sheet monitoring stopped',
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'trigger') {
      const results = await triggerChangeDetection();
      
      return NextResponse.json({
        success: true,
        action: 'trigger',
        message: 'Manual change detection completed',
        results: results,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "start", "stop", or "trigger"',
      timestamp: new Date().toISOString()
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error in sheet monitoring API:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
