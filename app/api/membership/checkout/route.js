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
    amount: 49, // AED 49 per month
    interval: 'month'
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID,
    amount: 490, // AED 490 per year
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

    // For Stripe Checkout, we don't create the membership record upfront
    // The membership will be created after successful payment via webhook
    // This prevents blocking users from retrying if payment fails

    // Create Stripe checkout session for payment (compatible with Stripe Link)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: `Eklektik AF ${membershipType === 'monthly' ? 'Monthly' : 'Annual'} Membership`,
              description: `${membershipType === 'monthly' ? 'Monthly' : 'Annual'} membership with 10% event discounts`
            },
            unit_amount: MEMBERSHIP_PRICES[membershipType].amount * 100 // Convert to fils
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/membership-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/eklektikmamaMembership?canceled=true`,
      metadata: {
        membershipType,
        email,
        firstName,
        lastName,
        phone
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
