import { NextResponse } from 'next/server';
import { getMemberFromSheet, getMembersSheet } from '@/lib/googleSheets';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const action = searchParams.get('action'); // 'view', 'audit', 'recent'
    
    console.log('=== GOOGLE SHEETS LOGS API CALLED ===');
    console.log('Email:', email);
    console.log('Action:', action);
    console.log('Timestamp:', new Date().toISOString());
    
    if (action === 'view' && email) {
      // View specific member's data
      const memberData = await getMemberFromSheet(email);
      
      if (!memberData) {
        return NextResponse.json({
          success: false,
          message: 'Member not found in Google Sheets',
          email: email
        });
      }
      
      return NextResponse.json({
        success: true,
        action: 'view',
        email: email,
        memberData: memberData,
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'audit' && email) {
      // Get detailed audit info for a member
      const sheet = await getMembersSheet();
      const rows = await sheet.getRows();
      const memberRow = rows.find(row => row.get('Email') === email);
      
      if (!memberRow) {
        return NextResponse.json({
          success: false,
          message: 'Member not found in Google Sheets',
          email: email
        });
      }
      
      // Get all field values for audit
      const auditData = {
        'Row ID': memberRow.get('Row ID'),
        'Email': memberRow.get('Email'),
        'First Name': memberRow.get('First Name'),
        'Last Name': memberRow.get('Last Name'),
        'Phone': memberRow.get('Phone'),
        'Plan Type': memberRow.get('Plan Type'),
        'Status': memberRow.get('Status'),
        'Date of Joining': memberRow.get('Date of Joining'),
        'Current Period Start': memberRow.get('Current Period Start'),
        'Current Period End': memberRow.get('Current Period End'),
        'Next Payment Date': memberRow.get('Next Payment Date'),
        'Stripe Customer ID': memberRow.get('Stripe Customer ID'),
        'Stripe Subscription ID': memberRow.get('Stripe Subscription ID'),
        'Total Savings (AED)': memberRow.get('Total Savings (AED)'),
        'Payment Method': memberRow.get('Payment Method'),
        'Payment Reference': memberRow.get('Payment Reference'),
        'Notes': memberRow.get('Notes'),
        'Last Updated': memberRow.get('Last Updated')
      };
      
      return NextResponse.json({
        success: true,
        action: 'audit',
        email: email,
        auditData: auditData,
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'recent') {
      // Get recent activity (last 10 members by Last Updated)
      const sheet = await getMembersSheet();
      const rows = await sheet.getRows();
      
      // Sort by Last Updated (most recent first)
      const sortedRows = rows.sort((a, b) => {
        const dateA = new Date(a.get('Last Updated') || 0);
        const dateB = new Date(b.get('Last Updated') || 0);
        return dateB - dateA;
      });
      
      const recentActivity = sortedRows.slice(0, 10).map(row => ({
        'Row ID': row.get('Row ID'),
        'Email': row.get('Email'),
        'Name': `${row.get('First Name')} ${row.get('Last Name')}`,
        'Status': row.get('Status'),
        'Plan Type': row.get('Plan Type'),
        'Last Updated': row.get('Last Updated')
      }));
      
      return NextResponse.json({
        success: true,
        action: 'recent',
        recentActivity: recentActivity,
        totalMembers: rows.length,
        timestamp: new Date().toISOString()
      });
    }
    
    // Default: return general info
    const sheet = await getMembersSheet();
    const rows = await sheet.getRows();
    
    return NextResponse.json({
      success: true,
      message: 'Google Sheets logs API',
      totalMembers: rows.length,
      availableActions: ['view', 'audit', 'recent'],
      usage: {
        view: '/api/admin/google-sheets-logs?action=view&email=user@example.com',
        audit: '/api/admin/google-sheets-logs?action=audit&email=user@example.com',
        recent: '/api/admin/google-sheets-logs?action=recent'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in Google Sheets logs API:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

