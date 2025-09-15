import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { sendCancellationVerificationEmail } from '../../../../lib/memberEmails';
import crypto from 'crypto';

// Store verification tokens temporarily (in production, use Redis or database)
const verificationTokens = new Map();

export async function POST(req) {
  try {
    await connectDB();
    
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the membership
    const membership = await Membership.findOne({
      email: email.toLowerCase(),
      status: { $in: ['active', 'past_due'] }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No active membership found for this email address' },
        { status: 404 }
      );
    }

    // Check if already cancelled
    if (membership.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Membership is already scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Generate secure verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token with membership info
    verificationTokens.set(token, {
      email: membership.email,
      membershipId: membership._id,
      expiresAt
    });

    // Send verification email
    try {
      await sendCancellationVerificationEmail({
        firstName: membership.firstName,
        email: membership.email,
        membershipType: membership.membershipType,
        currentPeriodEnd: membership.currentPeriodEnd,
        verificationToken: token
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      verificationTokens.delete(token); // Clean up token if email fails
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A verification email has been sent to your email address. Please check your inbox and click the link to confirm cancellation.'
    });

  } catch (error) {
    console.error('Cancellation request error:', error);
    return NextResponse.json(
      { error: 'Failed to process cancellation request' },
      { status: 500 }
    );
  }
}

// Clean up expired tokens periodically
setInterval(() => {
  const now = new Date();
  for (const [token, data] of verificationTokens.entries()) {
    if (data.expiresAt < now) {
      verificationTokens.delete(token);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export { verificationTokens };
