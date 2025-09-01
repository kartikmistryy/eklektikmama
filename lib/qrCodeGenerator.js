import QRCode from 'qrcode';

// Generate QR code that's more compatible with email clients
export async function generateEmailFriendlyQRCode(data) {
  try {
    // Generate QR code with better settings for email compatibility
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'M', // Medium error correction
      type: 'image/png',
      quality: 0.92,
      margin: 2, // Smaller margin for better email display
      color: {
        dark: '#000000', // Black
        light: '#FFFFFF' // White
      },
      width: 256 // Larger size for better visibility
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
export function createQRCodeSection(qrCodeDataUrl, transactionId, fallbackText = null) {
  if (qrCodeDataUrl) {
    return `
      <div style="text-align: center; margin: 20px 0; background: white; padding: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0; color: #093166;">📱 Entry QR Code</h2>
        <p>Show this QR code at the event entrance for quick check-in:</p>
        
        <!-- QR Code Image -->
        <img src="${qrCodeDataUrl}" 
             alt="Entry QR Code" 
             style="max-width: 200px; border: 2px solid #ddd; border-radius: 8px; display: block; margin: 0 auto;"
             width="200"
             height="200">
        
        <p style="margin-top: 10px; font-size: 12px; color: #666;">
          <small>Please save this QR code or take a screenshot for easy access</small>
        </p>
        
        <!-- Fallback for email clients that block images -->
        <div style="margin-top: 15px; font-size: 12px; color: #6c757d; background: #f8f9fa; padding: 10px; border-radius: 4px;">
          <strong>Alternative Entry:</strong> You can also show your booking ID (${transactionId}) and email address at the entrance.
        </div>
      </div>
    `;
  } else {
    return `
      <div style="text-align: center; margin: 20px 0; background: white; padding: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0; color: #093166;">📱 Entry QR Code</h2>
        <p>Show this QR code at the event entrance for quick check-in:</p>
        
        <div style="background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; text-align: center; margin: 10px 0;">
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            <strong>QR Code Generated</strong><br>
            Your entry QR code has been generated and is ready for use.<br>
            <small>If the QR code doesn't display, please check your email settings or contact support.</small>
          </p>
        </div>
        
        <div style="margin-top: 15px; font-size: 12px; color: #6c757d; background: #f8f9fa; padding: 10px; border-radius: 4px;">
          <strong>Alternative Entry:</strong> You can also show your booking ID (${transactionId}) and email address at the entrance.
        </div>
      </div>
    `;
  }
}
