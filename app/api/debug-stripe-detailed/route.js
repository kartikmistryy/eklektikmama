import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    // Basic environment check
    const envStatus = {
      STRIPE_SECRET_KEY: {
        exists: !!stripeSecretKey,
        length: stripeSecretKey?.length || 0,
        prefix: stripeSecretKey?.substring(0, 7) || 'N/A',
        isLive: stripeSecretKey?.startsWith('sk_live_') || false,
        isTest: stripeSecretKey?.startsWith('sk_test_') || false
      },
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
        exists: !!stripePublishableKey,
        length: stripePublishableKey?.length || 0,
        prefix: stripePublishableKey?.substring(0, 7) || 'N/A',
        isLive: stripePublishableKey?.startsWith('pk_live_') || false,
        isTest: stripePublishableKey?.startsWith('pk_test_') || false
      }
    };

    if (!stripeSecretKey) {
      return NextResponse.json({
        error: 'Stripe secret key not configured',
        envStatus,
        status: 'missing_secret_key'
      }, { status: 400 });
    }

    // Test different Stripe endpoints
    const stripe = new Stripe(stripeSecretKey, {
      timeout: 30000, // 30 second timeout
      maxNetworkRetries: 3
    });

    const tests = [];

    // Test 1: Basic connection
    try {
      console.log('Testing basic Stripe connection...');
      const account = await stripe.accounts.retrieve();
      tests.push({
        test: 'Account Retrieval',
        success: true,
        result: {
          id: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          country: account.country
        }
      });
    } catch (error) {
      tests.push({
        test: 'Account Retrieval',
        success: false,
        error: error.message,
        code: error.code,
        type: error.type
      });
    }

    // Test 2: Simple API call
    try {
      console.log('Testing simple API call...');
      const balance = await stripe.balance.retrieve();
      tests.push({
        test: 'Balance Retrieval',
        success: true,
        result: { available: balance.available.length, pending: balance.pending.length }
      });
    } catch (error) {
      tests.push({
        test: 'Balance Retrieval',
        success: false,
        error: error.message,
        code: error.code,
        type: error.type
      });
    }

    // Test 3: Check if we can create a simple object
    try {
      console.log('Testing object creation...');
      const customer = await stripe.customers.create({
        email: 'test@example.com',
        description: 'Test customer for connection test'
      });
      tests.push({
        test: 'Customer Creation',
        success: true,
        result: { id: customer.id, email: customer.email }
      });
      
      // Clean up test customer
      await stripe.customers.del(customer.id);
    } catch (error) {
      tests.push({
        test: 'Customer Creation',
        success: false,
        error: error.message,
        code: error.code,
        type: error.type
      });
    }

    // Test 4: Network connectivity test
    try {
      console.log('Testing network connectivity...');
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Stripe-Version': '2023-10-16'
        }
      });
      
      tests.push({
        test: 'Direct HTTP to Stripe',
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      });
    } catch (error) {
      tests.push({
        test: 'Direct HTTP to Stripe',
        success: false,
        error: error.message
      });
    }

    const successfulTests = tests.filter(t => t.success).length;
    const totalTests = tests.length;

    return NextResponse.json({
      success: successfulTests > 0,
      message: `${successfulTests}/${totalTests} tests passed`,
      envStatus,
      tests,
      summary: {
        total: totalTests,
        passed: successfulTests,
        failed: totalTests - successfulTests,
        successRate: `${Math.round((successfulTests / totalTests) * 100)}%`
      },
      recommendations: successfulTests === 0 ? [
        'Check if your Stripe account is active and not restricted',
        'Verify the API key has the correct permissions',
        'Check if there are IP restrictions on your Stripe account',
        'Ensure your Stripe account is not in test mode if using live keys',
        'Contact Stripe support if the issue persists'
      ] : successfulTests < totalTests ? [
        'Some Stripe operations are working, but there may be permission issues',
        'Check the specific error codes for failed operations'
      ] : [
        'All Stripe operations are working correctly'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error during detailed Stripe testing',
      details: error.message,
      stack: error.stack,
      status: 'general_error'
    }, { status: 500 });
  }
}
