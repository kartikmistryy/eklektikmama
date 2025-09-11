import { NextResponse } from "next/server";
import { generateBookingEmailContent } from "@/lib/emailTemplates";
import QRCode from "qrcode";

export async function GET() {
  try {
    // Create test data
    const testBookingData = {
      userEmail: 'test@example.com',
      guardianName: 'Test Guardian',
      childName: 'Test Child',
      numberOfTickets: 2,
      transactionId: 'test_transaction_123',
      ticketNumber: 1,
      qrCodeDataUrl: null // Will be generated
    };

    const testEventData = {
      title: 'Test Event - QR Code Email',
      date: new Date().toISOString(),
      location: 'Test Location',
      description: 'This is a test event to verify QR code display in emails',
      price: 50
    };

    // Generate a test QR code
    const qrPayload = JSON.stringify({
      eventId: 'test_event_id',
      transactionId: testBookingData.transactionId,
      email: testBookingData.userEmail,
      ticketNumber: testBookingData.ticketNumber,
      guardianName: testBookingData.guardianName,
      childName: testBookingData.childName,
      numberOfTickets: testBookingData.numberOfTickets,
      eventTitle: testEventData.title,
      eventDate: testEventData.date,
      ticketUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://eklektikmama.com'}/ticket/test_booking_id`
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1.0,
      margin: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300,
      scale: 4
    });

    // Update booking data with QR code
    testBookingData.qrCodeDataUrl = qrCodeDataUrl;

    // Generate email content
    const emailContent = generateBookingEmailContent(testBookingData, testEventData);

    return NextResponse.json({
      success: true,
      message: 'Test email with QR code generated',
      emailContent: {
        subject: emailContent.subject,
        html_preview: emailContent.html_content.substring(0, 1000) + '...',
        qr_code_generated: !!qrCodeDataUrl,
        qr_code_length: qrCodeDataUrl ? qrCodeDataUrl.length : 0,
        ticket_number: testBookingData.ticketNumber,
        transaction_id: testBookingData.transactionId
      },
      // Return the full HTML for testing
      fullHtml: emailContent.html_content
    });

  } catch (error) {
    console.error('Test email QR error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
