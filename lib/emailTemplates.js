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

  // Import QR code functions only for non-Eklektik Edit events
  let qrCodeSection = '';
  if (segment !== 'eklektikEdit') {
    const { createQRCodeSection, createTicketQRData, generateEmailFriendlyQRCode } = await import('./qrCodeGenerator.js');
    
    // Create QR code data as URL instead of JSON
    const qrDataUrl = createTicketQRData(transactionId, primaryTicketNumber, title, location, eventDate, null, segment, message, meetingLink);
    const qrCodeImageUrl = await generateEmailFriendlyQRCode(qrDataUrl);
    
    // Create QR code section with event details
    qrCodeSection = createQRCodeSection(qrCodeImageUrl, transactionId, primaryTicketNumber, null, title, location, eventDate, null, segment);
  }

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
          <div class="event-details" style="border-left: 4px solid #DB4E9F; background: #f8f9ff;">
            <h2 style="margin-top: 0; color: #093166;">📝 Eklektik Edit Session Details</h2>
            ${message ? `<p><strong>Session Message:</strong> ${message}</p>` : ''}
            ${meetingLink ? `
              <p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #DB4E9F; text-decoration: none; word-break: break-all;">${meetingLink}</a></p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${meetingLink}" class="button" style="background: #28a745; font-size: 16px; padding: 15px 30px;">
                  🚀 Join Your Session
                </a>
              </div>
              <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 3px solid #28a745;">
                <p style="margin: 0; font-size: 14px; color: #155724;">
                  <strong>How to join:</strong> Click the button above or use the meeting link to join your Eklektik Edit session.
                </p>
              </div>
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

HOW TO JOIN YOUR SESSION:
${meetingLink ? `- Use the meeting link above to join your session` : ''}
- Show your booking ID: ${transactionId}
- Show your email address: ${userEmail}
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

// Annual Membership Welcome Email Template
export function generateAnnualMembershipWelcomeEmail(firstName, userEmail) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Eklektik AF</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #093166 0%, #DB4E9F 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DB4E9F; }
        .button { display: inline-block; background: #DB4E9F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .highlight { color: #DB4E9F; font-weight: bold; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .perk-list { list-style: none; padding: 0; }
        .perk-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .perk-list li:before { content: "✨ "; color: #DB4E9F; }
        .divider { text-align: center; margin: 30px 0; color: #666; font-size: 24px; }
        .upgrade-box { background: #f8f9ff; border: 2px solid #DB4E9F; border-radius: 8px; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">🎉</div>
          <h1 style="margin: 0 0 10px 0;">You're In. Welcome to Eklektik AF</h1>
          <p style="margin: 0; opacity: 0.9;">The membership side of Eklektik Mama</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2 style="margin-top: 0; color: #093166;">Hi ${firstName},</h2>
            <p>Congrats – you've officially joined Eklektik AF, the membership side of Eklektik Mama, the UAE's loudest platform for modern motherhood.</p>
            <p>This isn't just a membership. It's your all-access pass to chaos with benefits – real friends, unfiltered mum chat, and perks that make life easier (and a lot more fun).</p>
          </div>

          <div class="divider">⸻</div>

          <div class="section">
            <h2 style="margin-top: 0; color: #093166;">Here's what you've unlocked:</h2>
            <ul class="perk-list">
              <li>10% off every BYOBaby™ event – breakfasts, cinema mornings, and more.</li>
              <li>10% off Eklektik Mama merch – motherhood deserves better than boring tote bags.</li>
              <li>Members-only Coffee Catch Ups – every other Thursday at Roots Bar & Kitchen, Yas Acres.<br><small>(Starts Thursday, October 2nd, 9 AM – 12 PM)</small></li>
              <li>The Eklektik Mama Guide to UAE Mum Life – your go-to digital survival manual, exclusive to annual members.</li>
              <li>Exclusive Eklektik Mama Tote Bag – our welcome gift to you.</li>
              <li>Priority booking – 48 hours to grab tickets before anyone else.</li>
              <li>Mama Milestones Cards (Digital Download) – celebrate (or survive) every stage of motherhood.</li>
            </ul>
          </div>

          <div class="divider">⸻</div>

          <div class="section">
            <h2 style="margin-top: 0; color: #093166;">Next steps:</h2>
            <ol>
              <li><strong>Join our members-only WhatsApp group</strong> → <a href="https://chat.whatsapp.com/G71aC0Gbfvj1OABrGgqY5u?mode=ems_copy_h_c" style="color: #DB4E9F;">Join Chat</a><br><small>(Unfiltered mum chat ahead. Zero beige allowed.)</small></li>
              <li><strong>Download your digital perks right now:</strong>
                <ul>
                  <li><a href="/mamaMilestoneCards.pdf" style="color: #DB4E9F;">Mama Milestones Cards</a></li>
                  <li><a href="https://www.notion.so/The-Eklektik-Mama-Guide-to-UAE-Mum-Life-2445f85f9df9808b8e74ee1f95fd0ba6?v=2415f85f9df981fcbb96000cf0830acf&source=copy_link" style="color: #DB4E9F;">The Eklektik Mama Guide to UAE Mum Life</a></li>
                </ul>
              </li>
              <li><strong>Pick up your tote bag</strong> at any BYOBaby™ event – just show your membership confirmation email.</li>
            </ol>
          </div>

          <div class="divider">⸻</div>

          <div class="section" style="text-align: center; background: #f8f9ff;">
            <h2 style="margin-top: 0; color: #093166;">Welcome to the movement. You're officially Eklektik AF.</h2>
            <p style="font-style: italic; color: #666;">Raising hell & humans,<br>Simone x<br>Founder, Eklektik Mama</p>
          </div>

          <div class="footer">
            <p>Thank you for joining Eklektik AF!</p>
            <p>If you have any questions, please contact us at <a href="mailto:info@eklektikmama.com" style="color: #DB4E9F;">info@eklektikmama.com</a></p>
            <p><small>This email was sent to ${userEmail}</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
You're In. Welcome to Eklektik AF

Hi ${firstName},

Congrats – you've officially joined Eklektik AF, the membership side of Eklektik Mama, the UAE's loudest platform for modern motherhood.

This isn't just a membership. It's your all-access pass to chaos with benefits – real friends, unfiltered mum chat, and perks that make life easier (and a lot more fun).

⸻

Here's what you've unlocked:
• 10% off every BYOBaby™ event – breakfasts, cinema mornings, and more.
• 10% off Eklektik Mama merch – motherhood deserves better than boring tote bags.
• Members-only Coffee Catch Ups – every other Thursday at Roots Bar & Kitchen, Yas Acres.
  (Starts Thursday, October 2nd, 9 AM – 12 PM)
• The Eklektik Mama Guide to UAE Mum Life – your go-to digital survival manual, exclusive to annual members.
• Exclusive Eklektik Mama Tote Bag – our welcome gift to you.
• Priority booking – 48 hours to grab tickets before anyone else.
• Mama Milestones Cards (Digital Download) – celebrate (or survive) every stage of motherhood.

⸻

Next steps:
1. Join our members-only WhatsApp group → https://chat.whatsapp.com/G71aC0Gbfvj1OABrGgqY5u?mode=ems_copy_h_c
   (Unfiltered mum chat ahead. Zero beige allowed.)
2. Download your digital perks right now:
   • Mama Milestones Cards: /mamaMilestoneCards.pdf
   • The Eklektik Mama Guide to UAE Mum Life: https://www.notion.so/The-Eklektik-Mama-Guide-to-UAE-Mum-Life-2445f85f9df9808b8e74ee1f95fd0ba6?v=2415f85f9df981fcbb96000cf0830acf&source=copy_link
3. Pick up your tote bag at any BYOBaby™ event – just show your membership confirmation email.

⸻

Welcome to the movement. You're officially Eklektik AF.

Raising hell & humans,
Simone x
Founder, Eklektik Mama

Thank you for joining Eklektik AF!

If you have any questions, please contact us at info@eklektikmama.com
  `;

  return {
    to_email: userEmail,
    to_name: firstName || 'Valued Member',
    subject: "You're In. Welcome to Eklektik AF",
    html_content: htmlContent,
    text_content: textContent,
    attachments: [
      {
        filename: 'mamaMilestoneCards.pdf',
        path: '/public/mamaMilestoneCards.pdf'
      }
    ]
  };
}

// Monthly Membership Welcome Email Template
export function generateMonthlyMembershipWelcomeEmail(firstName, userEmail) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Eklektik AF (Monthly)</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #093166 0%, #DB4E9F 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DB4E9F; }
        .button { display: inline-block; background: #DB4E9F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .highlight { color: #DB4E9F; font-weight: bold; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .perk-list { list-style: none; padding: 0; }
        .perk-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .perk-list li:before { content: "✨ "; color: #DB4E9F; }
        .divider { text-align: center; margin: 30px 0; color: #666; font-size: 24px; }
        .upgrade-box { background: #f8f9ff; border: 2px solid #DB4E9F; border-radius: 8px; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">🎉</div>
          <h1 style="margin: 0 0 10px 0;">You're In. Welcome to Eklektik AF (Monthly)</h1>
          <p style="margin: 0; opacity: 0.9;">The membership side of Eklektik Mama</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2 style="margin-top: 0; color: #093166;">Hi ${firstName},</h2>
            <p>Welcome to Eklektik AF, the membership side of Eklektik Mama, the UAE's loudest platform for modern motherhood.</p>
            <p>You've just unlocked your bite-sized chaos with big perks – perfect for trying things out and connecting with other mums who get it.</p>
          </div>

          <div class="divider">⸻</div>

          <div class="section">
            <h2 style="margin-top: 0; color: #093166;">Here's what you get:</h2>
            <ul class="perk-list">
              <li>10% off every BYOBaby™ event – breakfasts, cinema mornings, and more.</li>
              <li>10% off Eklektik Mama merch – because motherhood doesn't have to be boring.</li>
              <li>Members-only Coffee Catch Ups – every other Thursday at Roots Bar & Kitchen, Yas Acres.<br><small>(Starts Thursday, October 2nd, 9 AM – 12 PM)</small></li>
              <li>Mama Milestones Cards (Digital Download) – mark the messy, funny, unforgettable bits of motherhood.</li>
            </ul>
          </div>

          <div class="divider">⸻</div>

          <div class="section">
            <h2 style="margin-top: 0; color: #093166;">Next steps:</h2>
            <ol>
              <li><strong>Join our members-only WhatsApp group</strong> → <a href="https://chat.whatsapp.com/G71aC0Gbfvj1OABrGgqY5u?mode=ems_copy_h_c" style="color: #DB4E9F;">Join Chat</a><br><small>(Unfiltered mum chat ahead. Zero beige allowed.)</small></li>
              <li><strong>Download your digital perk:</strong>
                <ul>
                  <li><a href="/mamaMilestoneCards.pdf" style="color: #DB4E9F;">Mama Milestones Cards</a></li>
                </ul>
              </li>
            </ol>
          </div>

          <div class="divider">⸻</div>

          <div class="upgrade-box">
            <h2 style="margin-top: 0; color: #093166;">Thinking about going bigger?</h2>
            <p>Upgrade to annual and get:</p>
            <ul class="perk-list">
              <li>An exclusive Eklektik Mama tote bag</li>
              <li>Priority booking for events</li>
              <li>Save AED 138 vs paying monthly</li>
            </ul>
            <p style="font-style: italic; color: #666;">It's the easiest way to make the chaos even more worth it.</p>
          </div>

          <div class="divider">⸻</div>

          <div class="section" style="text-align: center; background: #f8f9ff;">
            <p style="font-style: italic; color: #666; margin: 0;">Raising hell & humans,<br>Simone x<br>Founder, Eklektik Mama</p>
          </div>

          <div class="footer">
            <p>Thank you for joining Eklektik AF!</p>
            <p>If you have any questions, please contact us at <a href="mailto:info@eklektikmama.com" style="color: #DB4E9F;">info@eklektikmama.com</a></p>
            <p><small>This email was sent to ${userEmail}</small></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
You're In. Welcome to Eklektik AF (Monthly)

Hi ${firstName},

Welcome to Eklektik AF, the membership side of Eklektik Mama, the UAE's loudest platform for modern motherhood.

You've just unlocked your bite-sized chaos with big perks – perfect for trying things out and connecting with other mums who get it.

⸻

Here's what you get:
• 10% off every BYOBaby™ event – breakfasts, cinema mornings, and more.
• 10% off Eklektik Mama merch – because motherhood doesn't have to be boring.
• Members-only Coffee Catch Ups – every other Thursday at Roots Bar & Kitchen, Yas Acres.
  (Starts Thursday, October 2nd, 9 AM – 12 PM)
• Mama Milestones Cards (Digital Download) – mark the messy, funny, unforgettable bits of motherhood.

⸻

Next steps:
1. Join our members-only WhatsApp group → https://chat.whatsapp.com/G71aC0Gbfvj1OABrGgqY5u?mode=ems_copy_h_c
   (Unfiltered mum chat ahead. Zero beige allowed.)
2. Download your digital perk:
   • Mama Milestones Cards: /mamaMilestoneCards.pdf

⸻

Thinking about going bigger?
Upgrade to annual and get:
• An exclusive Eklektik Mama tote bag
• Priority booking for events
• Save AED 138 vs paying monthly

It's the easiest way to make the chaos even more worth it.

⸻

Raising hell & humans,
Simone x
Founder, Eklektik Mama

Thank you for joining Eklektik AF!

If you have any questions, please contact us at info@eklektikmama.com
  `;

  return {
    to_email: userEmail,
    to_name: firstName || 'Valued Member',
    subject: "You're In. Welcome to Eklektik AF (Monthly)",
    html_content: htmlContent,
    text_content: textContent,
    attachments: [
      {
        filename: 'mamaMilestoneCards.pdf',
        path: '/public/mamaMilestoneCards.pdf'
      }
    ]
  };
}
