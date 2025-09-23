import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { updateMemberInSheet, addMemberToSheet } from '../../../../lib/googleSheets';
import { sendMemberWelcomeEmail, sendPaymentConfirmationEmail, sendRenewalReminderEmail } from '../../../../lib/memberEmails';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_MEMBERSHIP_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
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

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
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
    console.log('Checkout session completed:', session.id);
    
    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      console.log('Payment not successful, skipping membership creation');
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
      console.log('Active membership already exists for:', email);
      return;
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
    await addMemberToSheet(membership);

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
    console.log('Subscription created:', subscription.id);
    
    // Find membership by customer ID (since subscription ID isn't set yet)
    const membership = await Membership.findOne({
      stripeCustomerId: subscription.customer,
      status: 'pending'
    });

    if (membership) {
      // Update membership status and subscription ID
      membership.status = 'active';
      membership.stripeSubscriptionId = subscription.id;
      membership.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      membership.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      membership.nextPaymentDate = new Date(subscription.current_period_end * 1000);
      await membership.save();

      // Add member to Google Sheets
      await addMemberToSheet(membership);

      // Send welcome email
      await sendMemberWelcomeEmail(membership);

      console.log('Membership activated successfully:', membership.email);
    } else {
      console.log('No pending membership found for customer:', subscription.customer);
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Subscription updated:', subscription.id);
    
    const membership = await Membership.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (membership) {
      // Update membership details
      membership.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      membership.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      membership.nextPaymentDate = new Date(subscription.current_period_end * 1000);
      membership.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      
      if (subscription.cancel_at_period_end) {
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
        'Current Period Start': membership.currentPeriodStart.toISOString().split('T')[0],
        'Current Period End': membership.currentPeriodEnd.toISOString().split('T')[0],
        'Next Payment Date': membership.nextPaymentDate.toISOString().split('T')[0]
      });
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

      if (membership) {
        // Send renewal reminder email
        try {
          await sendRenewalReminderEmail({
            email: membership.email,
            firstName: membership.firstName,
            membershipType: membership.membershipType,
            currentPeriodEnd: membership.currentPeriodEnd
          });
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
