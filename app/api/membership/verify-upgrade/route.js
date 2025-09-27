import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet } from '../../../../lib/googleSheets';
import { sendMembershipUpgradeEmail } from '../../../../lib/memberEmails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await connectDB();
    
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

    // Get upgrade data from session metadata
    const { email, membershipId, upgradeCost, remainingMonthlyValue } = session.metadata;
    
    if (!email || !membershipId) {
      return NextResponse.json(
        { error: 'Missing upgrade information' },
        { status: 400 }
      );
    }

    // Find the membership record to upgrade
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Check if already upgraded
    if (membership.membershipType === 'annual') {
      console.log('Membership already upgraded to annual:', email);
      return NextResponse.json({
        success: true,
        membership: {
          email: membership.email,
          firstName: membership.firstName,
          lastName: membership.lastName,
          membershipType: membership.membershipType,
          status: membership.status,
          currentPeriodStart: membership.currentPeriodStart,
          currentPeriodEnd: membership.currentPeriodEnd
        },
        upgradeCost: parseFloat(upgradeCost),
        remainingMonthlyValue: parseFloat(remainingMonthlyValue),
        message: 'Upgrade was already completed!'
      });
    }

    // Perform the upgrade
    console.log('Upgrading membership to annual:', email);
    
    // Calculate new period end (1 year from current period end)
    const originalPeriodEnd = new Date(membership.currentPeriodEnd);
    const newPeriodEnd = new Date(originalPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    // Update membership record
    membership.membershipType = 'annual';
    membership.currentPeriodEnd = newPeriodEnd;
    membership.nextPaymentDate = newPeriodEnd;
    membership.notes = `Upgraded from monthly to annual on ${new Date().toISOString()}. Upgrade cost: ${upgradeCost} AED`;
    membership.source = 'upgrade-payment';
    
    await membership.save();
    console.log(`Membership upgraded to annual for ${email}. New period end: ${newPeriodEnd.toISOString()}`);

    // Update Google Sheets
    try {
      await updateMemberInSheet(membership.email, {
        'Plan Type': 'annual',
        'Current Period End': membership.currentPeriodEnd.toISOString().split('T')[0],
        'Next Payment Date': membership.nextPaymentDate.toISOString().split('T')[0],
        'Notes': membership.notes
      });
      console.log('Membership updated in Google Sheets');
    } catch (error) {
      console.error('Error updating membership in Google Sheets:', error);
    }

    // Send upgrade confirmation email
    try {
      await sendMembershipUpgradeEmail(
        {
          firstName: membership.firstName,
          lastName: membership.lastName,
          email: membership.email
        },
        {
          upgradeCost: parseFloat(upgradeCost),
          newPeriodEnd: membership.currentPeriodEnd,
          membershipType: 'annual'
        }
      );
      console.log('Upgrade confirmation email sent to:', membership.email);
    } catch (error) {
      console.error('Error sending upgrade confirmation email:', error);
      // Don't fail the process if email sending fails
    }

    // Return success with updated membership details
    return NextResponse.json({
      success: true,
      membership: {
        email: membership.email,
        firstName: membership.firstName,
        lastName: membership.lastName,
        membershipType: membership.membershipType,
        status: membership.status,
        currentPeriodStart: membership.currentPeriodStart,
        currentPeriodEnd: membership.currentPeriodEnd
      },
      upgradeCost: parseFloat(upgradeCost),
      remainingMonthlyValue: parseFloat(remainingMonthlyValue),
      message: 'Upgrade completed successfully!'
    });

  } catch (error) {
    console.error('Upgrade verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify upgrade' },
      { status: 500 }
    );
  }
}

