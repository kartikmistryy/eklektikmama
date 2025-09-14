// Use your existing email service from mailchimp.js
// We'll create a simple email service function that uses the same pattern as your existing system

// Simple email service function that uses your existing email infrastructure
async function sendEmailViaService(toEmail, emailContent) {
  try {
    // Option 1: Resend (prioritized when configured)
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(toEmail, emailContent);
    }
    
    // Option 2: SendGrid (recommended - free tier available)
    if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid(toEmail, emailContent);
    }
    
    // Option 3: Console log (for development/testing)
    console.log('📧 Email would be sent to:', toEmail);
    console.log('📧 Subject:', emailContent.subject);
    console.log('📧 Content preview:', emailContent.html_content.substring(0, 200) + '...');
    
    return { success: true, messageId: 'console-log-' + Date.now() };
    
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

// Resend integration
async function sendViaResend(toEmail, emailContent) {
  try {
    const payload = {
      from: 'Eklektik Mama <noreply@eklektikmama.com>',
      to: [toEmail],
      subject: emailContent.subject,
      html: emailContent.html_content,
      text: emailContent.text_content,
      reply_to: 'info@eklektikmama.com',
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(`Resend error: ${errorMessage}`);
    }

    const result = await response.json();
    return { success: true, messageId: result.id };
    
  } catch (error) {
    console.error('Resend integration error:', error);
    throw error;
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

// Welcome email template for new members
export const sendMemberWelcomeEmail = async (memberData) => {
  try {
    const { firstName, lastName, email, membershipType } = memberData;
    
    const subject = `Welcome to Eklektik AF, ${firstName}! 🎉`;
    
    const emailContent = {
      to_email: email,
      to_name: `${firstName} ${lastName}`,
      subject: subject,
      html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Eklektik AF</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #093166, #1e4a72); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .benefits { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #093166; }
          .benefit-item { margin: 10px 0; padding: 10px; background: #f0f8ff; border-radius: 5px; }
          .cta-button { display: inline-block; background: #093166; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Eklektik AF!</h1>
            <p>You're now part of Abu Dhabi's boldest mum community</p>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName},</h2>
            
            <p>Welcome to the Eklektik AF family! We're absolutely thrilled to have you join our exclusive community of amazing mums in Abu Dhabi.</p>
            
            <div class="benefits">
              <h3>🌟 Your Membership Benefits:</h3>
              <div class="benefit-item">
                <strong>10% Discount</strong> on all event tickets
              </div>
              <div class="benefit-item">
                <strong>Exclusive Access</strong> to member-only events
              </div>
              <div class="benefit-item">
                <strong>Priority Booking</strong> for popular events
              </div>
              <div class="benefit-item">
                <strong>Private WhatsApp Group</strong> for member networking
              </div>
              <div class="benefit-item">
                <strong>Special Perks</strong> from our partner brands
              </div>
            </div>
            
            <p>Your ${membershipType} membership is now active, and you can start enjoying all these benefits immediately!</p>
            
            <div style="text-align: center;">
              <a href="https://eklektikmama.com/events" class="cta-button">Browse Events</a>
            </div>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Check out our upcoming events and book with your member discount</li>
              <li>Join our private member WhatsApp group (link will be sent separately)</li>
              <li>Follow us on social media for exclusive member content</li>
              <li>Keep an eye out for member-only special events</li>
            </ul>
            
            <p>If you have any questions about your membership or need help with anything, don't hesitate to reach out to us at <a href="mailto:hello@eklektikmama.com">hello@eklektikmama.com</a>.</p>
            
            <p>Welcome to the family, ${firstName}! We can't wait to see you at our next event.</p>
            
            <p>With love,<br>
            The Eklektik Mama Team 💜</p>
          </div>
          
          <div class="footer">
            <p>Eklektik Mama - Abu Dhabi's Boldest Mum Community</p>
            <p>This email was sent to ${email}. If you have any questions, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `,
      text_content: `
        Welcome to Eklektik AF, ${firstName}!
        
        You're now part of Abu Dhabi's boldest mum community!
        
        Your Membership Benefits:
        - 10% Discount on all event tickets
        - Exclusive Access to member-only events
        - Priority Booking for popular events
        - Private WhatsApp Group for member networking
        - Special Perks from our partner brands
        
        Your ${membershipType} membership is now active!
        
        What's Next?
        - Check out our upcoming events: https://eklektikmama.com/events
        - Join our private member WhatsApp group (link will be sent separately)
        - Follow us on social media for exclusive member content
        - Keep an eye out for member-only special events
        
        If you have any questions, contact us at hello@eklektikmama.com
        
        Welcome to the family!
        The Eklektik Mama Team
      `
    };
    
    const result = await sendEmailViaService(email, emailContent);
    console.log('Member welcome email sent:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Error sending member welcome email:', error);
    throw error;
  }
};

// Payment confirmation email
export const sendPaymentConfirmationEmail = async (memberData, paymentData) => {
  try {
    const { firstName, email, membershipType } = memberData;
    const { amount, nextPaymentDate } = paymentData;
    
    const subject = `Payment Confirmed - Eklektik AF Membership`;
    
    const emailContent = {
      to_email: email,
      to_name: firstName,
      subject: subject,
      html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #093166; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .payment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Confirmed</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName},</h2>
            
            <p>Your ${membershipType} membership payment has been successfully processed!</p>
            
            <div class="payment-details">
              <h3>Payment Details:</h3>
              <p><strong>Amount:</strong> ${amount} AED</p>
              <p><strong>Membership Type:</strong> ${membershipType}</p>
              <p><strong>Next Payment:</strong> ${new Date(nextPaymentDate).toLocaleDateString()}</p>
            </div>
            
            <p>Your membership remains active and you can continue enjoying all member benefits.</p>
            
            <p>Thank you for being part of the Eklektik AF family!</p>
            
            <p>Best regards,<br>
            The Eklektik Mama Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
      text_content: `
        Payment Confirmed - Eklektik AF Membership
        
        Hi ${firstName},
        
        Your ${membershipType} membership payment has been successfully processed!
        
        Payment Details:
        - Amount: ${amount} AED
        - Membership Type: ${membershipType}
        - Next Payment: ${new Date(nextPaymentDate).toLocaleDateString()}
        
        Your membership remains active and you can continue enjoying all member benefits.
        
        Thank you for being part of the Eklektik AF family!
        
        Best regards,
        The Eklektik Mama Team
      `
    };
    
    const result = await sendEmailViaService(email, emailContent);
    console.log('Payment confirmation email sent:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};

// Membership renewal reminder email
export const sendRenewalReminderEmail = async (memberData) => {
  try {
    const { firstName, email, membershipType, currentPeriodEnd } = memberData;
    
    const subject = `Your Eklektik AF Membership Renews Soon`;
    
    const emailContent = {
      to_email: email,
      to_name: firstName,
      subject: subject,
      html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Membership Renewal Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b35; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #093166; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Membership Renewal Reminder</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName},</h2>
            
            <p>Your ${membershipType} Eklektik AF membership will renew automatically on <strong>${new Date(currentPeriodEnd).toLocaleDateString()}</strong>.</p>
            
            <p>No action is required from you - your membership will continue seamlessly, and you'll keep enjoying all your member benefits:</p>
            
            <ul>
              <li>10% discount on all event tickets</li>
              <li>Exclusive access to member-only events</li>
              <li>Priority booking for popular events</li>
              <li>Private WhatsApp group access</li>
              <li>Special perks from partner brands</li>
            </ul>
            
            <p>If you need to make any changes to your membership or have questions, please contact us at <a href="mailto:hello@eklektikmama.com">hello@eklektikmama.com</a>.</p>
            
            <p>Thank you for being part of our amazing community!</p>
            
            <p>Best regards,<br>
            The Eklektik Mama Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
      text_content: `
        Your Eklektik AF Membership Renews Soon
        
        Hi ${firstName},
        
        Your ${membershipType} Eklektik AF membership will renew automatically on ${new Date(currentPeriodEnd).toLocaleDateString()}.
        
        No action is required from you - your membership will continue seamlessly, and you'll keep enjoying all your member benefits:
        
        - 10% discount on all event tickets
        - Exclusive access to member-only events
        - Priority booking for popular events
        - Private WhatsApp group access
        - Special perks from partner brands
        
        If you need to make any changes to your membership or have questions, please contact us at hello@eklektikmama.com.
        
        Thank you for being part of our amazing community!
        
        Best regards,
        The Eklektik Mama Team
      `
    };
    
    const result = await sendEmailViaService(email, emailContent);
    console.log('Renewal reminder email sent:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Error sending renewal reminder email:', error);
    throw error;
  }
};
