import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import { addBookingToEventSheet } from "@/lib/googleSheets";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";

export const dynamic = "force-dynamic";

// Timeout wrapper to prevent webhook from taking too long
const withTimeout = (promise, timeoutMs = 25000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Webhook timeout')), timeoutMs)
    )
  ]);
};

// Helper function to find checkout session by payment intent
async function findCheckoutSessionByPaymentIntent(stripe, paymentIntentId) {
  try {
    // List checkout sessions and find the one with this payment intent
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      payment_intent: paymentIntentId
    });
    
    if (sessions.data && sessions.data.length > 0) {
      return sessions.data[0];
    }
    
    // If not found, try searching by expanding payment_intent
    const allSessions = await stripe.checkout.sessions.list({ limit: 100 });
    for (const session of allSessions.data) {
      if (session.payment_intent === paymentIntentId) {
        return session;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding checkout session:', error);
    return null;
  }
}

// Reusable function to process a checkout session and save booking
// This can be called from both checkout.session.completed and fallback handlers
async function processCheckoutSession(session, isFallback = false) {
  if (isFallback) {
    console.log('🔄 [FALLBACK] Processing checkout session as fallback recovery');
  }
  
  // Check if payment actually succeeded
  if (session.payment_status !== 'paid') {
    console.log('⚠️ Payment not successful, status:', session.payment_status);
    return { success: false, message: 'Payment not successful' };
  }

  // Only process event ticket checkouts (not membership checkouts)
  if (!session.metadata?.eventId) {
    console.log('⚠️ No eventId in metadata, skipping event webhook processing');
    return { success: false, message: 'Not an event checkout' };
  }

  try {
    await withTimeout(async () => {
      await connectDB();
      const eventId = session.metadata?.eventId;
      
      let paidEvent = await Event.findById(eventId);
      if (!paidEvent) {
        console.log(`❌ Event not found for booking: ${eventId}`);
        
        // Try to find a similar event by segment
        const eventSegment = session.metadata?.eventSegment || 'mamaBreakfast';
        const fallbackEvent = await Event.findOne({ segment: eventSegment }).sort({ createdAt: -1 });
        
        if (fallbackEvent) {
          console.log(`✅ Using fallback event: ${fallbackEvent.title} (${fallbackEvent._id})`);
          paidEvent = fallbackEvent;
        } else {
          throw new Error(`Event not found: ${eventId}`);
        }
      }

      const transactionId = session.payment_intent || session.id;
      const guardianName = session.metadata?.guardianName || session.customer_details?.name || '';
      const userEmail = session.metadata?.email || session.customer_details?.email || '';
      const childName = session.metadata?.childName || '';
      const phone = session.metadata?.phone || '';
      const numberOfTickets = parseInt(session.metadata?.numberOfTickets) || 1;
      const photographyConsent = session.metadata?.photographyConsent === 'Yes' ? 'Yes' : 'No';

      // Retrieve PaymentIntent to get payment method details
      let paymentMethodInfo = null;
      try {
        if (session.payment_intent) {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
            expand: ['payment_method', 'charges.data.payment_method_details']
          });
          
          console.log('💳 PaymentIntent retrieved:', {
            id: paymentIntent.id,
            status: paymentIntent.status,
            payment_method: paymentIntent.payment_method,
            charges: paymentIntent.charges?.data?.length || 0
          });

          // Extract payment method details
          if (paymentIntent.payment_method) {
            const pm = typeof paymentIntent.payment_method === 'string' 
              ? await stripe.paymentMethods.retrieve(paymentIntent.payment_method)
              : paymentIntent.payment_method;
            
            paymentMethodInfo = {
              type: pm.type,
              card: pm.card ? {
                brand: pm.card.brand,
                last4: pm.card.last4,
                exp_month: pm.card.exp_month,
                exp_year: pm.card.exp_year
              } : null,
              apple_pay: pm.type === 'card' && pm.card?.wallet?.type === 'apple_pay',
              google_pay: pm.type === 'card' && pm.card?.wallet?.type === 'google_pay'
            };
            
            console.log('💳 Payment Method Details:', paymentMethodInfo);
          } else if (paymentIntent.charges?.data?.length > 0) {
            // Fallback: get payment method from charge
            const charge = paymentIntent.charges.data[0];
            if (charge.payment_method_details) {
              paymentMethodInfo = {
                type: charge.payment_method_details.type,
                card: charge.payment_method_details.card ? {
                  brand: charge.payment_method_details.card.brand,
                  last4: charge.payment_method_details.card.last4,
                  exp_month: charge.payment_method_details.card.exp_month,
                  exp_year: charge.payment_method_details.card.exp_year
                } : null,
                apple_pay: charge.payment_method_details.type === 'card' && charge.payment_method_details.card?.wallet?.type === 'apple_pay',
                google_pay: charge.payment_method_details.type === 'card' && charge.payment_method_details.card?.wallet?.type === 'google_pay'
              };
              console.log('💳 Payment Method Details (from charge):', paymentMethodInfo);
            }
          }
        }
      } catch (paymentMethodError) {
        console.error('❌ Error retrieving payment method:', paymentMethodError);
        // Don't fail the webhook if payment method retrieval fails
      }

      // Check if booking already exists to prevent duplicates
      const existingBooking = await Booking.findOne({ transactionId });
      if (existingBooking) {
        console.log('⚠️ Booking already exists for transaction:', transactionId);
        return { success: true, message: 'Booking already exists', booking: existingBooking };
      }

      // Parse additional data from metadata
      let additionalData = {};
      try {
        if (session.metadata?.additionalData) {
          additionalData = JSON.parse(session.metadata.additionalData);
        }
      } catch (parseError) {
        console.log('Error parsing additional data:', parseError);
      }

      // Extract all additional data from metadata (same as main handler)
      const extractedData = {
        emergencyName: session.metadata?.emergencyName || additionalData.emergencyName || '',
        emergencyPhone: session.metadata?.emergencyPhone || additionalData.emergencyPhone || '',
        childAge: session.metadata?.childAge || additionalData.childAge || '',
        childGender: session.metadata?.childGender || additionalData.childGender || '',
        childDob: session.metadata?.childDob || additionalData.childDob || '',
        dietaryRequirements: session.metadata?.dietaryRequirements || (additionalData.allergies ? additionalData.allergies.join(', ') : '') || '',
        foodAllergies: session.metadata?.foodAllergies || additionalData.foodAllergies || '',
        allergies: session.metadata?.allergies || (Array.isArray(additionalData.allergies) ? additionalData.allergies.join(',') : additionalData.allergies) || '',
        medicalConditions: session.metadata?.medicalConditions || additionalData.medicalConditions || '',
        conditionDetails: session.metadata?.conditionDetails || additionalData.conditionDetails || '',
        medicalInfo: session.metadata?.medicalInfo || additionalData.medicalInfo || '',
        ticketType: session.metadata?.ticketType || additionalData.ticketType || '',
        medicalClearance: session.metadata?.medicalClearance || additionalData.medicalClearance || '',
        fitnessLevel: session.metadata?.fitnessLevel || additionalData.fitnessLevel || '',
        cookingExperience: session.metadata?.cookingExperience || additionalData.cookingExperience || '',
        favoriteFoods: session.metadata?.favoriteFoods || additionalData.favoriteFoods || '',
        parent1Name: session.metadata?.parent1Name || additionalData.parent1Name || '',
        parent2Name: session.metadata?.parent2Name || additionalData.parent2Name || '',
        parent1Phone: session.metadata?.parent1Phone || additionalData.parent1Phone || '',
        parent2Phone: session.metadata?.parent2Phone || additionalData.parent2Phone || '',
        child1Name: session.metadata?.child1Name || additionalData.child1Name || '',
        child1Age: session.metadata?.child1Age || additionalData.child1Age || '',
        child2Name: session.metadata?.child2Name || additionalData.child2Name || '',
        child2Age: session.metadata?.child2Age || additionalData.child2Age || '',
        child3Name: session.metadata?.child3Name || additionalData.child3Name || '',
        child3Age: session.metadata?.child3Age || additionalData.child3Age || '',
        child4Name: session.metadata?.child4Name || additionalData.child4Name || '',
        child4Age: session.metadata?.child4Age || additionalData.child4Age || '',
        numberOfChildren: session.metadata?.numberOfChildren || additionalData.numberOfChildren || '',
        howDidYouHear: session.metadata?.howDidYouHear || additionalData.howDidYouHear || '',
        specialRequests: session.metadata?.specialRequests || additionalData.specialRequests || '',
        tablePreferences: session.metadata?.tablePreferences || additionalData.tablePreferences || '',
        additionalNotes: session.metadata?.additionalNotes || additionalData.additionalNotes || '',
        notes: session.metadata?.notes || additionalData.notes || '',
        waiverConsent: session.metadata?.waiverConsent || additionalData.waiverConsent || '',
        newsletterSignup: session.metadata?.newsletterSignup || additionalData.newsletterSignup || '',
        choiceI: session.metadata?.choiceI || additionalData.choiceI || '',
        choiceII: session.metadata?.choiceII || additionalData.choiceII || '',
        choiceIII: session.metadata?.choiceIII || additionalData.choiceIII || '',
        eventSegment: paidEvent.segment || session.metadata?.eventSegment || '',
        isMember: session.metadata?.isMember === 'true' || false,
        memberSavings: parseFloat(session.metadata?.memberSavings) || 0,
        additionalData: additionalData
      };

      // Generate ticket numbers
      const ticketNumbers = [];
      for (let i = 1; i <= numberOfTickets; i++) {
        ticketNumbers.push(i);
      }

      // Create booking
      console.log('💾 Creating booking in database...', {
        eventId,
        guardianName,
        userEmail,
        transactionId,
        numberOfTickets,
        isFallback
      });
      
      const booking = await Booking.create({
        eventId,
        guardianName,
        childName,
        userEmail,
        phone,
        numberOfTickets,
        transactionId,
        paymentStatus: 'paid',
        photographyConsent,
        ticketNumbers,
        ...extractedData
      });

      console.log('✅ Booking created successfully in database:', {
        bookingId: booking._id,
        transactionId: booking.transactionId,
        eventId: booking.eventId,
        guardianName: booking.guardianName,
        userEmail: booking.userEmail,
        isFallback
      });

      // Handle newsletter signup
      if (extractedData.newsletterSignup === 'Yes') {
        try {
          const newsletterResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/newsletter-signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, name: guardianName }),
          });
          if (newsletterResponse.ok) {
            console.log('Newsletter signup successful for:', userEmail);
          }
        } catch (newsletterError) {
          console.error('Error with newsletter signup:', newsletterError);
        }
      }

      // Add booking to Google Sheets
      console.log('📊 Preparing to add booking to Google Sheets...');
      try {
        const bookingData = {
          bookingId: booking._id.toString(),
          eventTitle: paidEvent.title,
          eventDate: paidEvent.date,
          eventSegment: extractedData.eventSegment,
          guardianName,
          childName,
          userEmail,
          phone,
          numberOfTickets,
          transactionId,
          paymentStatus: 'paid',
          photographyConsent,
          emergencyName: extractedData.emergencyName,
          emergencyPhone: extractedData.emergencyPhone,
          childAge: extractedData.childAge,
          childGender: extractedData.childGender,
          childDob: extractedData.childDob,
          dietaryRequirements: extractedData.dietaryRequirements,
          foodAllergies: extractedData.foodAllergies,
          allergies: extractedData.allergies,
          medicalConditions: extractedData.medicalConditions,
          conditionDetails: extractedData.conditionDetails,
          medicalInfo: extractedData.medicalInfo,
          specialRequests: extractedData.specialRequests,
          tablePreferences: extractedData.tablePreferences,
          additionalNotes: extractedData.additionalNotes,
          notes: extractedData.notes,
          parent1Name: extractedData.parent1Name,
          parent2Name: extractedData.parent2Name,
          parent1Phone: extractedData.parent1Phone,
          parent2Phone: extractedData.parent2Phone,
          child1Name: extractedData.child1Name,
          child1Age: extractedData.child1Age,
          child2Name: extractedData.child2Name,
          child2Age: extractedData.child2Age,
          child3Name: extractedData.child3Name,
          child3Age: extractedData.child3Age,
          child4Name: extractedData.child4Name,
          child4Age: extractedData.child4Age,
          numberOfChildren: extractedData.numberOfChildren,
          medicalInfo: extractedData.medicalInfo,
          howDidYouHear: extractedData.howDidYouHear,
          waiverConsent: extractedData.waiverConsent,
          fitnessLevel: extractedData.fitnessLevel,
          medicalClearance: extractedData.medicalClearance,
          cookingExperience: extractedData.cookingExperience,
          favoriteFoods: extractedData.favoriteFoods,
          mainCourseSelection: extractedData.choiceI,
          isMember: extractedData.isMember,
          memberSavings: extractedData.memberSavings,
          bookingDate: new Date(),
          lastUpdated: new Date()
        };

        await addBookingToEventSheet(bookingData, paidEvent);
        console.log('✅ Booking added successfully to event-specific Google Sheet');
      } catch (sheetsError) {
        console.error('❌ Error adding booking to Google Sheets:', {
          error: sheetsError.message,
          stack: sheetsError.stack,
          bookingId: booking._id,
          transactionId: transactionId
        });
      }

      // Send booking confirmation email
      try {
        const emailResult = await sendBookingConfirmationEmail(
          {
            userEmail,
            guardianName,
            childName,
            numberOfTickets,
            transactionId,
            ticketNumbers: ticketNumbers
          },
          {
            title: paidEvent.title,
            date: paidEvent.date,
            location: paidEvent.location,
            description: paidEvent.description,
            price: paidEvent.price
          }
        );
        
        if (emailResult.success) {
          console.log('Booking confirmation email sent successfully');
        } else {
          console.log('Failed to send booking confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError);
      }

      return { success: true, booking, isFallback };
    }, 25000);
  } catch (e) {
    console.error('❌ Error processing checkout session:', e);
    throw e;
  }
}

export async function POST(req) {
  try {
    console.log('🔔 Stripe webhook endpoint called');
    
    // Get webhook secret - try both possible environment variable names
    const secret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_MEMBERSHIP_WEBHOOK_SECRET;
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    // Validate webhook secret exists
    if (!secret) {
      console.error('❌ Webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 400 });
    }

    // Validate signature exists
    if (!sig) {
      console.error('❌ Missing Stripe signature header');
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    let event;
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
      event = stripe.webhooks.constructEvent(payload, sig, secret);
      console.log('✅ Webhook signature verified successfully');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
    }

  // Handle different event types
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('📋 Processing checkout.session.completed event');
    console.log('📊 Session details:', {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      customer_email: session.customer_details?.email,
      metadata: session.metadata
    });
    
    // Check if payment actually succeeded
    if (session.payment_status !== 'paid') {
      console.log('⚠️ Payment not successful, status:', session.payment_status);
      return NextResponse.json({ received: true, message: 'Payment not successful, skipping processing' });
    }

    // Only process event ticket checkouts (not membership checkouts)
    // Membership checkouts have 'membershipType' in metadata, event checkouts have 'eventId'
    if (!session.metadata?.eventId) {
      console.log('⚠️ No eventId in metadata, skipping event webhook processing (likely a membership checkout)');
      console.log('📋 Available metadata keys:', Object.keys(session.metadata || {}));
      return NextResponse.json({ received: true, message: 'Not an event checkout, skipping' });
    }
    
    console.log('✅ Event checkout detected, proceeding with booking processing...');
    
    try {
      const result = await processCheckoutSession(session, false);
      if (result.success) {
        console.log('✅ Webhook processing completed successfully');
      } else {
        console.log('⚠️ Processing returned:', result.message);
      }
    } catch (e) {
      console.error('❌ Webhook processing error:', e);
      console.error('Error details:', {
        message: e.message,
        stack: e.stack,
        name: e.name,
        sessionId: session?.id,
        eventId: session?.metadata?.eventId,
        userEmail: session?.metadata?.email || session?.customer_details?.email
      });
      // Return 200 to prevent Stripe from retrying, but log the error
      return NextResponse.json({ 
        received: true, 
        error: e.message,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }
  }

  // Fallback: Handle charge.succeeded if checkout.session.completed wasn't received
  if (event.type === 'charge.succeeded') {
    const charge = event.data.object;
    console.log('💳 [FALLBACK] Processing charge.succeeded event');
    console.log('⚠️ WARNING: If you see this, checkout.session.completed may not have been received!');
    console.log('📊 Charge details:', {
      id: charge.id,
      payment_intent: charge.payment_intent,
      amount: charge.amount,
      status: charge.status
    });

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
      
      // Get payment intent from charge
      if (charge.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
        console.log('💳 PaymentIntent retrieved:', paymentIntent.id);
        
        // Find checkout session by payment intent
        const session = await findCheckoutSessionByPaymentIntent(stripe, charge.payment_intent);
        
        if (session && session.metadata?.eventId && session.payment_status === 'paid') {
          console.log('✅ Found checkout session for charge, processing booking as fallback...');
          console.log('📋 Session metadata:', session.metadata);
          
          // Process the booking using the same function
          const result = await processCheckoutSession(session, true);
          if (result.success) {
            console.log('✅ [FALLBACK] Booking processed successfully from charge.succeeded event');
          } else {
            console.log('⚠️ [FALLBACK] Processing returned:', result.message);
          }
        } else {
          console.log('⚠️ No valid checkout session found for this charge');
        }
      }
    } catch (error) {
      console.error('❌ Error processing charge.succeeded:', error);
    }
  }

  // Fallback: Handle payment_intent.succeeded if checkout.session.completed wasn't received
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('💳 [FALLBACK] Processing payment_intent.succeeded event');
    console.log('⚠️ WARNING: If you see this, checkout.session.completed may not have been received!');
    console.log('📊 PaymentIntent details:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status
    });

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
      
      // Find checkout session by payment intent
      const session = await findCheckoutSessionByPaymentIntent(stripe, paymentIntent.id);
      
      if (session && session.metadata?.eventId && session.payment_status === 'paid') {
        console.log('✅ Found checkout session for payment intent, processing booking as fallback...');
        console.log('📋 Session metadata:', session.metadata);
        
        // Process the booking using the same function
        const result = await processCheckoutSession(session, true);
        if (result.success) {
          console.log('✅ [FALLBACK] Booking processed successfully from payment_intent.succeeded event');
        } else {
          console.log('⚠️ [FALLBACK] Processing returned:', result.message);
        }
      } else {
        console.log('⚠️ No valid checkout session found for this payment intent');
      }
    } catch (error) {
      console.error('❌ Error processing payment_intent.succeeded:', error);
    }
  }

  console.log('✅ Webhook processed successfully');
  return NextResponse.json({ 
    received: true, 
    eventType: event.type,
    timestamp: new Date().toISOString()
  });
  } catch (error) {
    console.error('❌ Webhook endpoint error:', error);
    return NextResponse.json({ 
      error: 'Internal webhook error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
