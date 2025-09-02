import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not Set',
      STRIPE_SECRET_KEY_LENGTH: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
      STRIPE_SECRET_KEY_PREFIX: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'N/A',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not Set',
      NODE_ENV: process.env.NODE_ENV || 'Not Set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'Not Set',
      VERCEL_URL: process.env.VERCEL_URL || 'Not Set'
    };

    return NextResponse.json({
      success: true,
      message: 'Checkout debug info',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
