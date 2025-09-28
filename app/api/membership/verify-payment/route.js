import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { addMemberToSheet, updateMemberInSheet } from '../../../../lib/googleSheets';
import { sendMemberWelcomeEmail } from '../../../../lib/memberEmails';

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
    const { membershipType, email, firstName, lastName, phone } = session.metadata;
    
    console.log('📊 Verify Payment - Session metadata:', session.metadata);
    
    if (!membershipType || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing membership information' },
        { status: 400 }
      );
    }

    // Check if this is an upgrade scenario
    const isUpgrade = session.metadata.isUpgrade === 'true';
    const previousMembershipType = session.metadata.previousMembershipType;
    const upgradeType = session.metadata.upgradeType;
    
    console.log('🔍 Verify Payment - Checking for upgrade:', {
      email,
      isUpgrade,
      previousMembershipType,
      upgradeType,
      newMembershipType: membershipType
    });

    // Find the membership record (should exist if webhook processed successfully)
    let membership = await Membership.findOne({
      email: email,
      stripeCustomerId: session.customer,
      status: 'active'
    });
    
    console.log('🔍 Initial membership lookup result:', {
      found: !!membership,
      email,
      stripeCustomerId: session.customer,
      membershipType: membership?.membershipType
    });
    
    // If not found by customer ID, try to find by email only (for upgrades)
    if (!membership) {
      membership = await Membership.findOne({
        email: email,
        status: 'active'
      });
      
      console.log('🔍 Fallback lookup by email only:', {
        found: !!membership,
        email,
        membershipType: membership?.membershipType,
        existingStripeCustomerId: membership?.stripeCustomerId
      });
    }

    // Check if this is an upgrade scenario and we have a membership
    if (membership && isUpgrade && membership.membershipType !== membershipType) {
      console.log('🔄 Found existing membership, processing upgrade:', {
        existingType: membership.membershipType,
        newType: membershipType,
        isUpgrade
      });
      
      // Update existing membership for upgrade
      console.log('🔄 Before update:', {
        membershipType: membership.membershipType,
        stripeCustomerId: membership.stripeCustomerId,
        stripeSubscriptionId: membership.stripeSubscriptionId
      });
      
      membership.membershipType = membershipType;
      membership.stripeCustomerId = session.customer;
      membership.stripeSubscriptionId = session.subscription;
      membership.stripePriceId = membershipType === 'monthly' ? process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID : process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID;
      
      console.log('🔄 After update (before save):', {
        membershipType: membership.membershipType,
        stripeCustomerId: membership.stripeCustomerId,
        stripeSubscriptionId: membership.stripeSubscriptionId
      });
      
      // Update period dates - for upgrades, start the new plan after the current plan ends
      if (membershipType === 'monthly') {
        membership.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        membership.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else {
        // For annual upgrade, start the annual plan after the current monthly plan ends
        const currentPeriodEnd = new Date(membership.currentPeriodEnd);
        membership.currentPeriodEnd = new Date(currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
        membership.nextPaymentDate = new Date(currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
        
        console.log('📅 Annual upgrade date calculation:', {
          currentMonthlyEnd: currentPeriodEnd.toISOString(),
          newAnnualEnd: membership.currentPeriodEnd.toISOString(),
          nextPaymentDate: membership.nextPaymentDate.toISOString()
        });
      }
      
      // Add upgrade note
      const existingNotes = membership.notes || '';
      membership.notes = `${existingNotes}\nUpgraded from ${membership.membershipType} to ${membershipType} via verify-payment fallback on ${new Date().toISOString()}`.trim();
      
      await membership.save();
      console.log('✅ Membership upgraded via verify-payment fallback:', membership.email);
      console.log('🔍 Updated membership details:', {
        email: membership.email,
        membershipType: membership.membershipType,
        status: membership.status,
        currentPeriodEnd: membership.currentPeriodEnd
      });
      
      // Verify the save worked by re-fetching from database
      const savedMembership = await Membership.findById(membership._id);
      console.log('🔍 Verification - re-fetched from database:', {
        membershipType: savedMembership.membershipType,
        status: savedMembership.status,
        updatedAt: savedMembership.updatedAt
      });
      
      // Update Google Sheets if configured
      try {
        if (membership.googleSheetsRowId) {
          await updateMemberInSheet(email, {
            'Plan Type': membershipType,
            'Current Period End': membership.currentPeriodEnd.toISOString().split('T')[0],
            'Next Payment Date': membership.nextPaymentDate.toISOString().split('T')[0],
            'Notes': membership.notes
          });
          console.log('✅ Google Sheets updated for upgraded membership via verify-payment');
        }
      } catch (sheetError) {
        console.error('❌ Error updating Google Sheets for upgrade via verify-payment:', sheetError);
      }
      
      return NextResponse.json({
        success: true,
        isMember: true,
        membership: {
          email: membership.email,
          firstName: membership.firstName,
          lastName: membership.lastName,
          membershipType: membership.membershipType,
          status: membership.status,
          currentPeriodStart: membership.currentPeriodStart,
          currentPeriodEnd: membership.currentPeriodEnd,
          cancelAtPeriodEnd: membership.cancelAtPeriodEnd || false,
          totalSavings: membership.totalSavings || 0,
          createdAt: membership.createdAt
        }
      });
    }

    // If no membership found, check for existing membership with same email (for upgrades)
    if (!membership && isUpgrade) {
      console.log('🔄 No membership found, checking for upgrade scenario...');
      membership = await Membership.findOne({
        email: email,
        status: { $in: ['active', 'past_due'] }
      });
      
      console.log('🔍 Fallback membership lookup result:', {
        found: !!membership,
        email,
        membershipType: membership?.membershipType,
        status: membership?.status
      });
      
      if (membership) {
        console.log('🔄 Processing upgrade in verify-payment fallback:', {
          existingType: membership.membershipType,
          newType: membershipType
        });
        
        // Update existing membership for upgrade
        console.log('🔄 Before update:', {
          membershipType: membership.membershipType,
          stripeCustomerId: membership.stripeCustomerId,
          stripeSubscriptionId: membership.stripeSubscriptionId
        });
        
        membership.membershipType = membershipType;
        membership.stripeCustomerId = session.customer;
        membership.stripeSubscriptionId = session.subscription;
        membership.stripePriceId = membershipType === 'monthly' ? process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID : process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID;
        
        console.log('🔄 After update (before save):', {
          membershipType: membership.membershipType,
          stripeCustomerId: membership.stripeCustomerId,
          stripeSubscriptionId: membership.stripeSubscriptionId
        });
        
        // Update period dates - for upgrades, start the new plan after the current plan ends
        if (membershipType === 'monthly') {
          membership.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          membership.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else {
          // For annual upgrade, start the annual plan after the current monthly plan ends
          const currentPeriodEnd = new Date(membership.currentPeriodEnd);
          membership.currentPeriodEnd = new Date(currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
          membership.nextPaymentDate = new Date(currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
          
          console.log('📅 Annual upgrade date calculation (fallback):', {
            currentMonthlyEnd: currentPeriodEnd.toISOString(),
            newAnnualEnd: membership.currentPeriodEnd.toISOString(),
            nextPaymentDate: membership.nextPaymentDate.toISOString()
          });
        }
        
        // Add upgrade note
        const existingNotes = membership.notes || '';
        membership.notes = `${existingNotes}\nUpgraded from ${previousMembershipType} to ${membershipType} via verify-payment fallback on ${new Date().toISOString()}`.trim();
        
        await membership.save();
        console.log('✅ Membership upgraded via verify-payment fallback:', membership.email);
        console.log('🔍 Updated membership details:', {
          email: membership.email,
          membershipType: membership.membershipType,
          status: membership.status,
          currentPeriodEnd: membership.currentPeriodEnd
        });
        
        // Verify the save worked by re-fetching from database
        const savedMembership = await Membership.findById(membership._id);
        console.log('🔍 Verification - re-fetched from database:', {
          membershipType: savedMembership.membershipType,
          status: savedMembership.status,
          updatedAt: savedMembership.updatedAt
        });
        
        // Update Google Sheets if configured
        try {
          if (membership.googleSheetsRowId) {
            await updateMemberInSheet(email, {
              'Plan Type': membershipType,
              'Current Period End': membership.currentPeriodEnd.toISOString().split('T')[0],
              'Next Payment Date': membership.nextPaymentDate.toISOString().split('T')[0],
              'Notes': membership.notes
            });
            console.log('✅ Google Sheets updated for upgraded membership via verify-payment');
          }
        } catch (sheetError) {
          console.error('❌ Error updating Google Sheets for upgrade via verify-payment:', sheetError);
        }
      }
    }

    if (!membership) {
      console.log('Membership not found, creating from checkout session:', email);
      
      // Create membership record from checkout session (fallback when webhook doesn't work)
      membership = new Membership({
        email,
        firstName,
        lastName,
        phone: phone || '',
        membershipType,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription || null,
        stripePriceId: membershipType === 'monthly' ? process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID : process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID,
        status: 'active',
        currentPeriodStart: new Date(),
        source: 'checkout-fallback'
      });
      
      // Set period end based on membership type
      if (membershipType === 'monthly') {
        membership.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        membership.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else {
        membership.currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        membership.nextPaymentDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }

      await membership.save();
      console.log('Membership created from checkout session:', membership.email);

      // Add member to Google Sheets
      try {
        const googleSheetsRowId = await addMemberToSheet(membership);
        membership.googleSheetsRowId = googleSheetsRowId;
        await membership.save();
        console.log('Member added to Google Sheets with row ID:', googleSheetsRowId);
      } catch (error) {
        console.error('Error adding member to Google Sheets:', error);
        // Don't throw error - continue with email sending
      }

      // Send welcome email
      try {
        await sendMemberWelcomeEmail({
          email: membership.email,
          firstName: membership.firstName,
          lastName: membership.lastName,
          membershipType: membership.membershipType
        });
        console.log('Welcome email sent to:', membership.email);
      } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw error - membership is still created
      }
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