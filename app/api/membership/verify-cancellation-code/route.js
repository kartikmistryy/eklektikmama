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

    console.log('Verifying cancellation code for membership:', membership.email);
    console.log('Stripe subscription ID:', membership.stripeSubscriptionId);
    console.log('Stripe customer ID:', membership.stripeCustomerId);

    let subscription = null;

    // Handle different types of memberships
    if (membership.stripeSubscriptionId && !membership.stripeSubscriptionId.startsWith('manual_')) {
      // Real Stripe subscription - cancel it
      try {
        subscription = await stripe.subscriptions.update(membership.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
        console.log('Stripe subscription updated successfully:', subscription.id);
      } catch (stripeError) {
        console.error('Error updating Stripe subscription:', stripeError);
        return NextResponse.json(
          { error: 'Failed to cancel Stripe subscription. Please contact support.' },
          { status: 500 }
        );
      }
    } else {
      // Manual membership or no Stripe subscription - just mark as cancelled
      console.log('Manual membership or no Stripe subscription - marking as cancelled at period end');
      subscription = {
        id: membership.stripeSubscriptionId || 'manual',
        cancel_at_period_end: true,
        current_period_end: Math.floor(membership.currentPeriodEnd.getTime() / 1000)
      };
    }

    // Update membership in database
    membership.cancelAtPeriodEnd = true;
    membership.cancelledAt = new Date();
    membership.cancellationCode = null; // Clear the code after use
    membership.cancellationCodeExpires = null;
    
    console.log('Updating membership in database...');
    await membership.save();
    console.log('Membership updated successfully in database');

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
      // Use the same logic for email as for the response
      let emailPeriodEnd = subscription.current_period_end ? subscription.current_period_end * 1000 : null;
      if (!emailPeriodEnd && membership.currentPeriodEnd) {
        emailPeriodEnd = membership.currentPeriodEnd.getTime();
      }
      
      await sendCancellationConfirmationEmail({
        firstName: membership.firstName,
        email: membership.email,
        membershipType: membership.membershipType,
        currentPeriodEnd: emailPeriodEnd
      });
    } catch (emailError) {
      console.error('Error sending cancellation confirmation email:', emailError);
      // Don't fail the process if email fails
    }

    // Debug logging
    console.log('🔍 Stripe subscription data:', {
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status
    });
    console.log('🔍 Membership data:', {
      currentPeriodEnd: membership.currentPeriodEnd,
      membershipType: membership.membershipType
    });

    // Format the access until date properly
    let accessUntilDate = 'the end of your current billing period';
    
    // Try Stripe subscription date first, then fall back to membership database date
    let periodEndTimestamp = subscription.current_period_end;
    if (!periodEndTimestamp && membership.currentPeriodEnd) {
      periodEndTimestamp = Math.floor(membership.currentPeriodEnd.getTime() / 1000);
      console.log('🔍 Using membership currentPeriodEnd as fallback:', periodEndTimestamp);
    }
    
    if (periodEndTimestamp) {
      try {
        const date = new Date(periodEndTimestamp * 1000);
        console.log('🔍 Converted date:', date);
        
        if (!isNaN(date.getTime())) {
          accessUntilDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          console.log('🔍 Formatted date:', accessUntilDate);
        } else {
          console.log('🔍 Invalid date conversion');
        }
      } catch (error) {
        console.error('🔍 Date formatting error:', error);
      }
    } else {
      console.log('🔍 No period end found in subscription or membership');
    }

    return NextResponse.json({
      success: true,
      message: `Your membership has been successfully cancelled. You will retain access until ${accessUntilDate}.`,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
      accessUntil: accessUntilDate
    });

  } catch (error) {
    console.error('Cancellation code verification error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel membership' },
      { status: 500 }
    );
  }
}
