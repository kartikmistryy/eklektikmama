import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    // Find the membership
    const membership = await Membership.findOne({
      email: email.toLowerCase()
    });

    if (!membership) {
      return NextResponse.json({ error: 'No membership found for this email' }, { status: 404 });
    }

    const debugInfo = {
      email: membership.email,
      membershipDetails: {
        email: membership.email,
        firstName: membership.firstName,
        lastName: membership.lastName,
        status: membership.status,
        membershipType: membership.membershipType,
        stripeCustomerId: membership.stripeCustomerId,
        stripeSubscriptionId: membership.stripeSubscriptionId,
        stripePriceId: membership.stripePriceId,
        cancelAtPeriodEnd: membership.cancelAtPeriodEnd,
        cancelledAt: membership.cancelledAt,
        currentPeriodStart: membership.currentPeriodStart,
        currentPeriodEnd: membership.currentPeriodEnd,
        nextPaymentDate: membership.nextPaymentDate,
        cancellationCode: membership.cancellationCode,
        cancellationCodeExpires: membership.cancellationCodeExpires,
        signupDate: membership.signupDate,
        lastPaymentDate: membership.lastPaymentDate,
        totalSavings: membership.totalSavings,
        notes: membership.notes
      },
      isManualMembership: membership.stripeSubscriptionId && membership.stripeSubscriptionId.startsWith('manual_'),
      hasStripeSubscription: membership.stripeSubscriptionId && !membership.stripeSubscriptionId.startsWith('manual_'),
      isActive: membership.status === 'active',
      isCancelled: membership.cancelAtPeriodEnd === true,
      currentPeriodEndDate: membership.currentPeriodEnd ? new Date(membership.currentPeriodEnd).toLocaleDateString() : 'Not set',
      daysUntilExpiry: membership.currentPeriodEnd ? Math.ceil((new Date(membership.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24)) : 'Not set'
    };

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('Debug membership error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}
