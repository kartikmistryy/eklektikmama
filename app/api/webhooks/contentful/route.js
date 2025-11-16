import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Force dynamic rendering - disable caching for webhook endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Verify Contentful webhook signature
function verifyContentfulWebhook(body, signature, secret) {
  if (!secret) {
    console.warn('⚠️ Contentful webhook secret not configured - skipping verification');
    return true; // Allow in development if secret is not set
  }

  // Contentful uses HMAC SHA-256 for webhook signatures
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const calculatedSignature = hmac.digest('base64');

  return calculatedSignature === signature;
}

export async function POST(req) {
  try {
    console.log('🔔 Contentful webhook received');

    const body = await req.text();
    const signature = req.headers.get('x-contentful-signature');
    const webhookSecret = process.env.CONTENTFUL_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && !verifyContentfulWebhook(body, signature, webhookSecret)) {
      console.error('❌ Contentful webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    let event;
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error('❌ Failed to parse webhook body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    console.log('📋 Contentful webhook event:', {
      sys: event.sys,
      contentType: event.sys?.contentType?.sys?.id,
    });

    // Check if this is a blog post update
    const contentType = event.sys?.contentType?.sys?.id;
    const isBlogPost = contentType === 'blogs';

    if (!isBlogPost) {
      console.log('ℹ️ Not a blog post update, skipping revalidation');
      return NextResponse.json({ 
        received: true, 
        message: 'Not a blog post, skipping revalidation' 
      });
    }

    // Get the slug from the entry
    const slug = event.fields?.slug?.['en-US'] || event.fields?.slug;
    
    console.log('🔄 Revalidating blog pages...');
    
    // Revalidate the blog listing page
    revalidatePath('/blogs');
    console.log('✅ Revalidated /blogs');

    // Revalidate the specific blog post if we have a slug
    if (slug) {
      revalidatePath(`/blogs/${slug}`);
      console.log(`✅ Revalidated /blogs/${slug}`);
    } else {
      // If no slug, revalidate all blog posts (less efficient but ensures updates)
      console.log('⚠️ No slug found, revalidating all blog paths');
      revalidatePath('/blogs', 'page');
    }

    // Also revalidate the home page if it shows blog posts
    revalidatePath('/');
    console.log('✅ Revalidated home page');

    return NextResponse.json({ 
      received: true,
      revalidated: true,
      slug: slug || 'all',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Contentful webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Contentful webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

