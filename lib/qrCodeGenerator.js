import QRCode from 'qrcode';

// Generate QR code that's optimized for email clients (especially Gmail)
export async function generateEmailFriendlyQRCode(data) {
  try {
    // Generate optimized QR code for email clients
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 180,           // Smaller size for better email compatibility
      margin: 1,            // Minimal margin to reduce size
      color: {
        dark: '#000000',    // Pure black for better contrast
        light: '#FFFFFF'    // Pure white background
      },
      errorCorrectionLevel: 'M', // Medium error correction for smaller size
      type: 'image/png'     // PNG format for better email support
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    return null;
  }
}

// Generate a fallback QR code text representation
export function generateQRCodeText(data) {
  return `QR Code Data: ${data}`;
}

// Create a text-based QR code representation for email clients that block images
export function createTextQRCode(transactionId, ticketNumber = null, eventTitle = null) {
  const qrData = createTicketQRData(transactionId, ticketNumber, eventTitle);
  
  return `
    <div style="text-align: center; margin: 20px 0; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 2px dashed #6c757d; font-family: monospace;">
      <h3 style="margin-top: 0; color: #6c757d;">📱 QR Code Data</h3>
      <div style="background: white; padding: 15px; border-radius: 4px; word-break: break-all; font-size: 12px; line-height: 1.4;">
        ${qrData}
      </div>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #6c757d;">
        Copy this data and use any QR code generator to create your ticket QR code
      </p>
    </div>
  `;
}

// Create QR code data for ticket information
export function createTicketQRData(transactionId, ticketNumber = null, eventTitle = null, eventLocation = null, eventDate = null, eventTime = null, eventSegment = null, eventMessage = null, eventMeetingLink = null) {
  // Instead of JSON data, create a URL that points to the beautiful ticket page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Build URL with all event parameters
  const params = new URLSearchParams();
  if (ticketNumber) params.append('ticketNumber', ticketNumber);
  if (eventTitle) params.append('eventTitle', eventTitle);
  if (eventLocation) params.append('eventLocation', eventLocation);
  if (eventDate) params.append('eventDate', eventDate);
  if (eventTime) params.append('eventTime', eventTime);
  if (eventSegment) params.append('eventSegment', eventSegment);
  if (eventMessage) params.append('eventMessage', eventMessage);
  if (eventMeetingLink) params.append('eventMeetingLink', eventMeetingLink);
  
  const ticketUrl = `${baseUrl}/ticket-qr/${transactionId}?${params.toString()}`;
  
  return ticketUrl;
}

// Create a QR code section that works better in emails with Gmail compatibility
export function createQRCodeSection(qrCodeDataUrl, transactionId, ticketNumber = null, ticketUrl = null, eventTitle = null, eventLocation = null, eventDate = null, eventTime = null) {
  // Get the base URL for the ticket QR page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  
  // Build URL with all event parameters
  const params = new URLSearchParams();
  if (ticketNumber) params.append('ticketNumber', ticketNumber);
  if (eventTitle) params.append('eventTitle', eventTitle);
  if (eventLocation) params.append('eventLocation', eventLocation);
  if (eventDate) params.append('eventDate', eventDate);
  if (eventTime) params.append('eventTime', eventTime);
  
  const qrPageUrl = `${baseUrl}/ticket-qr/${transactionId}?${params.toString()}`;

  return `
    <div style="text-align: center; margin: 20px 0; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h2 style="margin-top: 0; color: #093166;">🎫 Your Digital Ticket</h2>
      
      <!-- QR Code Access Button -->
      <div style="margin: 20px 0;">
        <a href="${qrPageUrl}" 
           style="display: inline-block; background: #DB4E9F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px 0;">
          📱 View Your QR Code & Event Details
        </a>
      </div>
      
      <p style="margin: 10px 0; font-size: 14px; color: #666;">
        Click the button above to view your QR code and complete event information
      </p>
      
      <!-- Quick Event Info -->
      ${eventTitle || eventLocation || eventDate ? `
      <div style="margin-top: 15px; font-size: 14px; color: #333; background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: left;">
        <strong>Quick Event Info:</strong><br>
        ${eventTitle ? `• Event: <strong>${eventTitle}</strong><br>` : ''}
        ${eventDate ? `• Date: <strong>${eventDate}</strong><br>` : ''}
        ${eventTime ? `• Time: <strong>${eventTime}</strong><br>` : ''}
        ${eventLocation ? `• 📍 Location: <strong>${eventLocation}</strong><br>` : ''}
      </div>
      ` : ''}
      
      <!-- Ticket Information -->
      <div style="margin-top: 15px; font-size: 14px; color: #333; background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: left;">
        <strong>Ticket Details:</strong><br>
        ${ticketNumber ? `• Ticket Number: <strong>#${ticketNumber}</strong><br>` : ''}
        • Booking ID: <strong>${transactionId}</strong><br>
      </div>
      
      <!-- Alternative Entry Methods -->
      <div style="margin-top: 15px; font-size: 12px; color: #6c757d; background: #f8f9fa; padding: 10px; border-radius: 4px; text-align: left;">
        <strong>Alternative Entry Methods:</strong><br>
        • Show your booking ID: <strong>${transactionId}</strong><br>
        ${ticketNumber ? `• Show your ticket number: <strong>#${ticketNumber}</strong><br>` : ''}
        ${ticketUrl ? `• View your ticket online: <a href="${ticketUrl}" style="color: #db4e9f;">Click here</a><br>` : ''}
        • Show your email address at the entrance
      </div>
      
      <!-- Gmail-friendly message -->
      <div style="margin-top: 15px; font-size: 11px; color: #999; background: #e8f5e8; padding: 8px; border-radius: 4px; border-left: 3px solid #28a745;">
        <strong>✅ Gmail Compatible:</strong> This approach works reliably across all email clients including Gmail.
      </div>
      
      <!-- Text-based QR code fallback -->
      ${createTextQRCode(transactionId, ticketNumber, eventTitle)}
    </div>
  `;
}
