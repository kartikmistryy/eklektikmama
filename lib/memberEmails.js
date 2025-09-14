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

    // Add attachments if they exist
    if (emailContent.attachments && emailContent.attachments.length > 0) {
      payload.attachments = emailContent.attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content || attachment.path, // Resend expects base64 content or file path
      }));
    }

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
  const payload = {
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
  };

  // Add attachments if they exist
  if (emailContent.attachments && emailContent.attachments.length > 0) {
    payload.attachments = emailContent.attachments.map(attachment => ({
      filename: attachment.filename,
      content: attachment.content || attachment.path, // SendGrid expects base64 content
      type: 'application/pdf',
      disposition: 'attachment',
    }));
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
    
    // Import the new email templates
    const { generateAnnualMembershipWelcomeEmail, generateMonthlyMembershipWelcomeEmail } = await import('./emailTemplates.js');
    
    // Generate the appropriate email based on membership type
    let emailContent;
    if (membershipType === 'annual') {
      emailContent = generateAnnualMembershipWelcomeEmail(firstName, email);
    } else {
      emailContent = generateMonthlyMembershipWelcomeEmail(firstName, email);
    }
    
    // Send the email using the existing service
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
