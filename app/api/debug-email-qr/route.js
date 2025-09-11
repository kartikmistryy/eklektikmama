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
      transactionId: 'pi_test_123456789',
      ticketNumber: 1,
      qrCodeDataUrl: null // Will be generated
    };

    const testEventData = {
      title: 'Test Event - QR Code Debug',
      date: new Date().toISOString(),
      location: 'Test Location, Dubai',
      description: 'This is a test event to debug QR code display in emails',
      price: 75
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

    console.log('Generating QR code with payload:', qrPayload);

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

    console.log('QR code generated, length:', qrCodeDataUrl.length);

    // Update booking data with QR code
    testBookingData.qrCodeDataUrl = qrCodeDataUrl;

    // Generate email content
    const emailContent = generateBookingEmailContent(testBookingData, testEventData);

    // Create HTML page to display the email preview
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email QR Code Debug</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; }
          .debug-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .email-preview { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .success { color: green; font-weight: bold; }
          .error { color: red; font-weight: bold; }
          .info { background: #e3f2fd; padding: 10px; border-radius: 4px; margin: 10px 0; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email QR Code Debug</h1>
          
          <div class="debug-info">
            <h2>Debug Information</h2>
            <div class="info">
              <strong>QR Code Generated:</strong> <span class="success">✅ Success</span><br>
              <strong>QR Code Length:</strong> ${qrCodeDataUrl.length} characters<br>
              <strong>QR Code Valid:</strong> ${qrCodeDataUrl.length > 100 ? '✅ Yes' : '❌ No'}<br>
              <strong>Ticket Number:</strong> ${testBookingData.ticketNumber}<br>
              <strong>Transaction ID:</strong> ${testBookingData.transactionId}
            </div>
            
            <h3>QR Code Data URL (first 200 chars):</h3>
            <pre>${qrCodeDataUrl.substring(0, 200)}...</pre>
            
            <h3>QR Code Payload:</h3>
            <pre>${qrPayload}</pre>
          </div>
          
          <div class="email-preview">
            <h2>Email Preview</h2>
            <p><strong>Subject:</strong> ${emailContent.subject}</p>
            
            <div style="border: 1px solid #ddd; padding: 20px; background: #f9f9f9;">
              ${emailContent.html_content}
            </div>
          </div>
          
          <div class="debug-info">
            <h2>Instructions</h2>
            <div class="info">
              <p>1. Check if the QR code is visible in the email preview above</p>
              <p>2. If the QR code shows as a placeholder, the data URL might be invalid</p>
              <p>3. If the QR code is visible, the generation is working correctly</p>
              <p>4. The QR code should be a black and white square pattern</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Email QR debug error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email QR Code Debug - Error</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: red; font-weight: bold; background: #ffe6e6; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email QR Code Debug - Error</h1>
          <div class="error">
            <h3>Error occurred:</h3>
            <p>${error.message}</p>
            <pre>${error.stack}</pre>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(errorHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}
