import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import QRCode from "qrcode";
import { google } from "googleapis";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');


  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Check if payment actually succeeded
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true, message: 'Payment not successful, skipping processing' });
    }
    
    try {
      await connectDB();
      const eventId = session.metadata?.eventId;
      
      const paidEvent = await Event.findById(eventId);
      if (!paidEvent) throw new Error('Event not found for booking');

      const transactionId = session.payment_intent || session.id;
      const guardianName = session.metadata?.guardianName || session.customer_details?.name || '';
      const userEmail = session.metadata?.email || session.customer_details?.email || '';
      const childName = session.metadata?.childName || '';
      const phone = session.metadata?.phone || '';
      const numberOfTickets = parseInt(session.metadata?.numberOfTickets) || 1;
      const photographyConsent = session.metadata?.photographyConsent || 'No';

      // Check if booking already exists to prevent duplicates
      const existingBooking = await Booking.findOne({ transactionId });
      if (existingBooking) {
        return NextResponse.json({ received: true, message: 'Booking already exists' });
      }


      const qrPayload = JSON.stringify({
        eventId,
        transactionId,
        email: userEmail,
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

      const booking = await Booking.create({
        eventId,
        guardianName,
        childName,
        userEmail,
        phone,
        numberOfTickets,
        transactionId,
        qrCodeDataUrl,
        paymentStatus: 'paid',
        photographyConsent,
      });


      // Append to Google Sheet if configured
      
      // Commenting out Google Sheets integration in webhook to avoid conflicts
      // Google Sheets integration is handled in the checkout success route
      /*
      if (
        process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
        process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      ) {
        try {
          const auth = new google.auth.JWT(
            process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            undefined,
            process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
            ["https://www.googleapis.com/auth/spreadsheets"]
          );
          
          const sheets = google.sheets({ version: 'v4', auth });
          
          // Prepare the row data
          const rowData = [
            new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }), // Booking Date/Time (Dubai timezone)
            paidEvent.title, // Event Title
            new Date(paidEvent.date).toLocaleString('en-US', { timeZone: 'Asia/Dubai' }), // Event Date
            guardianName, // Guardian Name
            childName, // Child Name
            userEmail, // Email
            phone, // Phone
            numberOfTickets, // Number of Tickets
            transactionId, // Transaction ID
            'Paid', // Payment Status
            new Date().toISOString() // Timestamp for reference
          ];
          
          
          const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
            range: 'Sheet1!A:K', // Specify columns A through K
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS', // Insert new row at the top
            requestBody: {
              values: [rowData],
            },
          });
          
          
          // Send booking confirmation email after successful Google Sheets update
          try {
            const emailResult = await sendBookingConfirmationEmail(
              {
                userEmail,
                guardianName,
                childName,
                numberOfTickets,
                transactionId,
                qrCodeDataUrl
              },
              {
                title: paidEvent.title,
                date: paidEvent.date,
                location: paidEvent.location,
                description: paidEvent.description,
                price: paidEvent.price
              }
            );
            
            if (emailResult.success) {
            } else {
            }
          } catch (emailError) {
            // Don't fail the webhook if email fails
          }
        } catch (sheetsError) {
          // Don't fail the webhook if Google Sheets fails
        }
      }
      */
    } catch (e) {
      return NextResponse.json({ received: true, error: e.message }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}


