import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { verificationTokens } from '../request-cancellation/route';

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
      email: email.toLowerCase(),
      status: { $in: ['active', 'past_due'] }
    });

    const debugInfo = {
      email: email,
      membershipFound: !!membership,
      membershipDetails: membership ? {
        email: membership.email,
        status: membership.status,
        stripeSubscriptionId: membership.stripeSubscriptionId,
        cancelAtPeriodEnd: membership.cancelAtPeriodEnd,
        currentPeriodEnd: membership.currentPeriodEnd
      } : null,
      activeTokens: Array.from(verificationTokens.entries()).map(([token, data]) => ({
        token: token.substring(0, 8) + '...',
        email: data.email,
        expiresAt: data.expiresAt,
        isExpired: data.expiresAt < new Date()
      })),
      totalTokens: verificationTokens.size
    };

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('Debug cancellation error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}
