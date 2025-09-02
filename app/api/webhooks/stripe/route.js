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

  console.log('Webhook received:', { 
    hasSecret: !!secret, 
    hasPayload: !!payload, 
    hasSignature: !!sig 
  });

  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    event = stripe.webhooks.constructEvent(payload, sig, secret);
    console.log('Webhook event type:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    console.log('Processing checkout.session.completed event');
    const session = event.data.object;
    
    // Check if payment actually succeeded
    if (session.payment_status !== 'paid') {
      console.log('Payment not successful, skipping processing. Payment status:', session.payment_status);
      return NextResponse.json({ received: true, message: 'Payment not successful, skipping processing' });
    }
    
    console.log('Payment successful, processing booking...');
    
    try {
      await connectDB();
      const eventId = session.metadata?.eventId;
      console.log('Event ID from metadata:', eventId);
      
      const paidEvent = await Event.findById(eventId);
      if (!paidEvent) throw new Error('Event not found for booking');
      console.log('Found event:', paidEvent.title);

      const transactionId = session.payment_intent || session.id;
      const guardianName = session.metadata?.guardianName || session.customer_details?.name || '';
      const userEmail = session.metadata?.email || session.customer_details?.email || '';
      const childName = session.metadata?.childName || '';
      const phone = session.metadata?.phone || '';
      const numberOfTickets = parseInt(session.metadata?.numberOfTickets) || 1;

      // Check if booking already exists to prevent duplicates
      const existingBooking = await Booking.findOne({ transactionId });
      if (existingBooking) {
        console.log('Booking already exists, skipping duplicate processing');
        return NextResponse.json({ received: true, message: 'Booking already exists' });
      }

      console.log('Extracted booking data:', {
        guardianName,
        childName,
        userEmail,
        phone,
        numberOfTickets,
        transactionId
      });

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
      });

      console.log('Booking created in database:', booking._id);

      // Append to Google Sheet if configured
      console.log('Checking Google Sheets configuration...');
      console.log('GOOGLE_SHEETS_CLIENT_EMAIL:', !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
      console.log('GOOGLE_SHEETS_PRIVATE_KEY:', !!process.env.GOOGLE_SHEETS_PRIVATE_KEY);
      console.log('GOOGLE_SHEETS_SPREADSHEET_ID:', !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
      
      if (
        process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
        process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      ) {
        try {
          console.log('Attempting to add to Google Sheets...');
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
          
          console.log('Row data to add:', rowData);
          
          const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
            range: 'Sheet1!A:K', // Specify columns A through K
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS', // Insert new row at the top
            requestBody: {
              values: [rowData],
            },
          });
          
          console.log('Google Sheets response:', response.data);
          console.log('Successfully added booking to Google Sheets');
          
          // Send booking confirmation email after successful Google Sheets update
          try {
            console.log('Sending booking confirmation email...');
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
              console.log('Booking confirmation email sent successfully');
            } else {
              console.error('Failed to send booking confirmation email:', emailResult.error);
            }
          } catch (emailError) {
            console.error('Error sending booking confirmation email:', emailError);
            // Don't fail the webhook if email fails
          }
        } catch (sheetsError) {
          console.error('Google Sheets Error:', sheetsError);
          console.error('Error details:', {
            message: sheetsError.message,
            code: sheetsError.code,
            status: sheetsError.status
          });
          // Don't fail the webhook if Google Sheets fails
        }
      } else {
        console.log('Google Sheets not configured - skipping sheet update');
        console.log('Missing environment variables:', {
          clientEmail: !process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          privateKey: !process.env.GOOGLE_SHEETS_PRIVATE_KEY,
          spreadsheetId: !process.env.GOOGLE_SHEETS_SPREADSHEET_ID
        });
      }
    } catch (e) {
      console.error('Error processing webhook:', e);
      return NextResponse.json({ received: true, error: e.message }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}


