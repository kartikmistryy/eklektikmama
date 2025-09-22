import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import { google } from "googleapis";

export async function POST(req) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Get the event for testing, or use provided eventId
    let testEvent;
    if (body.eventId) {
      testEvent = await Event.findById(body.eventId);
    } else {
      testEvent = await Event.findOne({});
    }
    
    if (!testEvent) {
      return NextResponse.json({ 
        error: 'No events found in database' 
      }, { status: 400 });
    }

    // Use provided data or simulate webhook data
    const mockSession = body.mockSession || {
      metadata: {
        eventId: testEvent._id.toString(),
        eventSegment: body.eventSegment || 'cinemaMorning',
        guardianName: body.guardianName || 'Test Guardian',
        childName: body.childName || 'Test Child',
        email: body.email || 'test@example.com',
        phone: body.phone || '+1234567890',
        numberOfTickets: String(body.numberOfTickets || 1),
        additionalData: JSON.stringify(body)
      },
      payment_intent: 'pi_test_' + Date.now(),
      id: 'cs_test_' + Date.now()
    };


    const transactionId = mockSession.payment_intent || mockSession.id;
    const guardianName = mockSession.metadata?.guardianName || '';
    const userEmail = mockSession.metadata?.email || '';
    const childName = mockSession.metadata?.childName || '';
    const phone = mockSession.metadata?.phone || '';
    const numberOfTickets = parseInt(mockSession.metadata?.numberOfTickets) || 1;
    const eventSegment = mockSession.metadata?.eventSegment || '';
    const additionalData = mockSession.metadata?.additionalData ? JSON.parse(mockSession.metadata.additionalData) : {};


    // QR code generation removed as requested

    const booking = await Booking.create({
      eventId: testEvent._id,
      guardianName,
      childName,
      userEmail,
      phone,
      numberOfTickets,
      transactionId,
      paymentStatus: 'paid',
      additionalData
    });

    // Append to Google Sheet if configured
    let sheetsResult = null;
    
    if (eventSegment && process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      try {
        const auth = new google.auth.JWT(
          process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          undefined,
          process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
          ["https://www.googleapis.com/auth/spreadsheets"]
        );
        
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Get the correct spreadsheet ID based on event segment
        let spreadsheetId;
        switch (eventSegment) {
          case 'cinemaMorning':
            spreadsheetId = process.env.CINEMA_MORNING_SPREADSHEET_ID;
            break;
          case 'mamaBreakfast':
            spreadsheetId = process.env.MAMA_BREAKFAST_SPREADSHEET_ID;
            break;
          case 'mamaFit':
            spreadsheetId = process.env.MAMAFIT_SPREADSHEET_ID;
            break;
          case 'eklektikEdit':
            spreadsheetId = process.env.EKLEKTIK_EDIT_SPREADSHEET_ID;
            break;
          case 'familyDay':
            spreadsheetId = process.env.FAMILY_DAY_SPREADSHEET_ID;
            break;
          default:
            spreadsheetId = null;
        }


        if (spreadsheetId) {
          // Prepare the row data based on event segment
          let rowData = [
            new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }), // Booking Date/Time
            testEvent.title, // Event Title
            new Date(testEvent.date).toLocaleString('en-US', { timeZone: 'Asia/Dubai' }), // Event Date
            guardianName, // Guardian Name
            childName, // Child Name
            userEmail, // Email
            phone, // Phone
            numberOfTickets, // Number of Tickets
            transactionId, // Transaction ID
            'Paid', // Payment Status
            new Date().toISOString() // Timestamp
          ];

          // Add segment-specific fields
          if (eventSegment === 'cinemaMorning' || eventSegment === 'mamaBreakfast') {
            rowData.push(
              additionalData.emergencyName || '',
              additionalData.emergencyPhone || '',
              additionalData.childDob || '',
              additionalData.childAge || '',
              additionalData.allergies ? additionalData.allergies.join(', ') : '',
              additionalData.notes || ''
            );
          } else if (eventSegment === 'mamaFit') {
            rowData.push(
              additionalData.pregnant || '',
              additionalData.postpartum || '',
              additionalData.medicalConditions || '',
              additionalData.notes || ''
            );
          } else if (eventSegment === 'eklektikEdit') {
            rowData.push(
              additionalData.notes || ''
            );
          }

          
          // First, get the current data to find the next available row
          const currentData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:A',
          });
          
          // Find the next available row (start from row 2)
          const nextRow = Math.max(2, (currentData.data.values ? currentData.data.values.length : 1) + 1);
          
          // Update the specific row starting from row 2
          const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Sheet1!A${nextRow}:Z${nextRow}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [rowData],
            },
          });
          
          sheetsResult = {
            success: true,
            response: response.data
          };
        } else {
          sheetsResult = {
            success: false,
            error: `No spreadsheet ID configured for segment: ${eventSegment}`
          };
        }
      } catch (sheetsError) {
        console.error('Google Sheets Error:', sheetsError);
        sheetsResult = {
          success: false,
          error: sheetsError.message,
          code: sheetsError.code
        };
      }
    } else {
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
        transactionId,
        eventSegment
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
