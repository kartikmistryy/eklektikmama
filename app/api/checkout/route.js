import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const { eventId, guardianName, childName, email, phone, numberOfTickets, eventSegment, ...otherFormData } = body;
    
    // Validate required fields
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!numberOfTickets || numberOfTickets < 1 || numberOfTickets > 15) {
      return NextResponse.json({ error: 'Number of tickets must be between 1 and 15' }, { status: 400 });
    }

    await connectDB();
    
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Validate event price
    if (!event.price || event.price <= 0) {
      return NextResponse.json({ error: 'Event price is invalid' }, { status: 400 });
    }

    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Build absolute URLs for redirects
    const hdrs = headers();
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host');
    const protocol = (hdrs.get('x-forwarded-proto') || 'http') + '://';
    const origin = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}${host}` : 'http://localhost:3000');
    
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
    
    const sessionData = {
      mode: 'payment',
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${event._id}?canceled=true`,
      customer_email: email,
      line_items: lineItems,
      // Remove payment_method_types
      // payment_method_types: ['card'],
    
      // Use your PMC config instead
      payment_method_configuration: 'pmc_1Q1LozRr8s6DbC7qUqs8HGlx',
    
      metadata: {
        eventId: String(event._id),
        eventSegment: eventSegment || '',
        guardianName: guardianName || '',
        childName: childName || '',
        email: email || '',
        phone: phone || '',
        numberOfTickets: String(numberOfTickets || 1),
        choiceI: (otherFormData.choiceI || '').substring(0, 100),
        choiceII: (otherFormData.choiceII || '').substring(0, 100),
        choiceIII: (otherFormData.choiceIII || '').substring(0, 100),
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
        favoriteFoods: (otherFormData.favoriteFoods || '').substring(0, 100),
        photographyConsent: otherFormData.photographyConsent ? 'Yes' : 'No',
      },
    };
    
    const session = await stripe.checkout.sessions.create(sessionData);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}




