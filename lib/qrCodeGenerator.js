// QR Code functionality has been disabled as requested
// import QRCode from 'qrcode';

// Generate QR code that's more compatible with email clients
export async function generateEmailFriendlyQRCode(data) {
  // QR code generation disabled
  console.log('QR code generation disabled - returning null');
  return null;
}

// Generate a fallback QR code text representation
export function generateQRCodeText(data) {
  // QR code text generation disabled
  return 'QR Code functionality disabled';
}

// Create a QR code section that works better in emails
export function createQRCodeSection(qrCodeDataUrl, transactionId, ticketNumber = null, ticketUrl = null) {
  // QR code section disabled - return alternative entry information
  return `
    <div style="text-align: center; margin: 20px 0; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h2 style="margin-top: 0; color: #093166;">🎫 Entry Information</h2>
      <p>Please bring the following for event entry:</p>
      
      <!-- Alternative Entry Methods -->
      <div style="margin-top: 15px; font-size: 14px; color: #333; background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: left;">
        <strong>Entry Methods:</strong><br>
        • Show your booking ID: <strong>${transactionId}</strong><br>
        ${ticketNumber ? `• Show your ticket number: <strong>#${ticketNumber}</strong><br>` : ''}
        ${ticketUrl ? `• View your ticket online: <a href="${ticketUrl}" style="color: #db4e9f;">Click here</a><br>` : ''}
        • Show your email address at the entrance
      </div>
    </div>
  `;
}
