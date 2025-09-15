import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { sendCancellationCodeEmail } from '../../../../lib/memberEmails';

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

    // Generate 6-digit code
    const cancellationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the code in the membership record
    membership.cancellationCode = cancellationCode;
    membership.cancellationCodeExpires = expiresAt;
    await membership.save();

    // Send code via email
    try {
      await sendCancellationCodeEmail({
        firstName: membership.firstName,
        email: membership.email,
        membershipType: membership.membershipType,
        currentPeriodEnd: membership.currentPeriodEnd,
        cancellationCode: cancellationCode
      });
    } catch (emailError) {
      console.error('Error sending cancellation code email:', emailError);
      // Clear the code if email fails
      membership.cancellationCode = null;
      membership.cancellationCodeExpires = null;
      await membership.save();
      
      return NextResponse.json(
        { error: 'Failed to send cancellation code email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A 6-digit cancellation code has been sent to your email address. Please enter it below to confirm cancellation.',
      expiresIn: 10 // minutes
    });

  } catch (error) {
    console.error('Cancellation code request error:', error);
    return NextResponse.json(
      { error: 'Failed to process cancellation code request' },
      { status: 500 }
    );
  }
}
