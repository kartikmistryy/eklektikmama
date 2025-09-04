import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

export async function POST(req) {
  try {
    console.log('Checkout request received');
    
    const contentType = req.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    console.log('Request body:', body);

    const { eventId, guardianName, childName, email, phone, numberOfTickets, eventSegment, ...otherFormData } = body;
    
    // Debug logging for form data
    console.log('=== FORM DATA DEBUG ===');
    console.log('Event segment:', eventSegment);
    console.log('Other form data:', otherFormData);
    console.log('Choice I:', otherFormData.choiceI);
    console.log('Choice II:', otherFormData.choiceII);
    console.log('Choice III:', otherFormData.choiceIII);
    
    // Validate required fields
    if (!eventId) {
      console.error('Missing eventId');
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!email) {
      console.error('Missing email');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!numberOfTickets || numberOfTickets < 1) {
      console.error('Invalid number of tickets');
      return NextResponse.json({ error: 'Valid number of tickets is required' }, { status: 400 });
    }

    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Finding event with ID:', eventId);
    const event = await Event.findById(eventId);
    if (!event) {
      console.error('Event not found:', eventId);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    console.log('Event found:', { title: event.title, price: event.price });

    // Validate event price
    if (!event.price || event.price <= 0) {
      console.error('Invalid event price:', event.price);
      return NextResponse.json({ error: 'Event price is invalid' }, { status: 400 });
    }

    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    
    console.log('Stripe secret key exists, length:', process.env.STRIPE_SECRET_KEY.length);
    console.log('Stripe secret key starts with:', process.env.STRIPE_SECRET_KEY.substring(0, 7));
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Build absolute URLs for redirects
    const hdrs = headers();
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host');
    const protocol = (hdrs.get('x-forwarded-proto') || 'http') + '://';
    const origin = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}${host}` : 'http://localhost:3000');
    
    console.log('Origin URL:', origin);

    const lineItems = [
      {
        price_data: {
          currency: 'aed',
          unit_amount: Math.max(0, Math.round((event.price || 0) * 100)),
          product_data: {
            name: event.title,
            images: event.coverImage ? [event.coverImage] : undefined,
          },
        },
        quantity: parseInt(numberOfTickets) || 1,
      },
    ];
    
    console.log('Line items:', lineItems);

    const sessionData = {
      mode: 'payment',
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${event._id}?canceled=true`,
      payment_method_types: ['card'],
      customer_email: email,
      line_items: lineItems,
      configuration_id: 'pmc_1Q1LozRr8s6DbC7qUqs8HGlx',
      metadata: {
        eventId: String(event._id),
        eventSegment: eventSegment || '',
        guardianName: guardianName || '',
        childName: childName || '',
        email: email || '',
        phone: phone || '',
        numberOfTickets: String(numberOfTickets || 1),
        // Store essential choices directly in metadata
        choiceI: (otherFormData.choiceI || '').substring(0, 100),
        choiceII: (otherFormData.choiceII || '').substring(0, 100),
        choiceIII: (otherFormData.choiceIII || '').substring(0, 100),
        // Store critical form data (truncated to avoid Stripe limits)
        emergencyName: (otherFormData.emergencyName || '').substring(0, 100),
        emergencyPhone: (otherFormData.emergencyPhone || '').substring(0, 100),
        childDob: otherFormData.childDob || '',
        childAge: otherFormData.childAge || '',
        allergies: Array.isArray(otherFormData.allergies) ? otherFormData.allergies.join(',').substring(0, 100) : '',
        notes: (otherFormData.notes || '').substring(0, 100),
        pregnant: otherFormData.pregnant || '',
        postpartum: otherFormData.postpartum || '',
        postpartumDuration: otherFormData.postpartumDuration || '',
        medicalConditions: (otherFormData.medicalConditions || '').substring(0, 100),
        conditionDetails: (otherFormData.conditionDetails || '').substring(0, 100),
        cookingExperience: otherFormData.cookingExperience || '',
        foodAllergies: (otherFormData.foodAllergies || '').substring(0, 100),
        favoriteFoods: (otherFormData.favoriteFoods || '').substring(0, 100)
      },
    };
    
    console.log('Creating Stripe session with data:', sessionData);
    console.log('Metadata size check:', {
      totalKeys: Object.keys(sessionData.metadata).length,
      metadataSize: JSON.stringify(sessionData.metadata).length
    });

    const session = await stripe.checkout.sessions.create(sessionData);
    
    console.log('Stripe session created successfully:', session.id);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}




