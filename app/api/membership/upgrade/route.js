import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet } from '../../../../lib/googleSheets';
import { sendUpgradeConfirmationEmail } from '../../../../lib/memberEmails';

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

    // Find the existing monthly membership
    const existingMembership = await Membership.findOne({
      email: email.toLowerCase(),
      membershipType: 'monthly',
      status: { $in: ['active', 'past_due'] }
    });

    if (!existingMembership) {
      return NextResponse.json(
        { error: 'No active monthly membership found to upgrade' },
        { status: 404 }
      );
    }

    // Check if they already have an annual membership pending
    const existingAnnualMembership = await Membership.findOne({
      email: email.toLowerCase(),
      membershipType: 'annual',
      status: { $in: ['active', 'past_due', 'pending'] }
    });

    if (existingAnnualMembership) {
      return NextResponse.json(
        { error: 'You already have an annual membership or upgrade pending' },
        { status: 400 }
      );
    }

    // Get the current subscription from Stripe
    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(existingMembership.stripeSubscriptionId);
    } catch (stripeError) {
      console.error('Error retrieving Stripe subscription:', stripeError);
      return NextResponse.json(
        { error: 'Failed to retrieve subscription details' },
        { status: 500 }
      );
    }

    // Update the subscription to annual at the end of the current period
    try {
      const updatedSubscription = await stripe.subscriptions.update(existingMembership.stripeSubscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID,
        }],
        proration_behavior: 'none', // Don't prorate - start annual at period end
        billing_cycle_anchor: 'unchanged' // Keep the same billing cycle
      });

      console.log('Subscription updated successfully:', updatedSubscription.id);

      // Create a new annual membership record that will be activated when the monthly expires
      const annualMembership = new Membership({
        email: existingMembership.email,
        firstName: existingMembership.firstName,
        lastName: existingMembership.lastName,
        phone: existingMembership.phone,
        membershipType: 'annual',
        stripeCustomerId: existingMembership.stripeCustomerId,
        stripeSubscriptionId: existingMembership.stripeSubscriptionId, // Same subscription, different plan
        stripePriceId: process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID,
        status: 'pending', // Will be activated when monthly expires
        currentPeriodStart: existingMembership.currentPeriodEnd, // Starts when monthly ends
        currentPeriodEnd: new Date(existingMembership.currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from monthly end
        nextPaymentDate: new Date(existingMembership.currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000),
        notes: `Upgraded from monthly membership. Monthly expires: ${existingMembership.currentPeriodEnd.toISOString()}`,
        source: 'upgrade'
      });

      await annualMembership.save();

      // Update the monthly membership to indicate it will be replaced
      existingMembership.notes = `Will be replaced by annual membership on ${existingMembership.currentPeriodEnd.toISOString()}`;
      existingMembership.cancelAtPeriodEnd = true;
      await existingMembership.save();

      // Add to Google Sheets
      try {
        const googleSheetsRowId = await addMemberToSheet(annualMembership);
        annualMembership.googleSheetsRowId = googleSheetsRowId;
        await annualMembership.save();
        console.log('Annual membership added to Google Sheets with row ID:', googleSheetsRowId);
      } catch (error) {
        console.error('Error adding annual membership to Google Sheets:', error);
        // Don't fail the process if Google Sheets update fails
      }

      // Send upgrade confirmation email
      try {
        await sendUpgradeConfirmationEmail({
          email: existingMembership.email,
          firstName: existingMembership.firstName,
          monthlyExpiryDate: existingMembership.currentPeriodEnd,
          annualStartDate: existingMembership.currentPeriodEnd
        });
      } catch (emailError) {
        console.error('Error sending upgrade confirmation email:', emailError);
        // Don't fail the process if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully upgraded to annual membership',
        monthlyExpiryDate: existingMembership.currentPeriodEnd,
        annualStartDate: existingMembership.currentPeriodEnd,
        annualMembershipId: annualMembership._id
      });

    } catch (stripeError) {
      console.error('Error updating Stripe subscription:', stripeError);
      return NextResponse.json(
        { error: 'Failed to upgrade subscription. Please try again or contact support.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Membership upgrade error:', error);
    return NextResponse.json(
      { error: 'Failed to process upgrade request' },
      { status: 500 }
    );
  }
}
