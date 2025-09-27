import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Membership pricing
const MEMBERSHIP_PRICES = {
  monthly: { amount: 100, interval: 'month' }, // 100 AED per month
  annual: { amount: 1000, interval: 'year' }   // 1000 AED per year
};

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

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Find the monthly membership to upgrade
    const existingMembership = await Membership.findOne({
      email: email,
      membershipType: 'monthly',
      status: 'active'
    });

    if (!existingMembership) {
      console.log(`Upgrade payment request failed: No active monthly membership found for ${email}`);
      return NextResponse.json(
        { error: 'No active monthly membership found to upgrade' },
        { status: 404 }
      );
    }

    // Check if there's already an upgrade in progress
    const existingUpgrade = await Membership.findOne({
      stripeSubscriptionId: existingMembership.stripeSubscriptionId,
      source: 'upgrade-payment',
      status: 'pending'
    });

    if (existingUpgrade) {
      console.log(`Upgrade payment request failed: Upgrade already in progress for subscription ${existingMembership.stripeSubscriptionId}`);
      return NextResponse.json(
        { error: 'An upgrade is already in progress for this membership' },
        { status: 400 }
      );
    }

    // Calculate upgrade cost
    const monthlyPrice = MEMBERSHIP_PRICES.monthly.amount;
    const annualPrice = MEMBERSHIP_PRICES.annual.amount;
    
    // Calculate remaining days in current monthly period
    const now = new Date();
    const periodEnd = new Date(existingMembership.currentPeriodEnd);
    const remainingDays = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));
    const remainingMonths = Math.max(0, remainingDays / 30);
    
    // Calculate upgrade cost: annual price minus remaining monthly value
    const remainingMonthlyValue = monthlyPrice * remainingMonths;
    const upgradeCost = Math.max(0, annualPrice - remainingMonthlyValue);
    
    console.log('Upgrade cost calculation:', {
      email,
      monthlyPrice,
      annualPrice,
      remainingDays,
      remainingMonths,
      remainingMonthlyValue,
      upgradeCost
    });

    if (upgradeCost <= 0) {
      return NextResponse.json(
        { error: 'No upgrade cost - your monthly membership is already paid up' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customer;
    try {
      if (existingMembership.stripeCustomerId && existingMembership.stripeCustomerId.startsWith('cus_')) {
        // Try to retrieve existing customer
        try {
          customer = await stripe.customers.retrieve(existingMembership.stripeCustomerId);
        } catch (retrieveError) {
          console.log('Customer not found in Stripe, creating new one:', existingMembership.stripeCustomerId);
          throw retrieveError; // Will be caught by outer catch and create new customer
        }
      } else {
        // Create new customer
        throw new Error('No valid Stripe customer ID');
      }
    } catch (stripeError) {
      console.log('Creating new Stripe customer for:', existingMembership.email);
      try {
        customer = await stripe.customers.create({
          email: existingMembership.email,
          name: `${existingMembership.firstName} ${existingMembership.lastName}`,
          phone: existingMembership.phone,
          metadata: {
            firstName: existingMembership.firstName,
            lastName: existingMembership.lastName,
            phone: existingMembership.phone
          }
        });
        
        // Update membership with customer ID
        existingMembership.stripeCustomerId = customer.id;
        await existingMembership.save();
        console.log('Created new Stripe customer:', customer.id);
      } catch (createError) {
        console.error('Error creating Stripe customer:', createError);
        return NextResponse.json(
          { error: 'Failed to process customer information' },
          { status: 500 }
        );
      }
    }

    // Create upgrade payment checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/member-dashboard?upgrade_cancelled=true`,
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: 'Membership Upgrade to Annual',
              description: `Upgrade from monthly to annual membership. Remaining monthly value: ${remainingMonthlyValue.toFixed(2)} AED`
            },
            unit_amount: Math.round(upgradeCost * 100), // Convert to fils
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'membership_upgrade',
        email: existingMembership.email,
        membershipId: existingMembership._id.toString(),
        originalSubscriptionId: existingMembership.stripeSubscriptionId,
        upgradeCost: upgradeCost.toString(),
        remainingMonthlyValue: remainingMonthlyValue.toString()
      }
    });

    console.log('Upgrade payment session created:', {
      sessionId: session.id,
      email: existingMembership.email,
      upgradeCost,
      remainingMonthlyValue
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      upgradeCost,
      remainingMonthlyValue,
      message: `Upgrade cost: ${upgradeCost.toFixed(2)} AED (Annual: ${annualPrice} AED - Remaining monthly value: ${remainingMonthlyValue.toFixed(2)} AED)`
    });

  } catch (error) {
    console.error('Upgrade payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create upgrade payment session' },
      { status: 500 }
    );
  }
}
