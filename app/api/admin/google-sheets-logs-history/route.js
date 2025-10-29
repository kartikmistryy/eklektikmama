import { NextResponse } from 'next/server';
import { getGoogleSheetsLogs, getLogsSummary } from '@/lib/googleSheetsLogger';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'list';
    const sheetName = searchParams.get('sheetName');
    const operation = searchParams.get('operation');
    const recordEmail = searchParams.get('recordEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = parseInt(searchParams.get('skip')) || 0;

    console.log('=== GOOGLE SHEETS LOGS API CALLED ===');
    console.log('Action:', action);
    console.log('Filters:', { sheetName, operation, recordEmail, startDate, endDate, limit, skip });

    if (action === 'summary') {
      // Get logs summary statistics
      const summary = await getLogsSummary();
      
      return NextResponse.json({
        success: true,
        action: 'summary',
        summary: summary,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'list') {
      // Get filtered logs
      const filters = {
        sheetName,
        operation,
        recordEmail,
        startDate,
        endDate,
        limit,
        skip
      };

      const result = await getGoogleSheetsLogs(filters);
      
      return NextResponse.json({
        success: true,
        action: 'list',
        logs: result.logs,
        total: result.total,
        hasMore: result.hasMore,
        filters: filters,
        timestamp: new Date().toISOString()
      });
    }

    // Default response
    return NextResponse.json({
      success: true,
      message: 'Google Sheets Logs History API',
      availableActions: ['summary', 'list'],
      usage: {
        summary: '/api/admin/google-sheets-logs-history?action=summary',
        list: '/api/admin/google-sheets-logs-history?action=list&sheetName=Members&operation=update&limit=20'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in Google Sheets logs history API:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

