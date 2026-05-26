import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Server-side freebie registry — clients send the freebieId only;
// the filename + title are looked up here so the API can't be coerced
// into serving arbitrary files from /public.
const FREEBIES = {
  ramadanGuide: { file: '/ramadanGuide.pdf', title: 'Ramadan Guide' },
  visitUae: { file: '/visitUae.pdf', title: 'Places to Visit in Abu Dhabi, UAE' },
  hospitalGuide: { file: '/hospitalGuide.pdf', title: 'Hospital Guide' },
};

const splitName = (fullName) => {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return { first: '', last: '' };
  const parts = trimmed.split(/\s+/);
  return { first: parts[0], last: parts.slice(1).join(' ') };
};

export async function POST(request) {
  try {
    const { email, fullName, freebieId } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const freebie = FREEBIES[freebieId];
    if (!freebie) {
      return NextResponse.json({ error: 'Unknown freebie' }, { status: 400 });
    }

    const { MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX, MAILCHIMP_AUDIENCE_ID } = process.env;
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_AUDIENCE_ID) {
      console.error('Mailchimp not configured for freebie download');
      return NextResponse.json({ error: 'Subscription service unavailable' }, { status: 500 });
    }

    const { first, last } = splitName(fullName);
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    const baseUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;
    const freebieTag = `Freebie: ${freebie.title}`;

    // Upsert subscriber via PUT — handles both new subscribers and existing ones
    // (existing ones with status 'unsubscribed' won't be re-subscribed silently,
    // which matches Mailchimp compliance behavior).
    const upsertResponse = await fetch(
      `${baseUrl}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status_if_new: 'subscribed',
          merge_fields: { FNAME: first, LNAME: last },
        }),
      }
    );

    if (!upsertResponse.ok) {
      const errorData = await upsertResponse.json().catch(() => ({}));
      console.error('Mailchimp upsert error:', errorData);
      return NextResponse.json(
        { error: 'Could not save your details. Please try again.' },
        { status: 502 }
      );
    }

    // Tag the subscriber so the marketer can segment by which freebie was downloaded.
    // Tag failures are non-fatal — subscriber is already saved.
    try {
      await fetch(`${baseUrl}/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}/tags`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: [
            { name: 'Freebie Download', status: 'active' },
            { name: freebieTag, status: 'active' },
          ],
        }),
      });
    } catch (tagError) {
      console.error('Mailchimp tag error (non-fatal):', tagError);
    }

    return NextResponse.json({
      success: true,
      downloadUrl: freebie.file,
      freebieTitle: freebie.title,
    });
  } catch (error) {
    console.error('Freebie download error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
