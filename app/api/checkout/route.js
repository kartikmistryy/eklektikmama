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
    await connectDB();
    const event = await Event.findById(eventId);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Build absolute URLs for redirects
    const hdrs = headers();
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host');
    const protocol = (hdrs.get('x-forwarded-proto') || 'http') + '://';
    const origin = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}${host}` : 'http://localhost:3000');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${event._id}?canceled=true`,
      payment_method_types: ['card'],
      customer_email: email,
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
          quantity: parseInt(numberOfTickets) || 1,
        },
      ],
      metadata: {
        eventId: String(event._id),
        eventSegment: eventSegment || '',
        guardianName: guardianName || '',
        childName: childName || '',
        email: email || '',
        phone: phone || '',
        numberOfTickets: String(numberOfTickets || 1),
        // Store additional form data as JSON string
        additionalData: JSON.stringify(otherFormData)
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}




