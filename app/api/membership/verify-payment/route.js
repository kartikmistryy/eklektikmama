import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';

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

    // Get membership data from session metadata
    const { membershipType, email, firstName, lastName } = session.metadata;
    
    if (!membershipType || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing membership information' },
        { status: 400 }
      );
    }

    // Find the membership record (should exist if webhook processed successfully)
    const membership = await Membership.findOne({
      email: email,
      stripeCustomerId: session.customer,
      status: 'active'
    });

    if (!membership) {
      // If membership doesn't exist yet, it might still be processing via webhook
      // Return a success response but indicate it's still processing
      return NextResponse.json({
        success: true,
        processing: true,
        message: 'Payment successful. Your membership is being activated. You will receive a confirmation email shortly.',
        membershipType,
        email: firstName
      });
    }

    // Return success with membership details
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
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}