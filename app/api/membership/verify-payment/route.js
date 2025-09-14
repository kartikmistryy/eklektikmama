import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { addMemberToSheet } from '../../../../lib/googleSheets';
import { sendMemberWelcomeEmail } from '../../../../lib/memberEmails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { sessionId, membershipId } = await req.json();
    
    if (!sessionId || !membershipId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectDB();

    // Get the Stripe session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Find the membership
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    // If already active, return success
    if (membership.status === 'active') {
      return NextResponse.json({ 
        success: true, 
        message: 'Membership already active',
        membership: {
          email: membership.email,
          status: membership.status,
          membershipType: membership.membershipType
        }
      });
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

    // Add to Google Sheets (with error handling)
    let googleSheetsResult = null;
    try {
      const rowId = await addMemberToSheet(membership);
      googleSheetsResult = { success: true, rowId };
    } catch (error) {
      console.error('Google Sheets error:', error);
      googleSheetsResult = { success: false, error: error.message };
    }

    // Send welcome email (with error handling)
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
        membershipType: membership.membershipType,
        currentPeriodEnd: membership.currentPeriodEnd
      },
      googleSheets: googleSheetsResult,
      email: emailResult
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
