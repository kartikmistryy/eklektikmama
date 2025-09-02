import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    // Check environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!stripeSecretKey) {
      return NextResponse.json({
        error: 'Stripe secret key not configured',
        status: 'missing_secret_key'
      }, { status: 400 });
    }

    if (!stripePublishableKey) {
      return NextResponse.json({
        error: 'Stripe publishable key not configured',
        status: 'missing_publishable_key'
      }, { status: 400 });
    }

    // Test Stripe connection
    const stripe = new Stripe(stripeSecretKey);
    
    try {
      // Try to retrieve account information to test the key
      const account = await stripe.accounts.retrieve();
      
      return NextResponse.json({
        success: true,
        message: 'Stripe configuration is working!',
        account: {
          id: account.id,
          business_type: account.business_type,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          country: account.country
        },
        keys: {
          secret_key_length: stripeSecretKey.length,
          secret_key_prefix: stripeSecretKey.substring(0, 7),
          publishable_key_length: stripePublishableKey.length,
          publishable_key_prefix: stripePublishableKey.substring(0, 7)
        }
      });
    } catch (stripeError) {
      return NextResponse.json({
        error: 'Stripe API connection failed',
        stripe_error: stripeError.message,
        status: 'stripe_connection_failed'
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Error testing Stripe configuration',
      details: error.message,
      status: 'general_error'
    }, { status: 500 });
  }
}
