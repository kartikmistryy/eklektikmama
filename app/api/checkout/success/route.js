import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import { google } from "googleapis";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";

/**
 * Google Sheets Column Structure:
 * 
 * Common Columns (1-11): Booking Date/Time, Event Title, Event Date, Guardian Name, 
 * Child Name, Email, Phone, Tickets, Transaction ID, Payment Status, Timestamp
 * 
 * Event-Specific Columns:
 * - Cinema Morning: 7 additional fields (12-18)
 * - Mama Breakfast: 10 additional fields (12-21) 
 * - MamaFit: 5 additional fields (12-16)
 * - Eklektik Edit: 2 additional fields (12-13)
 * - Hello Chef: 9 additional fields (12-20)
 * 
 * IMPORTANT: All fields are included even if empty to maintain column alignment
 */

// Success handler that processes the payment and saves data
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.redirect(new URL('/events?error=no_session', req.url));
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL(`/events/${session.metadata.eventId}?error=payment_failed`, req.url));
    }

    // Connect to database
    await connectDB();
    
    const eventId = session.metadata.eventId;
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.redirect(new URL('/events?error=event_not_found', req.url));
    }

    // Check if booking already exists to prevent duplicates
    const transactionId = session.payment_intent || session.id;
    const existingBooking = await Booking.findOne({ transactionId });
    if (existingBooking) {
      return NextResponse.redirect(new URL(`/events/${eventId}?success=already_booked`, req.url));
    }

    // Extract booking data from session metadata
    const guardianName = session.metadata.guardianName || '';
    const userEmail = session.metadata.email || '';
    const childName = session.metadata.childName || '';
    const phone = session.metadata.phone || '';
    const numberOfTickets = parseInt(session.metadata.numberOfTickets) || 1;
    const eventSegment = session.metadata.eventSegment || '';
    const additionalData = session.metadata.additionalData ? JSON.parse(session.metadata.additionalData) : {};
    const photographyConsent = session.metadata.photographyConsent || 'No';
    
    // Extract dropdown choices directly from metadata
    const choiceI = session.metadata.choiceI || '';
    const choiceII = session.metadata.choiceII || '';
    const choiceIII = session.metadata.choiceIII || '';

    // QR code generation removed as requested

    // Save to database
    const booking = await Booking.create({
      eventId,
      guardianName,
      childName,
      userEmail,
      phone,
      numberOfTickets,
      transactionId,
      paymentStatus: 'paid',
      photographyConsent,
      additionalData
    });

    // Save to Google Sheets based on event segment
    let sheetsResult = { success: false, error: 'Not configured' };
    
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
          default:
            spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
        }

        if (spreadsheetId) {
          // Prepare the row data based on event segment
          let rowData = [
            new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }), // Booking Date/Time
            event.title, // Event Title
            new Date(event.date).toLocaleString('en-US', { timeZone: 'Asia/Dubai' }), // Event Date
            guardianName, // Guardian Name
            childName, // Child Name
            userEmail, // Email
            phone, // Phone
            numberOfTickets, // Number of Tickets
            transactionId, // Transaction ID
            'Paid', // Payment Status
            new Date().toISOString() // Timestamp
          ];

          // Add segment-specific fields - ensure all fields are present to maintain column alignment
          if (eventSegment === 'cinemaMorning') {
            // Cinema Morning fields (6 fields + photography consent)
            rowData.push(
              additionalData.emergencyName || '',
              additionalData.emergencyPhone || '',
              additionalData.childDob || '',
              additionalData.childAge || '',
              additionalData.allergies ? additionalData.allergies.join(', ') : '',
              additionalData.notes || '',
              photographyConsent
            );
          } else if (eventSegment === 'mamaBreakfast') {
            // Mama Breakfast fields (6 fields + 3 breakfast choices + photography consent = 10 fields total)
            rowData.push(
              additionalData.emergencyName || '',
              additionalData.emergencyPhone || '',
              additionalData.childDob || '',
              additionalData.childAge || '',
              additionalData.allergies ? additionalData.allergies.join(', ') : '',
              additionalData.notes || '',
              choiceI || '',
              choiceII || '',
              choiceIII || '',
              photographyConsent
            );
          } else if (eventSegment === 'mamaFit') {
            // MamaFit fields (4 fields + photography consent)
            rowData.push(
              additionalData.pregnant || '',
              additionalData.postpartum || '',
              additionalData.medicalConditions || '',
              additionalData.notes || '',
              photographyConsent
            );
          } else if (eventSegment === 'eklektikEdit') {
            // Eklektik Edit fields (1 field + photography consent)
            rowData.push(
              additionalData.notes || '',
              photographyConsent
            );
          } else if (eventSegment === 'helloChef') {
            // Hello Chef fields (6 fields + photography consent)
            rowData.push(
              additionalData.emergencyName || '',
              additionalData.emergencyPhone || '',
              additionalData.childDob || '',
              additionalData.childAge || '',
              additionalData.cookingExperience || '',
              additionalData.foodAllergies || '',
              additionalData.favoriteFoods || '',
              additionalData.notes || '',
              photographyConsent
            );
          }

          // Ensure all values are strings and handle undefined/null values
          rowData = rowData.map(value => {
            if (value === undefined || value === null) {
              return '';
            }
            return String(value);
          });
          
          // First, get the current data to find the next available row
          const currentData = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1!A:A',
          });
          
          // Find the next available row (start from row 2)
          const nextRow = Math.max(2, (currentData.data.values ? currentData.data.values.length : 1) + 1);
          
          // Calculate ticket number (row number - 1, since row 1 is header)
          const ticketNumber = nextRow - 1;
          
          // Update the specific row starting from row 2
          const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Sheet1!A${nextRow}:Z${nextRow}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [rowData],
            },
          });
          
          // Update booking with ticket number
          await Booking.findByIdAndUpdate(booking._id, {
            ticketNumber
          });
          
          sheetsResult = { success: true, response: response.data, ticketNumber };
          
          // Send booking confirmation email after successful Google Sheets update
          try {
            
            const emailResult = await sendBookingConfirmationEmail(
              {
                userEmail,
                guardianName,
                childName,
                numberOfTickets,
                transactionId,
                ticketNumber
              },
              {
                title: event.title,
                date: event.date,
                location: event.location,
                description: event.description,
                price: event.price,
                segment: event.segment,
                message: event.message,
                meetingLink: event.meetingLink
              }
            );
            
            // Don't fail the process if email fails
          } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the process if email fails
          }
        }
      } catch (sheetsError) {
        sheetsResult = { success: false, error: sheetsError.message };
      }
    }

    // Redirect to success page with booking details
    const successUrl = new URL(`/events/${eventId}/success?booking_id=${booking._id}`, req.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    return NextResponse.redirect(new URL('/events?error=processing_failed', req.url));
  }
}
