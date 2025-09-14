import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { addMemberToSheet } from '../../../../lib/googleSheets';
import { sendMemberWelcomeEmail } from '../../../../lib/memberEmails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Membership pricing configuration
const MEMBERSHIP_PRICES = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID,
    amount: 3.6, // AED 3.6 per month (testing)
    interval: 'month'
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID,
    amount: 36, // AED 36 per year (testing)
    interval: 'year'
  }
};

export async function POST(req) {
  try {
    await connectDB();
    
    const {
      email,
      firstName,
      lastName,
      phone,
      membershipType,
      successUrl,
      cancelUrl
    } = await req.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !membershipType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate membership type
    if (!MEMBERSHIP_PRICES[membershipType]) {
      return NextResponse.json(
        { error: 'Invalid membership type' },
        { status: 400 }
      );
    }

    // Check if user already has an active membership
    const existingMembership = await Membership.findOne({
      email: email,
      status: { $in: ['active', 'past_due'] }
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You already have an active membership' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: `${firstName} ${lastName}`,
        phone: phone,
        metadata: {
          firstName,
          lastName,
          membershipType
        }
      });
    }

    // For Stripe Checkout, we don't create the subscription upfront
    // The subscription will be created after successful payment via webhook
    // We'll just create a pending membership record
    const now = new Date();
    
    // Create pending membership record in database
    // Required fields will be set via webhook after successful payment
    const membership = new Membership({
      email,
      firstName,
      lastName,
      phone,
      membershipType,
      stripeCustomerId: customer.id,
      stripePriceId: MEMBERSHIP_PRICES[membershipType].priceId,
      status: 'pending' // Will be updated to 'active' via webhook
    });

    await membership.save();

    // Create Stripe checkout session for subscription (proper recurring billing)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: `Eklektik AF ${membershipType === 'monthly' ? 'Monthly' : 'Annual'} Membership`,
              description: `${membershipType === 'monthly' ? 'Monthly' : 'Annual'} membership with 10% event discounts`
            },
            unit_amount: MEMBERSHIP_PRICES[membershipType].amount * 100, // Convert to fils
            recurring: {
              interval: MEMBERSHIP_PRICES[membershipType].interval
            }
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/member-dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/eklektikmamaMembership?canceled=true`,
      metadata: {
        membershipType,
        email,
        firstName,
        lastName,
        phone,
        membershipId: membership._id.toString()
      }
    });

    return NextResponse.json({
      id: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Membership checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create membership checkout' },
      { status: 500 }
    );
  }
}
