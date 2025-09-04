import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

export async function POST(req) {
  try {
    const { eventId } = await req.json();
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    await connectDB();
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Build absolute URLs for redirects
    const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
              success_url: `${origin}/events/${event._id}?success=true`,
        cancel_url: `${origin}/events/${event._id}?canceled=true`,
      payment_method_types: ['card'],
      customer_email: 'test@example.com',
      payment_method_configuration: 'pmc_1Q1LozRr8s6DbC7qUqs8HGlx',
      line_items: [
        {
          price_data: {
            currency: 'aed',
            unit_amount: Math.max(0, Math.round((event.price || 0) * 100)),
            product_data: {
              name: event.title,
              images: event.coverImage ? [event.coverImage] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: String(event._id),
        guardianName: 'Test Guardian',
        childName: 'Test Child',
        email: 'test@example.com',
        phone: '+1234567890',
        numberOfTickets: '1'
      },
    });

    return NextResponse.json({ 
      success: true,
      sessionId: session.id, 
      url: session.url,
      message: 'Test checkout session created. Complete the payment to test webhook.'
    });

  } catch (error) {
    console.error('Test payment error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
