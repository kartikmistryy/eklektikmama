import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, guardianName, childName, numberOfTickets, transactionId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Test data
    const bookingData = {
      userEmail: email,
      guardianName: guardianName || 'Test User',
      childName: childName || 'Test Child',
      numberOfTickets: numberOfTickets || 1,
      transactionId: transactionId || 'TEST-' + Date.now(),
    };

    const eventData = {
      title: 'Test Event - Cinema Morning',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Test Location, Dubai',
      description: 'This is a test event to verify email functionality.',
      price: 150
    };

    console.log('Testing email functionality...');
    const result = await sendBookingConfirmationEmail(bookingData, eventData);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        campaignId: result.campaignId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test email endpoint. Use POST with email, guardianName, childName, numberOfTickets, transactionId' 
  });
}
