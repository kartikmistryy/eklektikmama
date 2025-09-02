import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.json();
    const { name, email, website, partnershipType, otherDetails, isBrand, interestedInFranchise } = formData;

    // Validate required fields
    if (!name || !email || !website || !partnershipType || !isBrand || !interestedInFranchise) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Validate website
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Valid website URL is required (must start with http:// or https://)' },
        { status: 400 }
      );
    }

    // Validate otherDetails if partnershipType is "Other"
    if (partnershipType === "Other (Please specify)" && !otherDetails?.trim()) {
      return NextResponse.json(
        { error: 'Please specify your partnership type' },
        { status: 400 }
      );
    }

    // Mailchimp API configuration
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_AUDIENCE_ID) {
      return NextResponse.json(
        { error: 'Perks form service not configured' },
        { status: 500 }
      );
    }

    // Generate MD5 hash for email (required by Mailchimp)
    const crypto = await import('crypto');
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    const MAILCHIMP_API_URL = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

    // Check if subscriber already exists
    let subscriberExists = false;
    try {
      const checkResponse = await fetch(
        `${MAILCHIMP_API_URL}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (checkResponse.ok) {
        subscriberExists = true;
      }
    } catch (error) {
      // Subscriber doesn't exist, will create new one
      console.log('Subscriber not found, will create new one');
    }

    // Prepare merge fields with form data
    const mergeFields = {
      FNAME: name.split(' ')[0] || name,
      LNAME: name.split(' ').slice(1).join(' ') || '',
      WEBSITE: website,
      PARTNERSHIP_TYPE: partnershipType,
      OTHER_DETAILS: otherDetails || '',
      IS_BRAND: isBrand,
      INTERESTED_IN_FRANCHISE: interestedInFranchise,
      PERKS_FORM_DATE: new Date().toISOString().split('T')[0],
    };

    // Prepare tags
    const tags = [
      'Perks Form Submission',
      `Partnership Type: ${partnershipType}`,
      `Brand: ${isBrand}`,
      `Franchise Interest: ${interestedInFranchise}`,
      'Perks Page'
    ];

    if (partnershipType === "Other (Please specify)") {
      tags.push('Custom Partnership Type');
    }

    if (subscriberExists) {
      // Update existing subscriber
      const updateResponse = await fetch(
        `${MAILCHIMP_API_URL}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'subscribed',
            merge_fields: mergeFields,
            tags: tags,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.detail || 'Failed to update subscriber');
      }

      return NextResponse.json({
        success: true,
        message: 'Perks form submitted successfully! We\'ll be in touch soon.',
        status: 'updated'
      });
    } else {
      // Add new subscriber
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
            merge_fields: mergeFields,
            tags: tags,
          }),
        }
      );

      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        console.error('Mailchimp API Error:', errorData);
        
        if (errorData.title === 'Member Exists') {
          // Handle race condition where subscriber was added by another process
          return NextResponse.json({
            success: true,
            message: 'Perks form submitted successfully! We\'ll be in touch soon.',
            status: 'already_subscribed'
          });
        }
        
        throw new Error(errorData.detail || 'Failed to subscribe');
      }

      const result = await addResponse.json();
      console.log('Perks form submission successful:', result.email_address);

      return NextResponse.json({
        success: true,
        message: 'Perks form submitted successfully! We\'ll be in touch soon.',
        status: 'subscribed'
      });
    }

  } catch (error) {
    console.error('Perks form submission error:', error);
    return NextResponse.json(
      { error: `Failed to submit perks form: ${error.message}` },
      { status: 500 }
    );
  }
}
