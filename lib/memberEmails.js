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

// Membership cancellation confirmation email
export const sendCancellationConfirmationEmail = async (memberData) => {
  try {
    const { firstName, email, membershipType, currentPeriodEnd } = memberData;
    
    const subject = `Membership Cancellation Confirmed - Eklektik AF`;
    
    const emailContent = {
      to_email: email,
      to_name: firstName,
      subject: subject,
      html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Membership Cancellation Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .cta-button { display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .benefits-list { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Membership Cancellation Confirmed</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName},</h2>
            
            <p>We've received your request to cancel your Eklektik AF membership. Your cancellation has been processed successfully.</p>
            
            <div class="info-box">
              <h3>⚠️ Important Information</h3>
              <p><strong>Your membership will remain active until:</strong> ${new Date(currentPeriodEnd).toLocaleDateString()}</p>
              <p>You can continue enjoying all member benefits until this date.</p>
            </div>
            
            <div class="benefits-list">
              <h3>You still have access to:</h3>
              <ul>
                <li>10% discount on all event tickets</li>
                <li>Exclusive access to member-only events</li>
                <li>Priority booking for popular events</li>
                <li>Private WhatsApp group access</li>
                <li>Special perks from partner brands</li>
              </ul>
            </div>
            
            <h3>🔄 Want to Reactivate?</h3>
            <p>If you change your mind, you can reactivate your membership anytime before ${new Date(currentPeriodEnd).toLocaleDateString()} by visiting your <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/member-dashboard">Member Dashboard</a>.</p>
            
            <p>We're sorry to see you go! If there's anything we could have done better or if you have feedback, please don't hesitate to reach out to us at <a href="mailto:hello@eklektikmama.com">hello@eklektikmama.com</a>.</p>
            
            <p>Thank you for being part of the Eklektik AF community. We hope to welcome you back soon!</p>
            
            <p>Best regards,<br>
            The Eklektik Mama Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
      text_content: `
        Membership Cancellation Confirmed - Eklektik AF
        
        Hi ${firstName},
        
        We've received your request to cancel your Eklektik AF membership. Your cancellation has been processed successfully.
        
        IMPORTANT INFORMATION:
        Your membership will remain active until: ${new Date(currentPeriodEnd).toLocaleDateString()}
        You can continue enjoying all member benefits until this date.
        
        You still have access to:
        - 10% discount on all event tickets
        - Exclusive access to member-only events
        - Priority booking for popular events
        - Private WhatsApp group access
        - Special perks from partner brands
        
        WANT TO REACTIVATE?
        If you change your mind, you can reactivate your membership anytime before ${new Date(currentPeriodEnd).toLocaleDateString()} by visiting your Member Dashboard.
        
        We're sorry to see you go! If there's anything we could have done better or if you have feedback, please don't hesitate to reach out to us at hello@eklektikmama.com.
        
        Thank you for being part of the Eklektik AF community. We hope to welcome you back soon!
        
        Best regards,
        The Eklektik Mama Team
      `
    };
    
    const result = await sendEmailViaService(email, emailContent);
    console.log('Cancellation confirmation email sent:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Error sending cancellation confirmation email:', error);
    throw error;
  }
};

// Membership cancellation verification email
export const sendCancellationVerificationEmail = async (memberData) => {
  try {
    const { firstName, email, membershipType, currentPeriodEnd, verificationToken } = memberData;
    
    const subject = `Verify Your Membership Cancellation - Eklektik AF`;
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/membership/confirm-cancellation?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    const emailContent = {
      to_email: email,
      to_name: firstName,
      subject: subject,
      html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Membership Cancellation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .verify-button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
          .security-notice { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verify Your Cancellation Request</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName},</h2>
            
            <p>We received a request to cancel your Eklektik AF membership. To ensure this request is legitimate, please verify your cancellation by clicking the button below.</p>
            
            <div class="warning-box">
              <h3>⚠️ Important Security Notice</h3>
              <p>This verification link will expire in <strong>15 minutes</strong> for your security. If you didn't request this cancellation, please ignore this email and contact us immediately.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="verify-button">Verify Cancellation Request</a>
            </div>
            
            <div class="security-notice">
              <h3>🔒 Security Information</h3>
              <p><strong>Membership Details:</strong></p>
              <ul>
                <li>Type: ${membershipType}</li>
                <li>Access until: ${new Date(currentPeriodEnd).toLocaleDateString()}</li>
                <li>Request time: ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Click the verification button above</li>
              <li>Your membership will be cancelled at the end of your current billing period</li>
              <li>You'll retain access to all benefits until ${new Date(currentPeriodEnd).toLocaleDateString()}</li>
              <li>You can reactivate anytime before the end of your period</li>
            </ul>
            
            <p>If you didn't request this cancellation or have any concerns, please contact us immediately at <a href="mailto:hello@eklektikmama.com">hello@eklektikmama.com</a>.</p>
            
            <p>Best regards,<br>
            The Eklektik Mama Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
      text_content: `
        Verify Your Membership Cancellation - Eklektik AF
        
        Hi ${firstName},
        
        We received a request to cancel your Eklektik AF membership. To ensure this request is legitimate, please verify your cancellation by visiting the link below.
        
        VERIFICATION LINK: ${verificationUrl}
        
        IMPORTANT SECURITY NOTICE:
        This verification link will expire in 15 minutes for your security. If you didn't request this cancellation, please ignore this email and contact us immediately.
        
        MEMBERSHIP DETAILS:
        - Type: ${membershipType}
        - Access until: ${new Date(currentPeriodEnd).toLocaleDateString()}
        - Request time: ${new Date().toLocaleString()}
        
        WHAT HAPPENS NEXT:
        1. Click the verification link above
        2. Your membership will be cancelled at the end of your current billing period
        3. You'll retain access to all benefits until ${new Date(currentPeriodEnd).toLocaleDateString()}
        4. You can reactivate anytime before the end of your period
        
        If you didn't request this cancellation or have any concerns, please contact us immediately at hello@eklektikmama.com.
        
        Best regards,
        The Eklektik Mama Team
      `
    };
    
    const result = await sendEmailViaService(email, emailContent);
    console.log('Cancellation verification email sent:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Error sending cancellation verification email:', error);
    throw error;
  }
};

// Membership cancellation code email
export const sendCancellationCodeEmail = async (memberData) => {
  try {
    const { firstName, email, membershipType, currentPeriodEnd, cancellationCode } = memberData;
    
    const subject = `Your Cancellation Code - Eklektik AF`;
    
    const emailContent = {
      to_email: email,
      to_name: firstName,
      subject: subject,
      html_content: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Cancellation Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: #f3f4f6; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px; margin: 10px 0; }
          .warning-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .info-box { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Your Cancellation Code</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName},</h2>
            
            <p>You requested to cancel your Eklektik AF membership. To confirm this request, please enter the 6-digit code below in your member dashboard.</p>
            
            <div class="code-box">
              <h3>Your Cancellation Code</h3>
              <div class="code">${cancellationCode}</div>
              <p><strong>This code expires in 10 minutes</strong></p>
            </div>
            
            <div class="warning-box">
              <h3>⚠️ Important Information</h3>
              <p><strong>Your membership will remain active until:</strong> ${new Date(currentPeriodEnd).toLocaleDateString()}</p>
              <p>You can continue enjoying all member benefits until this date, even after cancellation.</p>
            </div>
            
            <div class="info-box">
              <h3>🔒 How to Complete Cancellation</h3>
              <ol>
                <li>Go to your <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/member-dashboard">Member Dashboard</a></li>
                <li>Enter your email address</li>
                <li>Enter the 6-digit code above</li>
                <li>Click "Confirm Cancellation"</li>
              </ol>
            </div>
            
            <p><strong>What happens after cancellation?</strong></p>
            <ul>
              <li>Your membership will end on ${new Date(currentPeriodEnd).toLocaleDateString()}</li>
              <li>You'll retain access to all benefits until then</li>
              <li>You can reactivate anytime before the end of your period</li>
              <li>No further payments will be charged</li>
            </ul>
            
            <p>If you didn't request this cancellation or have any concerns, please contact us immediately at <a href="mailto:hello@eklektikmama.com">hello@eklektikmama.com</a>.</p>
            
            <p>Best regards,<br>
            The Eklektik Mama Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
      text_content: `
        Your Cancellation Code - Eklektik AF
        
        Hi ${firstName},
        
        You requested to cancel your Eklektik AF membership. To confirm this request, please enter the 6-digit code below in your member dashboard.
        
        YOUR CANCELLATION CODE: ${cancellationCode}
        (This code expires in 10 minutes)
        
        IMPORTANT INFORMATION:
        Your membership will remain active until: ${new Date(currentPeriodEnd).toLocaleDateString()}
        You can continue enjoying all member benefits until this date, even after cancellation.
        
        HOW TO COMPLETE CANCELLATION:
        1. Go to your Member Dashboard
        2. Enter your email address
        3. Enter the 6-digit code above
        4. Click "Confirm Cancellation"
        
        WHAT HAPPENS AFTER CANCELLATION:
        - Your membership will end on ${new Date(currentPeriodEnd).toLocaleDateString()}
        - You'll retain access to all benefits until then
        - You can reactivate anytime before the end of your period
        - No further payments will be charged
        
        If you didn't request this cancellation or have any concerns, please contact us immediately at hello@eklektikmama.com.
        
        Best regards,
        The Eklektik Mama Team
      `
    };
    
    const result = await sendEmailViaService(email, emailContent);
    console.log('Cancellation code email sent:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Error sending cancellation code email:', error);
    throw error;
  }
};
