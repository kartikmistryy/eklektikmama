import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, guardianName, childName, numberOfTickets, transactionId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Test data with ticket numbers
    const bookingData = {
      userEmail: email,
      guardianName: guardianName || 'Test User',
      childName: childName || 'Test Child',
      numberOfTickets: numberOfTickets || 2,
      transactionId: transactionId || 'TEST-' + Date.now(),
      ticketNumbers: [1, 2] // Test with multiple tickets
    };

    const eventData = {
      title: 'Test Event - QR Code Demo',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Test Location, Dubai',
      description: 'This is a test event to verify QR code functionality in emails.',
      price: 150
    };

    console.log('Testing QR code email functionality...');
    const result = await sendBookingConfirmationEmail(bookingData, eventData);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email with QR code sent successfully',
        messageId: result.messageId,
        bookingData: {
          transactionId: bookingData.transactionId,
          ticketNumbers: bookingData.ticketNumbers,
          numberOfTickets: bookingData.numberOfTickets
        }
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test QR email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test QR code email endpoint. Use POST with email, guardianName, childName, numberOfTickets, transactionId',
    example: {
      email: 'test@example.com',
      guardianName: 'John Doe',
      childName: 'Jane Doe',
      numberOfTickets: 2,
      transactionId: 'TEST-123456'
    }
  });
}

