import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';

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

    // Find active membership
    const membership = await Membership.findOne({
      email: email.toLowerCase(),
      status: { $in: ['active', 'past_due'] }
    });

    if (!membership) {
      return NextResponse.json({
        isMember: false,
        membership: null
      });
    }

    // Check if membership is still active (not expired)
    const isActive = membership.isActive();
    
    if (!isActive) {
      // Update status to expired if needed
      if (membership.status !== 'expired') {
        membership.status = 'expired';
        await membership.save();
      }
      
      return NextResponse.json({
        isMember: false,
        membership: null
      });
    }

    return NextResponse.json({
      isMember: true,
      membership: {
        email: membership.email,
        firstName: membership.firstName,
        lastName: membership.lastName,
        membershipType: membership.membershipType,
        status: membership.status,
        currentPeriodEnd: membership.currentPeriodEnd,
        discountPercentage: membership.discountPercentage,
        totalSavings: membership.totalSavings,
        expiresSoon: membership.expiresSoon()
      }
    });

  } catch (error) {
    console.error('Membership verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify membership' },
      { status: 500 }
    );
  }
}

// GET method for simple verification
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const membership = await Membership.findOne({
      email: email.toLowerCase(),
      status: { $in: ['active', 'past_due'] }
    });

    const isActive = membership ? membership.isActive() : false;

    return NextResponse.json({
      isMember: isActive,
      discountPercentage: isActive ? membership.discountPercentage : 0
    });

  } catch (error) {
    console.error('Membership verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify membership' },
      { status: 500 }
    );
  }
}
