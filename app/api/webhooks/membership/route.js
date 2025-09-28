import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet, addMemberToSheet } from '../../../../lib/googleSheets';
import { sendMemberWelcomeEmail, sendPaymentConfirmationEmail, sendRenewalReminderEmail, sendMembershipUpgradeEmail, sendMembershipExpirationReminderEmail } from '../../../../lib/memberEmails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_MEMBERSHIP_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    console.log('🔔 Webhook endpoint called');
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('❌ Webhook signature verification failed:', { signature: !!signature, webhookSecret: !!webhookSecret });
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    await connectDB();

    console.log('🔔 Webhook Event Received:', event.type);
    console.log('🔍 Full event data:', JSON.stringify(event, null, 2));
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('📋 Processing checkout.session.completed');
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        console.log('📋 Processing customer.subscription.created');
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
      
      case 'invoice.upcoming':
        await handleInvoiceUpcoming(event.data.object);
        break;
      
      case 'customer.subscription.paused':
        await handleSubscriptionPaused(event.data.object);
        break;
      
      case 'customer.subscription.resumed':
        await handleSubscriptionResumed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(session) {
  try {
    console.log('✅ Checkout session completed:', session.id);
    console.log('📊 Session metadata:', session.metadata);
    
    // Check if this is a subscription checkout
    if (session.mode === 'subscription') {
      console.log('Subscription checkout completed, waiting for subscription.created event');
      console.log('🔍 Subscription checkout metadata:', session.metadata);
      return; // Let the subscription.created event handle the membership creation
    }
    
    // Check if payment was successful (for one-time payments)
    if (session.payment_status !== 'paid') {
      console.log('Payment not successful, skipping membership creation');
      return;
    }

    // Check if this is an upgrade payment
    const { type } = session.metadata;
    if (type === 'membership_upgrade') {
      console.log('Processing membership upgrade payment:', session.id);
      await handleMembershipUpgrade(session);
      return;
    }

    // Get membership data from session metadata
    const { membershipType, email, firstName, lastName, phone } = session.metadata;
    
    if (!membershipType || !email || !firstName || !lastName) {
      console.log('Missing required membership data in session metadata');
      return;
    }

    // Check if membership already exists (prevent duplicates)
    const existingMembership = await Membership.findOne({
      email: email,
      status: { $in: ['active', 'past_due'] }
    });

    if (existingMembership) {
      // Check if this is an upgrade scenario
      const isUpgrade = session.metadata.isUpgrade === 'true';
      const previousMembershipType = session.metadata.previousMembershipType;
      const upgradeType = session.metadata.upgradeType;
      
      console.log('🔍 Webhook Debug - Existing membership found:', {
        email,
        existingType: existingMembership.membershipType,
        newType: membershipType,
        isUpgrade,
        previousMembershipType,
        upgradeType,
        metadata: session.metadata
      });
      
      if (isUpgrade && upgradeType === 'membership_change' && previousMembershipType !== membershipType) {
        console.log(`Processing membership upgrade: ${previousMembershipType} -> ${membershipType} for ${email}`);
        
        // Update existing membership instead of creating new one
        existingMembership.membershipType = membershipType;
        existingMembership.stripePriceId = membershipType === 'monthly' ? process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID : process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID;
        
        // For subscription checkouts, session.subscription might be null initially
        // The subscription ID will be set when customer.subscription.created webhook fires
        if (session.subscription) {
          existingMembership.stripeSubscriptionId = session.subscription;
        }
        
        // Update period dates - for upgrades, start the new plan after the current plan ends
        if (membershipType === 'monthly') {
          existingMembership.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          existingMembership.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else {
          // For annual upgrade, start the annual plan after the current monthly plan ends
          const currentPeriodEnd = new Date(existingMembership.currentPeriodEnd);
          existingMembership.currentPeriodEnd = new Date(currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
          existingMembership.nextPaymentDate = new Date(currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
          
          console.log('📅 Webhook - Annual upgrade date calculation:', {
            currentMonthlyEnd: currentPeriodEnd.toISOString(),
            newAnnualEnd: existingMembership.currentPeriodEnd.toISOString(),
            nextPaymentDate: existingMembership.nextPaymentDate.toISOString()
          });
        }
        
        // Add note about the upgrade
        const existingNotes = existingMembership.notes || '';
        existingMembership.notes = `${existingNotes}\nUpgraded from ${previousMembershipType} to ${membershipType} on ${new Date().toISOString()}`.trim();
        
        await existingMembership.save();
        
        console.log(`Membership upgraded successfully: ${email} from ${previousMembershipType} to ${membershipType}`);
        
        // Update Google Sheets if configured
        try {
          if (existingMembership.googleSheetsRowId) {
            await updateMemberInSheet(email, {
              'Plan Type': membershipType,
              'Current Period End': existingMembership.currentPeriodEnd.toISOString().split('T')[0],
              'Next Payment Date': existingMembership.nextPaymentDate.toISOString().split('T')[0],
              'Notes': existingMembership.notes
            });
            console.log('Google Sheets updated for upgraded membership');
          }
        } catch (sheetError) {
          console.error('Error updating Google Sheets for upgrade:', sheetError);
        }
        
        return; // Exit early since we handled the upgrade
      } else {
        console.log('Active membership already exists for:', email, '- no upgrade detected');
        return;
      }
    }

    // Create new membership record
    const membership = new Membership({
      email,
      firstName,
      lastName,
      phone,
      membershipType,
      stripeCustomerId: session.customer,
      stripePriceId: membershipType === 'monthly' ? process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID : process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID,
      status: 'active',
      currentPeriodStart: new Date()
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
    await sendMemberWelcomeEmail({
      email: membership.email,
      firstName: membership.firstName,
      lastName: membership.lastName,
      membershipType: membership.membershipType
    });

    console.log('Membership created and activated successfully:', membership.email);
    
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('✅ Subscription created:', subscription.id);
    console.log('📊 Subscription details:', {
      customer: subscription.customer,
      status: subscription.status,
      current_period_end: subscription.current_period_end
    });
    
    // Get customer details from Stripe (with error handling)
    let customer;
    try {
      customer = await stripe.customers.retrieve(subscription.customer);
    } catch (stripeError) {
      console.error('Error retrieving customer from Stripe:', stripeError.message);
      
      // If customer doesn't exist in Stripe, create a fallback membership
      // This can happen in test scenarios or if customer was deleted
      const fallbackEmail = `subscription-${subscription.id}@stripe-customer.com`;
      customer = {
        email: fallbackEmail,
        metadata: {
          firstName: 'Stripe',
          lastName: 'Customer'
        },
        phone: ''
      };
      console.log('Using fallback customer data for subscription:', subscription.id);
    }
    
    // Determine membership type from price ID
    const priceId = subscription.items.data[0].price.id;
    const membershipType = priceId === process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID ? 'monthly' : 'annual';
    
    console.log('🔍 Subscription Created - Price ID analysis:', {
      priceId,
      monthlyPriceId: process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID,
      annualPriceId: process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID,
      determinedMembershipType: membershipType
    });
    
    // Check if membership already exists
    const existingMembership = await Membership.findOne({
      stripeCustomerId: subscription.customer,
      status: { $in: ['active', 'past_due'] }
    });

    if (existingMembership) {
      // Check if this is an upgrade scenario by comparing membership types
      console.log('🔍 Subscription Created Debug - Existing membership found:', {
        email: customer.email,
        existingType: existingMembership.membershipType,
        newType: membershipType,
        subscriptionId: subscription.id
      });
      
      if (existingMembership.membershipType !== membershipType) {
        const originalMembershipType = existingMembership.membershipType;
        console.log(`Processing membership upgrade via subscription: ${originalMembershipType} -> ${membershipType} for ${customer.email}`);
        
        // Update existing membership instead of creating new one
        existingMembership.membershipType = membershipType;
        existingMembership.stripeSubscriptionId = subscription.id;
        existingMembership.stripePriceId = priceId;
        
        // For upgrades, use custom date calculation to start annual plan after monthly plan ends
        if (membershipType === 'annual' && originalMembershipType === 'monthly') {
          const currentPeriodEnd = new Date(existingMembership.currentPeriodEnd);
          existingMembership.currentPeriodEnd = new Date(currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
          existingMembership.nextPaymentDate = new Date(currentPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
          
          console.log('📅 Subscription webhook - Annual upgrade date calculation:', {
            currentMonthlyEnd: currentPeriodEnd.toISOString(),
            newAnnualEnd: existingMembership.currentPeriodEnd.toISOString(),
            nextPaymentDate: existingMembership.nextPaymentDate.toISOString()
          });
        } else {
          // For new subscriptions or non-upgrade scenarios, use Stripe dates
          existingMembership.currentPeriodStart = new Date(subscription.current_period_start * 1000);
          existingMembership.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          existingMembership.nextPaymentDate = new Date(subscription.current_period_end * 1000);
        }
        
        // Add note about the upgrade
        const existingNotes = existingMembership.notes || '';
        existingMembership.notes = `${existingNotes}\nUpgraded from ${originalMembershipType} to ${membershipType} via subscription ${subscription.id} on ${new Date().toISOString()}`.trim();
        
        await existingMembership.save();
        
        console.log(`Membership upgraded successfully via subscription: ${customer.email} from ${originalMembershipType} to ${membershipType}`);
        
        // Update Google Sheets if configured
        try {
          if (existingMembership.googleSheetsRowId) {
            await updateMemberInSheet(customer.email, {
              'Plan Type': membershipType,
              'Current Period Start': existingMembership.currentPeriodStart?.toISOString().split('T')[0] || '',
              'Current Period End': existingMembership.currentPeriodEnd.toISOString().split('T')[0],
              'Next Payment Date': existingMembership.nextPaymentDate.toISOString().split('T')[0],
              'Notes': existingMembership.notes
            });
            console.log('Google Sheets updated for upgraded membership via subscription');
          }
        } catch (sheetError) {
          console.error('Error updating Google Sheets for upgrade via subscription:', sheetError);
        }
        
        return; // Exit early since we handled the upgrade
      } else {
        console.log('Active membership already exists for customer:', subscription.customer, '- same membership type');
        return;
      }
    }

    // Create new membership record
    const membership = new Membership({
      email: customer.email,
      firstName: customer.metadata?.firstName || customer.name?.split(' ')[0] || 'Unknown',
      lastName: customer.metadata?.lastName || customer.name?.split(' ').slice(1).join(' ') || 'User',
      phone: customer.phone || '',
      membershipType: membershipType,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: 'active',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      nextPaymentDate: new Date(subscription.current_period_end * 1000)
    });

    await membership.save();

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

    console.log('Membership created and activated successfully:', membership.email);
    
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Subscription updated:', subscription.id);
    
    // Find all memberships with this subscription ID (could be multiple for upgrades)
    const memberships = await Membership.find({
      stripeSubscriptionId: subscription.id
    });

    if (memberships.length > 0) {
      // Get the current price ID from the subscription
      const currentPriceId = subscription.items.data[0].price.id;
      const isAnnual = currentPriceId === process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID;
      const newMembershipType = isAnnual ? 'annual' : 'monthly';

      for (const membership of memberships) {
        // Check if this is a plan change (upgrade/downgrade)
        const isPlanChange = membership.membershipType !== newMembershipType;
        
        if (isPlanChange) {
          console.log(`Plan change detected: ${membership.membershipType} -> ${newMembershipType}`);
          
          // Update membership type and price ID
          membership.membershipType = newMembershipType;
          membership.stripePriceId = currentPriceId;
          
          // Add note about the plan change
          const existingNotes = membership.notes || '';
          membership.notes = `${existingNotes}\nPlan changed to ${newMembershipType} on ${new Date().toISOString()}`.trim();
        }

        // Update membership details
        membership.currentPeriodStart = new Date(subscription.current_period_start * 1000);
        membership.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        membership.nextPaymentDate = new Date(subscription.current_period_end * 1000);
        membership.cancelAtPeriodEnd = subscription.cancel_at_period_end;
        
        if (subscription.cancel_at_period_end && !isPlanChange) {
          membership.cancelledAt = new Date();
        }

        // Update status based on subscription status
        switch (subscription.status) {
          case 'active':
            membership.status = 'active';
            break;
          case 'past_due':
            membership.status = 'past_due';
            break;
          case 'canceled':
            membership.status = 'cancelled';
            break;
          case 'unpaid':
            membership.status = 'expired';
            break;
          default:
            membership.status = 'active';
        }

        await membership.save();

        // Update Google Sheets
        await updateMemberInSheet(membership.email, {
          'Status': membership.status,
          'Membership Type': membership.membershipType,
          'Current Period Start': membership.currentPeriodStart.toISOString().split('T')[0],
          'Current Period End': membership.currentPeriodEnd.toISOString().split('T')[0],
          'Next Payment Date': membership.nextPaymentDate.toISOString().split('T')[0]
        });
      }
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('Subscription deleted:', subscription.id);
    
    const membership = await Membership.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (membership) {
      membership.status = 'cancelled';
      membership.cancelledAt = new Date();
      await membership.save();

      // Update Google Sheets
      await updateMemberInSheet(membership.email, {
        'Status': 'cancelled'
      });
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  try {
    console.log('Payment succeeded for invoice:', invoice.id);
    
    if (invoice.subscription) {
      const membership = await Membership.findOne({
        stripeSubscriptionId: invoice.subscription
      });

      if (membership) {
        membership.lastPaymentDate = new Date();
        membership.status = 'active';
        await membership.save();

        // Update Google Sheets
        await updateMemberInSheet(membership.email, {
          'Status': 'active',
          'Last Payment Date': membership.lastPaymentDate.toISOString().split('T')[0]
        });

        // Send welcome email for first payment or payment confirmation for renewals
        try {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const isFirstPayment = subscription.metadata.welcomeEmailSent === 'false';
          
          if (isFirstPayment) {
            // Send welcome email for new member
            await sendMemberWelcomeEmail({
              email: membership.email,
              firstName: membership.firstName,
              lastName: membership.lastName,
              membershipType: membership.membershipType
            });
            
            // Mark welcome email as sent
            await stripe.subscriptions.update(invoice.subscription, {
              metadata: {
                ...subscription.metadata,
                welcomeEmailSent: 'true'
              }
            });
          } else {
            // Send payment confirmation for renewal
            await sendPaymentConfirmationEmail({
              email: membership.email,
              firstName: membership.firstName,
              membershipType: membership.membershipType
            }, {
              amount: (invoice.amount_paid / 100).toFixed(2),
              nextPaymentDate: new Date(membership.currentPeriodEnd)
            });
          }
        } catch (emailError) {
          console.error('Error sending payment email:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  try {
    console.log('Payment failed for invoice:', invoice.id);
    
    if (invoice.subscription) {
      const membership = await Membership.findOne({
        stripeSubscriptionId: invoice.subscription
      });

      if (membership) {
        membership.status = 'past_due';
        await membership.save();

        // Update Google Sheets
        await updateMemberInSheet(membership.email, {
          'Status': 'past_due'
        });
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Handle trial will end
async function handleTrialWillEnd(subscription) {
  try {
    console.log('Trial will end for subscription:', subscription.id);
    
    const membership = await Membership.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (membership) {
      // You can send a notification email here
      console.log(`Trial ending soon for member: ${membership.email}`);
    }
  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}

// Handle upcoming invoice (renewal reminder)
async function handleInvoiceUpcoming(invoice) {
  try {
    console.log('Upcoming invoice for subscription:', invoice.subscription);
    
    if (invoice.subscription) {
      const membership = await Membership.findOne({
        stripeSubscriptionId: invoice.subscription
      });

      if (membership && membership.status === 'active') {
        // Calculate days until expiration
        const now = new Date();
        const daysUntilExpiry = Math.ceil((new Date(membership.currentPeriodEnd) - now) / (1000 * 60 * 60 * 24));
        
        // Send expiration reminder if within 7 days
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          try {
            await sendMembershipExpirationReminderEmail(
              {
                firstName: membership.firstName,
                lastName: membership.lastName,
                email: membership.email
              },
              {
                membershipType: membership.membershipType,
                currentPeriodEnd: membership.currentPeriodEnd,
                daysUntilExpiry: daysUntilExpiry
              }
            );
            console.log(`Expiration reminder sent to ${membership.email} via invoice.upcoming webhook (${daysUntilExpiry} days)`);
          } catch (error) {
            console.error(`Error sending expiration reminder to ${membership.email}:`, error);
          }
        }
        
        // Send renewal reminder email
        try {
          await sendRenewalReminderEmail({
            email: membership.email,
            firstName: membership.firstName,
            membershipType: membership.membershipType,
            currentPeriodEnd: membership.currentPeriodEnd
          });
          console.log('Renewal reminder sent to:', membership.email);
        } catch (emailError) {
          console.error('Error sending renewal reminder:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error handling upcoming invoice:', error);
  }
}

// Handle subscription paused
async function handleSubscriptionPaused(subscription) {
  try {
    console.log('Subscription paused:', subscription.id);
    
    const membership = await Membership.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (membership) {
      membership.status = 'paused';
      await membership.save();

      // Update Google Sheets
      await updateMemberInSheet(membership.email, {
        'Status': 'paused'
      });
    }
  } catch (error) {
    console.error('Error handling subscription paused:', error);
  }
}

// Handle subscription resumed
async function handleSubscriptionResumed(subscription) {
  try {
    console.log('Subscription resumed:', subscription.id);
    
    const membership = await Membership.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (membership) {
      membership.status = 'active';
      await membership.save();

      // Update Google Sheets
      await updateMemberInSheet(membership.email, {
        'Status': 'active'
      });
    }
  } catch (error) {
    console.error('Error handling subscription resumed:', error);
  }
}

// Handle membership upgrade payment
async function handleMembershipUpgrade(session) {
  try {
    console.log('Handling membership upgrade payment:', session.id);
    
    const { email, membershipId, upgradeCost, remainingMonthlyValue } = session.metadata;
    
    if (!email || !membershipId) {
      console.error('Missing upgrade information in session metadata');
      return;
    }

    // Find the membership record to upgrade
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      console.error('Membership not found for upgrade:', membershipId);
      return;
    }

    // Check if already upgraded
    if (membership.membershipType === 'annual') {
      console.log('Membership already upgraded to annual:', email);
      return;
    }

    // Perform the upgrade
    console.log('Upgrading membership to annual:', email);
    
    // Calculate new period end (1 year from current period end)
    const originalPeriodEnd = new Date(membership.currentPeriodEnd);
    const newPeriodEnd = new Date(originalPeriodEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    // Update membership record
    membership.membershipType = 'annual';
    membership.currentPeriodEnd = newPeriodEnd;
    membership.nextPaymentDate = newPeriodEnd;
    membership.notes = `Upgraded from monthly to annual on ${new Date().toISOString()}. Upgrade cost: ${upgradeCost} AED`;
    membership.source = 'upgrade-payment';
    
    await membership.save();
    console.log(`Membership upgraded to annual for ${email}. New period end: ${newPeriodEnd.toISOString()}`);

    // Update Google Sheets
    try {
      await updateMemberInSheet(membership.email, {
        'Plan Type': 'annual',
        'Current Period End': membership.currentPeriodEnd.toISOString().split('T')[0],
        'Next Payment Date': membership.nextPaymentDate.toISOString().split('T')[0],
        'Notes': membership.notes
      });
      console.log('Membership updated in Google Sheets');
    } catch (error) {
      console.error('Error updating membership in Google Sheets:', error);
    }

    // Send upgrade confirmation email
    try {
      await sendMembershipUpgradeEmail(
        {
          firstName: membership.firstName,
          lastName: membership.lastName,
          email: membership.email
        },
        {
          upgradeCost: parseFloat(upgradeCost || 0),
          newPeriodEnd: membership.currentPeriodEnd,
          membershipType: 'annual'
        }
      );
      console.log('Upgrade confirmation email sent to:', membership.email);
    } catch (error) {
      console.error('Error sending upgrade confirmation email:', error);
      // Don't fail the process if email sending fails
    }

    console.log('Membership upgrade completed successfully:', email);
    
  } catch (error) {
    console.error('Error handling membership upgrade:', error);
  }
}

