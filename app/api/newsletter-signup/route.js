import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Mailchimp API configuration
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_AUDIENCE_ID) {
      return NextResponse.json(
        { error: 'Newsletter service not configured' },
        { status: 500 }
      );
    }

    // Generate MD5 hash for email (required by Mailchimp)
    const crypto = await import('crypto');
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    const MAILCHIMP_API_URL = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

    // Add new subscriber
    console.log('Attempting to add subscriber:', email);
    console.log('API URL:', `${MAILCHIMP_API_URL}/lists/${MAILCHIMP_AUDIENCE_ID}/members`);
    
    const addResponse = await fetch(
      `${MAILCHIMP_API_URL}/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: name || email.split('@')[0], // Use provided name or part before @ as first name
          },
          tags: ['Newsletter Signup', 'Popup Form'],
        }),
      }
    );

    console.log('Mailchimp response status:', addResponse.status);
    console.log('Mailchimp response headers:', Object.fromEntries(addResponse.headers.entries()));

    if (!addResponse.ok) {
      const errorData = await addResponse.json();
      console.error('Mailchimp API Error:', errorData);
      
      if (errorData.title === 'Member Exists') {
        return NextResponse.json({
          success: true,
          message: 'You\'re already subscribed to our newsletter!',
          status: 'already_subscribed'
        });
      }
      
      throw new Error(errorData.detail || `HTTP ${addResponse.status}: ${addResponse.statusText}`);
    }

    const result = await addResponse.json();
    console.log('Newsletter signup successful:', result.email_address);

    return NextResponse.json({
      success: true,
      message: 'Welcome to the Eklektik Mama newsletter! Check your email for confirmation.',
      status: 'subscribed'
    });

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: `Failed to subscribe to newsletter: ${error.message}` },
      { status: 500 }
    );
  }
}
