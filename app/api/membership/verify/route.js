import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Membership from '@/models/Membership';

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

    // Find the active membership by email
    const membership = await Membership.findOne({ 
      email: email.toLowerCase().trim(),
      status: { $in: ['active', 'past_due'] }
    }).sort({ createdAt: -1 });

    console.log('🔍 Membership verify lookup:', {
      email: email.toLowerCase().trim(),
      found: !!membership,
      membershipType: membership?.membershipType,
      status: membership?.status,
      createdAt: membership?.createdAt
    });

    if (!membership) {
      return NextResponse.json({
        isMember: false,
        message: 'No membership found for this email address'
      });
    }

    // Check if membership is active
    const now = new Date();
    const isActive = membership.status === 'active' && 
                   (!membership.currentPeriodEnd || new Date(membership.currentPeriodEnd) > now);

    // Check if membership expires soon (within 7 days)
    const expiresSoon = membership.currentPeriodEnd && 
                       new Date(membership.currentPeriodEnd) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      isMember: isActive,
      membership: {
        email: membership.email,
        firstName: membership.firstName,
        lastName: membership.lastName,
        membershipType: membership.membershipType,
        status: membership.status,
        currentPeriodStart: membership.currentPeriodStart,
        currentPeriodEnd: membership.currentPeriodEnd,
        cancelAtPeriodEnd: membership.cancelAtPeriodEnd || false,
        expiresSoon: expiresSoon,
        totalSavings: membership.totalSavings || 0,
        createdAt: membership.createdAt
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