import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Membership from '@/models/Membership';

export async function GET() {
  try {
    console.log('🔄 Testing membership database connection...');
    
    // Test database connection
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Test membership model
    const membershipCount = await Membership.countDocuments();
    console.log('📊 Total memberships in database:', membershipCount);
    
    // Test finding a sample membership
    const sampleMembership = await Membership.findOne({}).limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'Membership database connection successful',
      data: {
        totalMemberships: membershipCount,
        sampleMembership: sampleMembership ? {
          email: sampleMembership.email,
          status: sampleMembership.status,
          membershipType: sampleMembership.membershipType,
          createdAt: sampleMembership.createdAt
        } : null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Membership database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.name,
      details: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
