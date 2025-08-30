import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import QRCode from "qrcode";
import { google } from "googleapis";

export async function POST(req) {
  try {
    await connectDB();
    
    // Get the first available event for testing
    const testEvent = await Event.findOne({});
    if (!testEvent) {
      return NextResponse.json({ 
        error: 'No events found in database' 
      }, { status: 400 });
    }

    // Simulate webhook data
    const mockSession = {
      metadata: {
        eventId: testEvent._id.toString(),
        guardianName: 'Test Guardian',
        childName: 'Test Child',
        email: 'test@example.com',
        phone: '+1234567890',
        numberOfTickets: '2'
      },
      payment_intent: 'pi_test_' + Date.now(),
      id: 'cs_test_' + Date.now()
    };

    console.log('Simulating webhook with event:', testEvent.title);

    const transactionId = mockSession.payment_intent || mockSession.id;
    const guardianName = mockSession.metadata?.guardianName || '';
    const userEmail = mockSession.metadata?.email || '';
    const childName = mockSession.metadata?.childName || '';
    const phone = mockSession.metadata?.phone || '';
    const numberOfTickets = parseInt(mockSession.metadata?.numberOfTickets) || 1;

    console.log('Extracted booking data:', {
      guardianName,
      childName,
      userEmail,
      phone,
      numberOfTickets,
      transactionId
    });

    const qrPayload = JSON.stringify({
      eventId: testEvent._id,
      transactionId,
      email: userEmail,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    const booking = await Booking.create({
      eventId: testEvent._id,
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
    let sheetsResult = null;
    
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
          testEvent.title, // Event Title
          new Date(testEvent.date).toLocaleString('en-US', { timeZone: 'Asia/Dubai' }), // Event Date
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
        sheetsResult = {
          success: true,
          response: response.data
        };
        console.log('Successfully added booking to Google Sheets');
      } catch (sheetsError) {
        console.error('Google Sheets Error:', sheetsError);
        sheetsResult = {
          success: false,
          error: sheetsError.message,
          code: sheetsError.code
        };
      }
    } else {
      console.log('Google Sheets not configured - skipping sheet update');
      sheetsResult = {
        success: false,
        error: 'Google Sheets not configured'
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Test webhook processed successfully',
      booking: {
        id: booking._id,
        eventTitle: testEvent.title,
        guardianName,
        childName,
        userEmail,
        phone,
        numberOfTickets,
        transactionId
      },
      googleSheets: sheetsResult
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
