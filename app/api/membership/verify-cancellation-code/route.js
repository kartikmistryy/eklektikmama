import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet } from '../../../../lib/googleSheets';
import { sendCancellationConfirmationEmail } from '../../../../lib/memberEmails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await connectDB();
    
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Find the membership
    const membership = await Membership.findOne({
      email: email.toLowerCase(),
      status: { $in: ['active', 'past_due'] }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No active membership found' },
        { status: 404 }
      );
    }

    // Check if already cancelled
    if (membership.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Membership is already scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Verify the cancellation code
    if (!membership.cancellationCode || membership.cancellationCode !== code) {
      return NextResponse.json(
        { error: 'Invalid cancellation code' },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (!membership.cancellationCodeExpires || membership.cancellationCodeExpires < new Date()) {
      // Clear expired code
      membership.cancellationCode = null;
      membership.cancellationCodeExpires = null;
      await membership.save();
      
      return NextResponse.json(
        { error: 'Cancellation code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if Stripe subscription ID exists
    if (!membership.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No Stripe subscription found for this membership' },
        { status: 400 }
      );
    }

    console.log('Verifying cancellation code for membership:', membership.email);
    console.log('Stripe subscription ID:', membership.stripeSubscriptionId);

    // Cancel the subscription in Stripe (at period end)
    const subscription = await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    console.log('Stripe subscription updated successfully:', subscription.id);

    // Update membership in database
    membership.cancelAtPeriodEnd = true;
    membership.cancelledAt = new Date();
    membership.cancellationCode = null; // Clear the code after use
    membership.cancellationCodeExpires = null;
    await membership.save();

    // Update Google Sheets
    try {
      await updateMemberInSheet(email, {
        'Status': 'cancelled_at_period_end',
        'Cancelled At': new Date().toISOString().split('T')[0]
      });
    } catch (sheetError) {
      console.error('Error updating Google Sheets:', sheetError);
      // Don't fail the process if Google Sheets update fails
    }

    // Send cancellation confirmation email
    try {
      await sendCancellationConfirmationEmail({
        firstName: membership.firstName,
        email: membership.email,
        membershipType: membership.membershipType,
        currentPeriodEnd: subscription.current_period_end * 1000 // Convert to milliseconds
      });
    } catch (emailError) {
      console.error('Error sending cancellation confirmation email:', emailError);
      // Don't fail the process if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your membership has been successfully cancelled. You will retain access until the end of your current billing period.',
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
      accessUntil: new Date(subscription.current_period_end * 1000).toLocaleDateString()
    });

  } catch (error) {
    console.error('Cancellation code verification error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel membership' },
      { status: 500 }
    );
  }
}
