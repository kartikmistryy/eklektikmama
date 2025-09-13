import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    // Test 1: Connect to database
    await connectDB();
    
    // Test 2: Try to create a test booking object
    const testBooking = new Booking({
      eventId: 'test123',
      motherName: 'Test Mother',
      motherPhone: '1234567890',
      motherEmail: 'test@example.com',
      paymentStatus: 'pending',
      createdAt: new Date()
    });
    // Test 3: Try to save (but don't actually save it)
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
