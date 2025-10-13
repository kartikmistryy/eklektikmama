import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import DiscountCode from '@/models/DiscountCode';

export async function POST(req) {
  try {
    await connectDB();
    
    const { discountCode, email } = await req.json();
    
    if (!discountCode || !email) {
      return NextResponse.json({
        valid: false,
        message: 'Discount code and email are required'
      });
    }

    // For MEMBER10 universal code, validate membership instead of specific discount code
    if (discountCode === 'MEMBER10') {
      // Check if user has an active membership
      const Membership = (await import('@/models/Membership')).default;
      const membership = await Membership.findOne({ 
        email: email.toLowerCase().trim(),
        status: { $in: ['active', 'past_due'] }
      }).sort({ createdAt: -1 });

      if (!membership) {
        return NextResponse.json({
          valid: false,
          message: 'No active membership found'
        });
      }

      // Check if membership is active
      const now = new Date();
      const isActive = membership.status === 'active' && 
                     (!membership.currentPeriodEnd || new Date(membership.currentPeriodEnd) > now);

      if (!isActive) {
        return NextResponse.json({
          valid: false,
          message: 'Membership is not active'
        });
      }

      return NextResponse.json({
        valid: true,
        discountPercentage: 10,
        message: 'Valid member discount code',
        membership: {
          firstName: membership.firstName,
          membershipType: membership.membershipType
        }
      });
    }

    // For other discount codes, use the original validation
    const validation = await DiscountCode.validateCode(discountCode, email);
    
    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        message: validation.message
      });
    }

    // Mark the discount code as used to prevent reuse
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    await validation.discountCode.markAsUsed(email, ipAddress);

    return NextResponse.json({
      valid: true,
      discountPercentage: validation.discountPercentage,
      message: 'Valid member discount code',
      membership: {
        firstName: validation.discountCode.memberId.firstName,
        membershipType: validation.discountCode.memberId.membershipType
      }
    });

  } catch (error) {
    console.error('Discount code validation error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Failed to validate discount code' 
      },
      { status: 500 }
    );
  }
}
