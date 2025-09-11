import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET() {
  try {
    // Create test data
    const testData = {
      eventId: 'test_event_123',
      transactionId: 'pi_test_123',
      email: 'test@example.com',
      ticketNumber: 1,
      guardianName: 'Test Guardian',
      childName: 'Test Child',
      numberOfTickets: 2,
      eventTitle: 'Test Event',
      eventDate: new Date().toISOString(),
      ticketUrl: 'https://eklektikmama.com/ticket/test_123',
      bookingId: 'test_booking_123'
    };

    const qrPayload = JSON.stringify(testData);
    
    // Generate QR code with the same settings as the email
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

    // Create HTML page to display the QR code
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code Test</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .qr-section { text-align: center; margin: 20px 0; }
          .qr-code { border: 2px solid #ddd; border-radius: 8px; padding: 10px; background: white; display: inline-block; }
          .info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .success { color: green; font-weight: bold; }
          .error { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>QR Code Generation Test</h1>
          
          <div class="info">
            <h3>Test Data:</h3>
            <pre>${JSON.stringify(testData, null, 2)}</pre>
          </div>
          
          <div class="qr-section">
            <h2>Generated QR Code</h2>
            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="Test QR Code" style="max-width: 300px;">
            </div>
            <p><strong>QR Code Data URL Length:</strong> ${qrCodeDataUrl.length} characters</p>
            <p><strong>QR Code Generated:</strong> <span class="success">✅ Success</span></p>
          </div>
          
          <div class="info">
            <h3>QR Code Data URL (first 200 chars):</h3>
            <code>${qrCodeDataUrl.substring(0, 200)}...</code>
          </div>
          
          <div class="info">
            <h3>Instructions:</h3>
            <p>1. The QR code above should be visible and scannable</p>
            <p>2. If you can see the QR code, the generation is working</p>
            <p>3. If the QR code is empty or broken, there's an issue with the generation</p>
            <p>4. Try scanning the QR code with your phone to verify it contains the test data</p>
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
    console.error('QR code test error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code Test - Error</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: red; font-weight: bold; background: #ffe6e6; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>QR Code Generation Test - Error</h1>
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
