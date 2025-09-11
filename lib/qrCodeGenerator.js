import QRCode from 'qrcode';

// Generate QR code that's more compatible with email clients
export async function generateEmailFriendlyQRCode(data) {
  try {
    // Generate QR code with better settings for email compatibility
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H', // High error correction for better email compatibility
      type: 'image/png',
      quality: 1.0, // Maximum quality
      margin: 4, // Adequate margin for email clients
      color: {
        dark: '#000000', // Pure black
        light: '#FFFFFF' // Pure white
      },
      width: 300, // Larger size for better visibility in emails
      scale: 4 // Higher scale for better quality
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

// Generate a fallback QR code text representation
export function generateQRCodeText(data) {
  const text = JSON.stringify(data);
  return `QR Code Data: ${text}`;
}

// Create a QR code section that works better in emails
export function createQRCodeSection(qrCodeDataUrl, transactionId, ticketNumber = null, ticketUrl = null) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eklektikmama.com';
  
  return `
    <div style="text-align: center; margin: 20px 0; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h2 style="margin-top: 0; color: #093166;">📱 Entry QR Code</h2>
      <p>Show this QR code at the event entrance for quick check-in:</p>
      
      ${qrCodeDataUrl ? `
      <!-- QR Code Image -->
      <div style="text-align: center; margin: 20px 0; background: white; padding: 10px; border-radius: 8px; border: 2px solid #ddd;">
        <img src="${qrCodeDataUrl}" 
             alt="Entry QR Code" 
             style="max-width: 200px; display: block; margin: 0 auto; background: white;"
             width="200"
             height="200">
      </div>
      ` : `
      <!-- QR Code Placeholder -->
      <div style="background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 40px; margin: 20px 0;">
        <p style="margin: 0; color: #6c757d; font-size: 16px;">
          <strong>📱 QR Code Generated</strong><br>
          <small>Your entry QR code is ready for use at the event.</small>
        </p>
      </div>
      `}
      
      <p style="margin-top: 10px; font-size: 12px; color: #666;">
        <small>Please save this QR code or take a screenshot for easy access</small>
      </p>
      
      <!-- Alternative Entry Methods -->
      <div style="margin-top: 15px; font-size: 12px; color: #6c757d; background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: left;">
        <strong>Alternative Entry Methods:</strong><br>
        • Show your booking ID: <strong>${transactionId}</strong><br>
        ${ticketNumber ? `• Show your ticket number: <strong>#${ticketNumber}</strong><br>` : ''}
        ${ticketUrl ? `• View your ticket online: <a href="${ticketUrl}" style="color: #db4e9f;">Click here</a><br>` : ''}
        • Show your email address at the entrance
      </div>
    </div>
  `;
}
