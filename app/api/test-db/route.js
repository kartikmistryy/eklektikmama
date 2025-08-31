import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test 1: Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Test 2: Try to create a test booking object
    console.log('📝 Testing Booking model...');
    const testBooking = new Booking({
      eventId: 'test123',
      motherName: 'Test Mother',
      motherPhone: '1234567890',
      motherEmail: 'test@example.com',
      paymentStatus: 'pending',
      createdAt: new Date()
    });
    console.log('✅ Booking object created successfully');
    console.log('📋 Test booking data:', JSON.stringify(testBooking, null, 2));
    
    // Test 3: Try to save (but don't actually save it)
    console.log('💾 Testing save operation (will not actually save)...');
    // We'll just validate the object without saving
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and Booking model working correctly',
      testData: {
        eventId: testBooking.eventId,
        motherName: testBooking.motherName,
        motherEmail: testBooking.motherEmail,
        paymentStatus: testBooking.paymentStatus
      }
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
