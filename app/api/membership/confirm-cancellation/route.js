import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet } from '../../../../lib/googleSheets';
import { sendCancellationConfirmationEmail } from '../../../../lib/memberEmails';
import { verificationTokens } from '../request-cancellation/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Shared cancellation processing function
async function processCancellation(token, tokenData) {
  try {
    await connectDB();

    // Find the membership
    const membership = await Membership.findOne({
      email: tokenData.email,
      status: { $in: ['active', 'past_due'] }
    });

    if (!membership) {
      verificationTokens.delete(token);
      return { success: false, error: 'No active membership found' };
    }

    // Check if already cancelled
    if (membership.cancelAtPeriodEnd) {
      verificationTokens.delete(token);
      return { success: false, error: 'Membership is already scheduled for cancellation' };
    }

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Update membership in database
    membership.cancelAtPeriodEnd = true;
    membership.cancelledAt = new Date();
    await membership.save();

    // Update Google Sheets
    try {
      await updateMemberInSheet(tokenData.email, {
        'Status': 'cancelled_at_period_end'
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

    // Clean up the verification token
    verificationTokens.delete(token);

    return {
      success: true,
      message: 'Membership has been cancelled successfully',
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end
    };

  } catch (error) {
    console.error('Cancellation processing error:', error);
    return { success: false, error: 'Failed to cancel membership' };
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response('Invalid verification link', { status: 400 });
    }

    // Verify token
    const tokenData = verificationTokens.get(token);
    if (!tokenData) {
      return new Response('Invalid or expired verification token', { status: 400 });
    }

    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      verificationTokens.delete(token);
      return new Response('Verification token has expired', { status: 400 });
    }

    // Process the cancellation
    const result = await processCancellation(token, tokenData);
    
    if (result.success) {
      // Redirect to success page
      return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership-cancelled?success=true`);
    } else {
      return new Response(result.error, { status: 400 });
    }

  } catch (error) {
    console.error('GET cancellation verification error:', error);
    return new Response('Verification failed', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify token
    const tokenData = verificationTokens.get(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      verificationTokens.delete(token);
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Process the cancellation
    const result = await processCancellation(token, tokenData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Membership has been cancelled successfully. You will retain access until the end of your current billing period.',
        cancelAtPeriodEnd: result.cancelAtPeriodEnd,
        currentPeriodEnd: result.currentPeriodEnd
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Membership cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel membership' },
      { status: 500 }
    );
  }
}
