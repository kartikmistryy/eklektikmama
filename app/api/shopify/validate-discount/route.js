import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import DiscountCode from '@/models/DiscountCode';

export async function POST(req) {
  try {
    await connectDB();
    
    const { discount_code, customer_email } = await req.json();
    
    if (!discount_code || !customer_email) {
      return NextResponse.json({
        valid: false,
        message: 'Discount code and customer email are required'
      });
    }

    // Validate the discount code
    const validation = await DiscountCode.validateCode(discount_code, customer_email);
    
    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        message: validation.message,
        error: 'INVALID_DISCOUNT_CODE'
      });
    }

    // Mark the discount code as used
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    await validation.discountCode.markAsUsed(customer_email, ipAddress);

    return NextResponse.json({
      valid: true,
      discount_percentage: validation.discountPercentage,
      message: 'Valid member discount code',
      membership: {
        firstName: validation.discountCode.memberId.firstName,
        membershipType: validation.discountCode.memberId.membershipType
      }
    });

  } catch (error) {
    console.error('Shopify discount validation error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Failed to validate discount code',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

