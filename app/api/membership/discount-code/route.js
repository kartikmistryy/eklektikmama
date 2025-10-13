import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Membership from '@/models/Membership';
import DiscountCode from '@/models/DiscountCode';

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

    if (!membership) {
      return NextResponse.json({
        hasDiscount: false,
        message: 'No active membership found'
      });
    }

    // Check if membership is active
    const now = new Date();
    const isActive = membership.status === 'active' && 
                   (!membership.currentPeriodEnd || new Date(membership.currentPeriodEnd) > now);

    if (!isActive) {
      return NextResponse.json({
        hasDiscount: false,
        message: 'Membership is not active'
      });
    }

    // Use a universal member discount code that you'll create in Shopify admin
    const universalMemberCode = 'MEMBER10'; // This needs to be created in Shopify admin
    
    // Check if we already have a recent unused discount code for this member
    let discountUsage = await DiscountCode.findOne({
      code: universalMemberCode,
      memberEmail: email.toLowerCase().trim(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    // If no recent code exists, create a new one
    if (!discountUsage) {
      try {
        console.log('🔄 Creating new discount code for member:', email);
        discountUsage = new DiscountCode({
          code: universalMemberCode,
          memberId: membership._id,
          memberEmail: email.toLowerCase().trim(),
          discountPercentage: 10,
          isUsed: false,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          userAgent: req.headers.get('user-agent')
        });
        
        await discountUsage.save();
        console.log('✅ Discount code created successfully');
      } catch (error) {
        console.error('❌ Error creating discount code:', error);
        // If there's a duplicate key error, just use the existing code
        if (error.code === 11000) {
          console.log('🔄 Duplicate key error, finding existing code...');
          discountUsage = await DiscountCode.findOne({
            code: universalMemberCode,
            memberEmail: email.toLowerCase().trim()
          });
          console.log('📊 Found existing discount code:', discountUsage ? 'Yes' : 'No');
        } else {
          console.error('❌ Failed to create discount code:', error.message);
          // Continue without discountUsage - we'll use a fallback
          discountUsage = null;
        }
      }
    }
    
    return NextResponse.json({
      hasDiscount: true,
      discountCode: universalMemberCode,
      discountPercentage: 10,
      expiresAt: discountUsage?.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
      message: 'Member discount code ready',
      membership: {
        firstName: membership.firstName,
        membershipType: membership.membershipType
      }
    });

  } catch (error) {
    console.error('❌ Discount code generation error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: 'Failed to generate discount code',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
}
