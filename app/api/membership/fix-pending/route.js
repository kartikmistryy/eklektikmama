import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { addMemberToSheet } from '../../../../lib/googleSheets';
import { sendMemberWelcomeEmail } from '../../../../lib/memberEmails';

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    // Find pending membership
    const membership = await Membership.findOne({ 
      email: email,
      status: 'pending'
    });

    if (!membership) {
      return NextResponse.json({ error: 'No pending membership found' }, { status: 404 });
    }

    // Activate the membership
    membership.status = 'active';
    membership.currentPeriodStart = new Date();
    
    if (membership.membershipType === 'monthly') {
      membership.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      membership.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
      membership.currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      membership.nextPaymentDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    await membership.save();

    // Add to Google Sheets
    let googleSheetsResult = null;
    try {
      const rowId = await addMemberToSheet(membership);
      googleSheetsResult = { success: true, rowId };
    } catch (error) {
      console.error('Google Sheets error:', error);
      googleSheetsResult = { success: false, error: error.message };
    }

    // Send welcome email
    let emailResult = null;
    try {
      const result = await sendMemberWelcomeEmail(membership);
      emailResult = { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email error:', error);
      emailResult = { success: false, error: error.message };
    }

    return NextResponse.json({
      success: true,
      message: 'Membership activated successfully',
      membership: {
        email: membership.email,
        status: membership.status,
        membershipType: membership.membershipType
      },
      googleSheets: googleSheetsResult,
      email: emailResult
    });

  } catch (error) {
    console.error('Fix pending membership error:', error);
    return NextResponse.json({ error: 'Failed to fix membership' }, { status: 500 });
  }
}
