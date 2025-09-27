import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet } from '../../../../lib/googleSheets';
import { sendMembershipUpgradeEmail } from '../../../../lib/memberEmails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await connectDB();
    
    const { email } = await req.json();

    if (!email) {
      console.log('Upgrade request failed: Email is required');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`Processing upgrade request for email: ${email}`);

    // Find the existing monthly membership
    const existingMembership = await Membership.findOne({
      email: email.toLowerCase(),
      membershipType: 'monthly',
      status: { $in: ['active', 'past_due'] }
    });

    if (!existingMembership) {
      console.log(`Upgrade request failed: No active monthly membership found for ${email}`);
      return NextResponse.json(
        { error: 'No active monthly membership found to upgrade' },
        { status: 404 }
      );
    }

    console.log(`Found monthly membership for ${email}, subscription ID: ${existingMembership.stripeSubscriptionId}`);

    // Check if they already have an annual membership or upgrade pending
    const existingAnnualMembership = await Membership.findOne({
      email: email.toLowerCase(),
      membershipType: 'annual',
      status: { $in: ['active', 'past_due', 'pending'] }
    });

    if (existingAnnualMembership) {
      console.log(`Upgrade request failed: Annual membership already exists for ${email}`);
      return NextResponse.json(
        { error: 'You already have an annual membership or upgrade pending' },
        { status: 400 }
      );
    }

    // Check if there's already an upgrade in progress for this subscription
    const existingUpgrade = await Membership.findOne({
      stripeSubscriptionId: existingMembership.stripeSubscriptionId,
      source: 'upgrade',
      status: 'pending'
    });

    if (existingUpgrade) {
      console.log(`Upgrade request failed: Upgrade already in progress for subscription ${existingMembership.stripeSubscriptionId}`);
      return NextResponse.json(
        { error: 'An upgrade is already in progress for this membership' },
        { status: 400 }
      );
    }

    // Check if Price IDs are configured and valid (not live mode prices with test key)
    const monthlyPriceId = process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID;
    const annualPriceId = process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID;
    const hasValidPriceIds = monthlyPriceId && annualPriceId && 
                            monthlyPriceId.startsWith('price_test_') && 
                            annualPriceId.startsWith('price_test_');
    
    if (!hasValidPriceIds) {
      console.warn('Valid Stripe Price IDs not configured, using manual upgrade approach');
      
      // For test mode or when Price IDs are not properly configured,
      // we'll update the membership directly without changing the Stripe subscription
      console.log('Performing manual upgrade for:', email);
      
      // Update the existing membership to annual
      const originalPeriodEnd = existingMembership.currentPeriodEnd;
      existingMembership.membershipType = 'annual';
      existingMembership.stripePriceId = process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID || 'price_annual_manual';
      existingMembership.notes = `Upgraded from monthly membership on ${new Date().toISOString()}. Annual membership will begin on ${originalPeriodEnd.toISOString()}`;
      existingMembership.source = 'upgrade-manual';
      
      // Calculate new period end for annual membership
      const newPeriodEnd = new Date(originalPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
      existingMembership.currentPeriodEnd = newPeriodEnd;
      existingMembership.nextPaymentDate = newPeriodEnd;
      
      await existingMembership.save();
      console.log(`Membership upgraded manually for ${email}. New period end: ${newPeriodEnd.toISOString()}`);

      // Update Google Sheets
      try {
        await updateMemberInSheet(existingMembership.email, {
          'Plan Type': 'annual',
          'Current Period End': existingMembership.currentPeriodEnd.toISOString().split('T')[0],
          'Next Payment Date': existingMembership.nextPaymentDate.toISOString().split('T')[0],
          'Notes': existingMembership.notes
        });
        console.log('Membership updated in Google Sheets');
      } catch (error) {
        console.error('Error updating membership in Google Sheets:', error);
        // Don't fail the process if Google Sheets update fails
      }

      // Send upgrade confirmation email
      try {
        await sendMembershipUpgradeEmail(
          {
            firstName: existingMembership.firstName,
            lastName: existingMembership.lastName,
            email: existingMembership.email
          },
          {
            upgradeCost: 0, // Manual upgrade has no additional cost
            newPeriodEnd: existingMembership.currentPeriodEnd,
            membershipType: 'annual'
          }
        );
        console.log('Upgrade confirmation email sent to:', existingMembership.email);
      } catch (emailError) {
        console.error('Error sending upgrade confirmation email:', emailError);
        // Don't fail the process if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully upgraded to annual membership (manual upgrade)',
        membershipType: 'annual',
        currentPeriodEnd: existingMembership.currentPeriodEnd,
        nextPaymentDate: existingMembership.nextPaymentDate,
        membershipId: existingMembership._id
      });
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

      // Update the existing membership to annual (simplified approach)
      const originalPeriodEnd = existingMembership.currentPeriodEnd;
      existingMembership.membershipType = 'annual';
      existingMembership.stripePriceId = process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID;
      existingMembership.notes = `Upgraded from monthly membership on ${new Date().toISOString()}. Annual membership will begin on ${originalPeriodEnd.toISOString()}`;
      existingMembership.source = 'upgrade';
      
      // Calculate new period end for annual membership
      const newPeriodEnd = new Date(originalPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
      existingMembership.currentPeriodEnd = newPeriodEnd;
      existingMembership.nextPaymentDate = newPeriodEnd;
      
      await existingMembership.save();
      console.log(`Membership upgraded successfully for ${email}. New period end: ${newPeriodEnd.toISOString()}`);

      // Update Google Sheets
      try {
        await updateMemberInSheet(existingMembership.email, {
          'Plan Type': 'annual',
          'Current Period End': existingMembership.currentPeriodEnd.toISOString().split('T')[0],
          'Next Payment Date': existingMembership.nextPaymentDate.toISOString().split('T')[0],
          'Notes': existingMembership.notes
        });
        console.log('Membership updated in Google Sheets');
      } catch (error) {
        console.error('Error updating membership in Google Sheets:', error);
        // Don't fail the process if Google Sheets update fails
      }

      // Send upgrade confirmation email
      try {
        await sendMembershipUpgradeEmail(
          {
            firstName: existingMembership.firstName,
            lastName: existingMembership.lastName,
            email: existingMembership.email
          },
          {
            upgradeCost: 0, // Stripe upgrade cost would be handled by Stripe
            newPeriodEnd: existingMembership.currentPeriodEnd,
            membershipType: 'annual'
          }
        );
        console.log('Upgrade confirmation email sent to:', existingMembership.email);
      } catch (emailError) {
        console.error('Error sending upgrade confirmation email:', emailError);
        // Don't fail the process if email fails
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully upgraded to annual membership',
        membershipType: 'annual',
        currentPeriodEnd: existingMembership.currentPeriodEnd,
        nextPaymentDate: existingMembership.nextPaymentDate,
        membershipId: existingMembership._id
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
