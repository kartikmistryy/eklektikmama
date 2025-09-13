import { NextResponse } from "next/server";
import { generateEmailFriendlyQRCode, createTicketQRData } from "@/lib/qrCodeGenerator";

export async function GET(req, { params }) {
  try {
    const { transactionId } = await params;
    const { searchParams } = new URL(req.url);
    const ticketNumber = searchParams.get('ticketNumber');
    const eventTitle = searchParams.get('eventTitle');

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    // Create QR code data
    const qrData = createTicketQRData(transactionId, ticketNumber, eventTitle);
    
    // Generate QR code as buffer
    const QRCode = require('qrcode');
    const qrBuffer = await QRCode.toBuffer(qrData, {
      width: 180,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M',
      type: 'png'
    });

    // Return the image with proper headers
    return new NextResponse(qrBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': qrBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating QR code image:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
