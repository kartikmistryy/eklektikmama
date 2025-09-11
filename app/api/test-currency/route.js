import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a test checkout session to verify currency settings
    const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${origin}/events?test=success`,
      cancel_url: `${origin}/events?test=canceled`,
      currency: 'aed',
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      customer_email: 'test@example.com',
      
      // Force AED for all payment methods
      payment_method_options: {
        apple_pay: {
          currency: 'aed'
        },
        google_pay: {
          currency: 'aed'
        }
      },
      
      line_items: [
        {
          price_data: {
            currency: 'aed',
            unit_amount: 10000, // 100 AED
            product_data: {
              name: 'Test Event - AED Currency Test',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        test: 'currency_verification'
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Currency test session created',
      sessionId: session.id,
      url: session.url,
      currency: session.currency,
      payment_method_types: session.payment_method_types,
      payment_method_options: session.payment_method_options,
      line_items: session.line_items
    });

  } catch (error) {
    console.error('Currency test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  }
}
