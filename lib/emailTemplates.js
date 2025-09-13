// Email template generator for booking confirmations
export async function generateBookingEmailContent(bookingData, eventData, qrCodeDataUrl = null) {
  const { userEmail, guardianName, childName, numberOfTickets, transactionId, ticketNumbers } = bookingData;
  
  // Handle ticket numbers - use first one for display, or create a range
  const primaryTicketNumber = ticketNumbers && ticketNumbers.length > 0 ? ticketNumbers[0] : null;
  const ticketNumberDisplay = ticketNumbers && ticketNumbers.length > 1 
    ? `#${ticketNumbers[0]}-${ticketNumbers[ticketNumbers.length - 1]}` 
    : primaryTicketNumber ? `#${primaryTicketNumber}` : null;
  const { title, date, location, description, price, segment, message, meetingLink } = eventData;

  // Format event date
  const eventDate = new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai'
  });

  // Import QR code functions
  const { createQRCodeSection, createTicketQRData, generateEmailFriendlyQRCode } = await import('./qrCodeGenerator.js');
  
  // Create QR code data as URL instead of JSON
  const qrDataUrl = createTicketQRData(transactionId, primaryTicketNumber, title, location, eventDate, null, segment, message, meetingLink);
  const qrCodeImageUrl = await generateEmailFriendlyQRCode(qrDataUrl);
  
  // Create QR code section with event details
  const qrCodeSection = createQRCodeSection(qrCodeImageUrl, transactionId, primaryTicketNumber, null, title, location, eventDate, null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #093166 0%, #DB4E9F 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DB4E9F; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #093166; }
        .button { display: inline-block; background: #DB4E9F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .highlight { color: #DB4E9F; font-weight: bold; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .alternative-entry { margin-top: 15px; font-size: 12px; color: #6c757d; background: #f8f9fa; padding: 10px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">🎉</div>
          <h1 style="margin: 0 0 10px 0;">Booking Confirmed!</h1>
          <p style="margin: 0; opacity: 0.9;">Your payment was successful and your booking is confirmed.</p>
        </div>
        
        <div class="content">
          <div class="booking-details">
            <h2 style="margin-top: 0; color: #093166;">📋 Booking Details</h2>
            ${ticketNumberDisplay ? `<p><strong>Ticket Number${numberOfTickets > 1 ? 's' : ''}:</strong> <span class="highlight">${ticketNumberDisplay}</span></p>` : ''}
            <p><strong>Booking ID:</strong> <span class="highlight">${transactionId}</span></p>
            <p><strong>Guardian/Parent Name:</strong> ${guardianName || 'Not provided'}</p>
            ${childName ? `<p><strong>Child Name:</strong> ${childName}</p>` : ''}
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Number of Tickets:</strong> ${numberOfTickets}</p>
            <p><strong>Total Amount:</strong> AED ${(price * numberOfTickets).toFixed(2)}</p>
            <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Paid</span></p>
          </div>

          <div class="event-details">
            <h2 style="margin-top: 0; color: #093166;">🎪 Event Details</h2>
            <p><strong>Event:</strong> ${title}</p>
            <p><strong>Date & Time:</strong> ${eventDate}</p>
            ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          </div>

          ${segment === 'eklektikEdit' && (message || meetingLink) ? `
          <div class="event-details" style="border-left: 4px solid #DB4E9F;">
            <h2 style="margin-top: 0; color: #093166;">📝 Eklektik Edit Details</h2>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            ${meetingLink ? `
              <p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #DB4E9F; text-decoration: none;">${meetingLink}</a></p>
              <p style="margin-top: 10px;">
                <a href="${meetingLink}" class="button" style="background: #28a745;">
                  Join Meeting
                </a>
              </p>
            ` : ''}
          </div>
          ` : ''}

          <!-- QR Code and Entry Information (not for eklektikEdit events) -->
          ${segment !== 'eklektikEdit' ? qrCodeSection : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events" class="button" style="margin-right: 10px;">
              Browse More Events
            </a>
            ${segment !== 'eklektikEdit' && primaryTicketNumber ? `
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/ticket/${transactionId}" class="button" style="background: #093166;">
              View Your Ticket
            </a>
            ` : ''}
          </div>

          <div class="footer">
            <p>Thank you for choosing Eklektik Mama!</p>
            <p>If you have any questions, please contact us at <a href="mailto:info@eklektikmama.com" style="color: #DB4E9F;">info@eklektikmama.com</a></p>
            <p><small>This email was sent to ${userEmail}</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Booking Confirmation - ${title}

🎉 Your booking has been confirmed!

BOOKING DETAILS:
${primaryTicketNumber ? `- Ticket Number: #${primaryTicketNumber}` : ''}
- Booking ID: ${transactionId}
- Guardian/Parent Name: ${guardianName || 'Not provided'}
${childName ? `- Child Name: ${childName}` : ''}
- Email: ${userEmail}
- Number of Tickets: ${numberOfTickets}
- Total Amount: AED ${(price * numberOfTickets).toFixed(2)}
- Payment Status: Paid

EVENT DETAILS:
- Event: ${title}
- Date & Time: ${eventDate}
${location ? `- Location: ${location}` : ''}
${description ? `- Description: ${description}` : ''}

${segment === 'eklektikEdit' && (message || meetingLink) ? `
EKLEKTIK EDIT DETAILS:
${message ? `- Message: ${message}` : ''}
${meetingLink ? `- Meeting Link: ${meetingLink}` : ''}
` : ''}

${segment !== 'eklektikEdit' ? `
ENTRY INFORMATION:
Please bring the following for event entry:
- Your booking ID: ${transactionId}
- Your email address: ${userEmail}
- Your ticket number: #${primaryTicketNumber || 'N/A'}

VIEW YOUR TICKET:
${primaryTicketNumber ? `View your full ticket online: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://eklektikmama.com'}/ticket/${transactionId}` : ''}
` : ''}

Thank you for choosing Eklektik Mama!

If you have any questions, please contact us at info@eklektikmama.com
  `;

  return {
    to_email: userEmail,
    to_name: guardianName || 'Valued Customer',
    subject: `Booking Confirmation - ${title}`,
    html_content: htmlContent,
    text_content: textContent
  };
}
