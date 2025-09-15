import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet } from '../../../../lib/googleSheets';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await connectDB();
    
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the membership
    const membership = await Membership.findOne({
      email: email.toLowerCase(),
      status: { $in: ['active', 'past_due'] },
      cancelAtPeriodEnd: true
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No cancelled membership found to reactivate' },
        { status: 404 }
      );
    }

    if (!membership.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No Stripe subscription found' },
        { status: 400 }
      );
    }

    // Reactivate the subscription in Stripe
    const subscription = await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Update membership in database
    membership.cancelAtPeriodEnd = false;
    membership.cancelledAt = null;
    membership.status = 'active';
    await membership.save();

    // Update Google Sheets
    try {
      await updateMemberInSheet(email, {
        'Status': 'active',
        'Cancel At Period End': 'false'
      });
    } catch (sheetError) {
      console.error('Error updating Google Sheets:', sheetError);
      // Don't fail the process if Google Sheets update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Membership has been reactivated successfully',
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end
    });

  } catch (error) {
    console.error('Membership reactivation error:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate membership' },
      { status: 500 }
    );
  }
}
