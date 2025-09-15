import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet } from '../../../../lib/googleSheets';
import { sendCancellationConfirmationEmail } from '../../../../lib/memberEmails';
import { verificationTokens } from '../request-cancellation/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Fallback cancellation function for when tokens are lost
async function processCancellationFallback(email) {
  try {
    await connectDB();

    console.log('Processing fallback cancellation for email:', email);

    // Find the membership
    const membership = await Membership.findOne({
      email: email.toLowerCase(),
      status: { $in: ['active', 'past_due'] }
    });

    if (!membership) {
      return { success: false, error: 'No active membership found' };
    }

    // Check if already cancelled
    if (membership.cancelAtPeriodEnd) {
      return { success: false, error: 'Membership is already scheduled for cancellation' };
    }

    // Check if Stripe subscription ID exists
    if (!membership.stripeSubscriptionId) {
      return { success: false, error: 'No Stripe subscription found for this membership' };
    }

    console.log('Attempting fallback cancellation of Stripe subscription:', membership.stripeSubscriptionId);

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    console.log('Fallback Stripe subscription updated successfully:', subscription.id);

    // Update membership in database
    membership.cancelAtPeriodEnd = true;
    membership.cancelledAt = new Date();
    await membership.save();

    // Update Google Sheets
    try {
      await updateMemberInSheet(email, {
        'Status': 'cancelled_at_period_end'
      });
    } catch (sheetError) {
      console.error('Error updating Google Sheets:', sheetError);
    }

    // Send cancellation confirmation email
    try {
      await sendCancellationConfirmationEmail({
        firstName: membership.firstName,
        email: membership.email,
        membershipType: membership.membershipType,
        currentPeriodEnd: subscription.current_period_end * 1000
      });
    } catch (emailError) {
      console.error('Error sending cancellation confirmation email:', emailError);
    }

    return {
      success: true,
      message: 'Membership has been cancelled successfully via fallback method'
    };

  } catch (error) {
    console.error('Fallback cancellation processing error:', error);
    return { success: false, error: 'Failed to cancel membership via fallback method' };
  }
}

// Shared cancellation processing function
async function processCancellation(token, tokenData) {
  try {
    await connectDB();

    console.log('Processing cancellation for token:', token);
    console.log('Token data:', tokenData);

    // Find the membership
    const membership = await Membership.findOne({
      email: tokenData.email,
      status: { $in: ['active', 'past_due'] }
    });

    console.log('Found membership:', membership ? 'Yes' : 'No');
    if (membership) {
      console.log('Membership details:', {
        email: membership.email,
        status: membership.status,
        stripeSubscriptionId: membership.stripeSubscriptionId,
        cancelAtPeriodEnd: membership.cancelAtPeriodEnd
      });
    }

    if (!membership) {
      verificationTokens.delete(token);
      return { success: false, error: 'No active membership found' };
    }

    // Check if already cancelled
    if (membership.cancelAtPeriodEnd) {
      verificationTokens.delete(token);
      return { success: false, error: 'Membership is already scheduled for cancellation' };
    }

    // Check if Stripe subscription ID exists
    if (!membership.stripeSubscriptionId) {
      verificationTokens.delete(token);
      return { success: false, error: 'No Stripe subscription found for this membership' };
    }

    console.log('Attempting to cancel Stripe subscription:', membership.stripeSubscriptionId);

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    console.log('Stripe subscription updated successfully:', subscription.id);

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

    console.log('GET request received for token:', token);

    if (!token) {
      console.log('No token provided');
      return new Response('Invalid verification link - no token provided', { status: 400 });
    }

    // Verify token
    const tokenData = verificationTokens.get(token);
    console.log('Token data found:', tokenData ? 'Yes' : 'No');
    
    if (!tokenData) {
      console.log('Token not found in verificationTokens map - this might be due to server restart');
      
      // Fallback: Try to find membership by email from URL params as backup
      const email = searchParams.get('email');
      if (email) {
        console.log('Attempting fallback cancellation with email:', email);
        const fallbackResult = await processCancellationFallback(email);
        if (fallbackResult.success) {
          return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership-cancelled?success=true`);
        }
      }
      
      return new Response('Invalid or expired verification token - token not found. Please try requesting cancellation again.', { status: 400 });
    }

    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      console.log('Token expired at:', tokenData.expiresAt);
      verificationTokens.delete(token);
      return new Response('Verification token has expired', { status: 400 });
    }

    console.log('Token is valid, processing cancellation...');

    // Process the cancellation
    const result = await processCancellation(token, tokenData);
    
    if (result.success) {
      console.log('Cancellation successful, redirecting...');
      // Redirect to success page
      return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership-cancelled?success=true`);
    } else {
      console.log('Cancellation failed:', result.error);
      return new Response(result.error, { status: 400 });
    }

  } catch (error) {
    console.error('GET cancellation verification error:', error);
    return new Response(`Verification failed: ${error.message}`, { status: 500 });
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
