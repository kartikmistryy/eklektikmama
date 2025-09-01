import crypto from 'crypto';
import { generateBookingEmailContent } from './emailTemplates';

// Mailchimp API configuration
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
const MAILCHIMP_TEMPLATE_ID = process.env.MAILCHIMP_TEMPLATE_ID;

// Base URL for Mailchimp API
const MAILCHIMP_API_URL = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0`;

// Generate MD5 hash for email (required by Mailchimp)
const generateSubscriberHash = (email) => {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
};

// Send booking confirmation email via Mailchimp
export async function sendBookingConfirmationEmail(bookingData, eventData) {
  try {
    // Check if we have the basic configuration
    if (!MAILCHIMP_API_KEY) {
      console.log('Mailchimp API key not configured - skipping email');
      return { success: false, error: 'Mailchimp API key not configured' };
    }

    // Generate email content using the new template
    const emailContent = generateBookingEmailContent(bookingData, eventData);
    
    console.log('Email content prepared for:', emailContent.to_email);
    console.log('Subject:', emailContent.subject);
    console.log('HTML Content Length:', emailContent.html_content.length);
    console.log('Text Content Length:', emailContent.text_content.length);
    
    // Send email using the configured service
    const emailResult = await sendEmailViaService(emailContent.to_email, emailContent);
    
    if (emailResult.success) {
      console.log('Booking confirmation email sent successfully to:', emailContent.to_email);
      return { success: true, messageId: emailResult.messageId };
    } else {
      throw new Error(emailResult.error);
    }

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
}

// Alternative: Send email using Mailchimp Transactional (if you have it)
export async function sendTransactionalEmail(bookingData, eventData) {
  try {
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX) {
      console.log('Mailchimp not configured - skipping transactional email');
      return { success: false, error: 'Mailchimp not configured' };
    }

    const { userEmail, guardianName, childName, numberOfTickets, transactionId, qrCodeDataUrl } = bookingData;
    const { title, date, location, description, price } = eventData;

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

    // Create email content (same as above)
    const emailContent = {
      to_email: userEmail,
      to_name: guardianName || 'Valued Customer',
      subject: `Booking Confirmation - ${title}`,
      html_content: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #093166 0%, #DB4E9F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DB4E9F; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #093166; }
            .qr-section { text-align: center; margin: 20px 0; }
            .qr-code { max-width: 200px; border: 2px solid #ddd; border-radius: 8px; }
            .button { display: inline-block; background: #DB4E9F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            .highlight { color: #DB4E9F; font-weight: bold; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">🎉</div>
              <h1>Booking Confirmed!</h1>
              <p>Your payment was successful and your booking is confirmed.</p>
            </div>
            
            <div class="content">
              <div class="booking-details">
                <h2>📋 Booking Details</h2>
                <p><strong>Booking ID:</strong> <span class="highlight">${transactionId}</span></p>
                <p><strong>Guardian/Parent Name:</strong> ${guardianName || 'Not provided'}</p>
                ${childName ? `<p><strong>Child Name:</strong> ${childName}</p>` : ''}
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Number of Tickets:</strong> ${numberOfTickets}</p>
                <p><strong>Total Amount:</strong> AED ${(price * numberOfTickets).toFixed(2)}</p>
                <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Paid</span></p>
              </div>

              <div class="event-details">
                <h2>🎪 Event Details</h2>
                <p><strong>Event:</strong> ${title}</p>
                <p><strong>Date & Time:</strong> ${eventDate}</p>
                ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
                ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
              </div>

              ${qrCodeDataUrl ? `
                <div class="qr-section">
                  <h2>📱 Entry QR Code</h2>
                  <p>Show this QR code at the event entrance for quick check-in:</p>
                  <img src="${qrCodeDataUrl}" alt="Entry QR Code" class="qr-code">
                  <p><small>Please save this QR code or take a screenshot for easy access</small></p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events" class="button">
                  Browse More Events
                </a>
              </div>

              <div class="footer">
                <p>Thank you for choosing Eklektik Mama!</p>
                <p>If you have any questions, please contact us at <a href="mailto:info@eklektikmama.com">info@eklektikmama.com</a></p>
                <p><small>This email was sent to ${userEmail}</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Note: This would require Mailchimp Transactional (formerly Mandrill) API
    // You would need to implement the specific API calls for transactional emails
    console.log('Transactional email functionality would be implemented here');
    return { success: false, error: 'Transactional email not implemented' };

  } catch (error) {
    console.error('Error sending transactional email:', error);
    return { success: false, error: error.message };
  }
}

// Mailchimp integration
async function sendViaMailchimp(bookingData, eventData) {
  try {
    const { userEmail, guardianName, childName, numberOfTickets, transactionId, qrCodeDataUrl } = bookingData;
    const { title, date, location, description, price } = eventData;

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

    // Create email content
    const emailContent = {
      to_email: userEmail,
      to_name: guardianName || 'Valued Customer',
      subject: `Booking Confirmation - ${title}`,
      html_content: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #093166 0%, #DB4E9F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DB4E9F; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #093166; }
            .qr-section { text-align: center; margin: 20px 0; }
            .qr-code { max-width: 200px; border: 2px solid #ddd; border-radius: 8px; }
            .button { display: inline-block; background: #DB4E9F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            .highlight { color: #DB4E9F; font-weight: bold; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">🎉</div>
              <h1>Booking Confirmed!</h1>
              <p>Your payment was successful and your booking is confirmed.</p>
            </div>
            
            <div class="content">
              <div class="booking-details">
                <h2>📋 Booking Details</h2>
                <p><strong>Booking ID:</strong> <span class="highlight">${transactionId}</span></p>
                <p><strong>Guardian/Parent Name:</strong> ${guardianName || 'Not provided'}</p>
                ${childName ? `<p><strong>Child Name:</strong> ${childName}</p>` : ''}
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Number of Tickets:</strong> ${numberOfTickets}</p>
                <p><strong>Total Amount:</strong> AED ${(price * numberOfTickets).toFixed(2)}</p>
                <p><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Paid</span></p>
              </div>

              <div class="event-details">
                <h2>🎪 Event Details</h2>
                <p><strong>Event:</strong> ${title}</p>
                <p><strong>Date & Time:</strong> ${eventDate}</p>
                ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
                ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
              </div>

              ${qrCodeDataUrl ? `
                <div class="qr-section">
                  <h2>📱 Entry QR Code</h2>
                  <p>Show this QR code at the event entrance for quick check-in:</p>
                  <img src="${qrCodeDataUrl}" alt="Entry QR Code" class="qr-code">
                  <p><small>Please save this QR code or take a screenshot for easy access</small></p>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/events" class="button">
                  Browse More Events
                </a>
              </div>

              <div class="footer">
                <p>Thank you for choosing Eklektik Mama!</p>
                <p>If you have any questions, please contact us at <a href="mailto:info@eklektikmama.com">info@eklektikmama.com</a></p>
                <p><small>This email was sent to ${userEmail}</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text_content: `
Booking Confirmation - ${title}

🎉 Your booking has been confirmed!

BOOKING DETAILS:
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

${qrCodeDataUrl ? `
ENTRY QR CODE:
Please show the QR code in the email at the event entrance for quick check-in.
` : ''}

Thank you for choosing Eklektik Mama!

If you have any questions, please contact us at info@eklektikmama.com
      `
    };

    console.log('Sending email via Mailchimp Transactional to:', userEmail);
    console.log('Mailchimp API Key exists:', !!MAILCHIMP_API_KEY);
    console.log('Mailchimp Server Prefix:', MAILCHIMP_SERVER_PREFIX);

    // Use Mailchimp Transactional API (Mandrill) for direct email sending
    const mandrillUrl = `https://mandrillapp.com/api/1.0/messages/send`;
    
    const mandrillPayload = {
      key: MAILCHIMP_API_KEY,
      message: {
        html: emailContent.html_content,
        text: emailContent.text_content,
        subject: emailContent.subject,
        from_email: 'events@eklektikmama.com',
        from_name: 'Eklektik Mama',
        to: [
          {
            email: userEmail,
            name: emailContent.to_name,
            type: 'to'
          }
        ],
        headers: {
          'Reply-To': 'info@eklektikmama.com'
        },
        track_opens: true,
        track_clicks: true,
        auto_text: true,
        url_strip_qs: true,
        preserve_recipients: false,
        view_content_link: false,
        bcc_address: 'info@eklektikmama.com',
        tracking_domain: null,
        signing_domain: null,
        return_path_domain: null,
        merge: true,
        merge_language: 'mailchimp',
        global_merge_vars: [
          {
            name: 'CUSTOMER_NAME',
            content: emailContent.to_name
          },
          {
            name: 'EVENT_TITLE',
            content: eventData.title
          },
          {
            name: 'BOOKING_ID',
            content: transactionId
          }
        ]
      },
      async: false,
      ip_pool: 'Main Pool',
      send_at: null
    };

    console.log('Mailchimp Transactional payload:', JSON.stringify(mandrillPayload, null, 2));

    const response = await fetch(mandrillUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mandrillPayload)
    });

    console.log('Mailchimp Transactional response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mailchimp Transactional API Error:', errorData);
      throw new Error(`Mailchimp Transactional API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Mailchimp Transactional success result:', result);
    console.log('Booking confirmation email sent successfully to:', userEmail);
    return { success: true, messageId: result[0]?.message_id };

  } catch (error) {
    console.error('Error sending booking confirmation email via Mailchimp:', error);
    return { success: false, error: error.message };
  }
}

// Simple email service function - replace with your preferred email service
async function sendEmailViaService(toEmail, emailContent) {
  try {
    // Option 1: Resend (prioritized when configured)
    if (process.env.RESEND_API_KEY) {
      console.log('Using Resend for email sending');
      return await sendViaResend(toEmail, emailContent);
    }
    
    // Option 2: SendGrid (recommended - free tier available)
    if (process.env.SENDGRID_API_KEY) {
      console.log('Using SendGrid for email sending');
      return await sendViaSendGrid(toEmail, emailContent);
    }
    
    // Option 3: Gmail SMTP (requires app password)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      return await sendViaGmail(toEmail, emailContent);
    }
    
    // Option 4: Console log (for development/testing)
    console.log('=== EMAIL WOULD BE SENT ===');
    console.log('To:', toEmail);
    console.log('Subject:', emailContent.subject);
    console.log('HTML Content:', emailContent.html_content.substring(0, 200) + '...');
    console.log('Text Content:', emailContent.text_content.substring(0, 200) + '...');
    console.log('=== END EMAIL CONTENT ===');
    
    return { success: true, messageId: 'console-log-' + Date.now() };
    
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

// SendGrid integration
async function sendViaSendGrid(toEmail, emailContent) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: toEmail, name: emailContent.to_name }],
          subject: emailContent.subject,
        },
      ],
      from: { email: 'noreply@eklektikmama.com', name: 'Eklektik Mama' },
      reply_to: { email: 'info@eklektikmama.com', name: 'Eklektik Mama Support' },
      content: [
        {
          type: 'text/html',
          value: emailContent.html_content,
        },
        {
          type: 'text/plain',
          value: emailContent.text_content,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  return { success: true, messageId: 'sendgrid-' + Date.now() };
}

// Resend integration
async function sendViaResend(toEmail, emailContent) {
  try {
    console.log('Sending email via Resend to:', toEmail);
    console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY);
    
    const payload = {
      from: 'Eklektik Mama <noreply@eklektikmama.com>', // Use verified domain
      to: [toEmail],
      subject: emailContent.subject,
      html: emailContent.html_content,
      text: emailContent.text_content,
      reply_to: 'info@eklektikmama.com',
    };

    console.log('Resend payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Resend response status:', response.status);
    console.log('Resend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.log('Resend error data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.log('Could not parse error response as JSON');
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`Resend error: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('Resend success result:', result);
    return { success: true, messageId: result.id };
    
  } catch (error) {
    console.error('Resend integration error:', error);
    throw error;
  }
}

// Gmail SMTP integration (requires nodemailer)
async function sendViaGmail(toEmail, emailContent) {
  // This would require installing nodemailer: npm install nodemailer
  // For now, we'll just log that Gmail is configured
  console.log('Gmail SMTP configured but nodemailer not implemented');
  console.log('Would send email to:', toEmail);
  return { success: true, messageId: 'gmail-' + Date.now() };
}
