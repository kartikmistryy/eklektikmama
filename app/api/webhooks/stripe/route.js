import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import QRCode from "qrcode";
import { google } from "googleapis";

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
    try {
      await connectDB();
      const eventId = session.metadata?.eventId;
      const paidEvent = await Event.findById(eventId);
      if (!paidEvent) throw new Error('Event not found for booking');

      const transactionId = session.payment_intent || session.id;
      const guardianName = session.customer_details?.name || '';
      const userEmail = session.customer_details?.email || '';
      const childName = '';

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
        transactionId,
        qrCodeDataUrl,
        paymentStatus: 'paid',
      });

      // Append to Google Sheet if configured
      if (
        process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
        process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      ) {
        const auth = new google.auth.JWT(
          process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          undefined,
          process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
          ["https://www.googleapis.com/auth/spreadsheets"]
        );
        const sheets = google.sheets({ version: 'v4', auth });
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          range: 'Sheet1!A1',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[
              '',
              paidEvent.title,
              new Date(paidEvent.date).toLocaleString(),
              guardianName,
              childName,
              transactionId,
            ]],
          },
        });
      }
    } catch (e) {
      return NextResponse.json({ received: true, error: e.message }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}


