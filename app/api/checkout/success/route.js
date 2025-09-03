import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import QRCode from "qrcode";
import { google } from "googleapis";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";

/**
 * Google Sheets Column Structure:
 * 
 * Common Columns (1-11): Booking Date/Time, Event Title, Event Date, Guardian Name, 
 * Child Name, Email, Phone, Tickets, Transaction ID, Payment Status, Timestamp
 * 
 * Event-Specific Columns:
 * - Cinema Morning: 6 additional fields (12-17)
 * - Mama Breakfast: 9 additional fields (12-20) 
 * - MamaFit: 4 additional fields (12-15)
 * - Eklektik Edit: 1 additional field (12)
 * - Hello Chef: 8 additional fields (12-19)
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
      console.log('Booking already exists, redirecting to success page');
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
    
    // Extract dropdown choices directly from metadata
    const choiceI = session.metadata.choiceI || '';
    const choiceII = session.metadata.choiceII || '';
    const choiceIII = session.metadata.choiceIII || '';

    // Generate QR code
    const qrPayload = JSON.stringify({
      eventId,
      transactionId,
      email: userEmail,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    // Save to database
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
      additionalData
    });

    console.log('Booking created in database:', booking._id);

    // Save to Google Sheets based on event segment
    let sheetsResult = { success: false, error: 'Not configured' };
    
    console.log('=== GOOGLE SHEETS DEBUG ===');
    console.log('Event segment:', eventSegment);
    console.log('GOOGLE_SHEETS_CLIENT_EMAIL:', !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
    console.log('GOOGLE_SHEETS_PRIVATE_KEY:', !!process.env.GOOGLE_SHEETS_PRIVATE_KEY);
    console.log('Additional data:', additionalData);
    console.log('Choice I from additionalData:', additionalData.choiceI);
    console.log('Choice II from additionalData:', additionalData.choiceII);
    console.log('Choice III from additionalData:', additionalData.choiceIII);
    console.log('Choice I from metadata:', choiceI);
    console.log('Choice II from metadata:', choiceII);
    console.log('Choice III from metadata:', choiceIII);
    
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
            // Cinema Morning fields (6 fields)
            rowData.push(
              additionalData.emergencyName || '',
              additionalData.emergencyPhone || '',
              additionalData.childDob || '',
              additionalData.childAge || '',
              additionalData.allergies ? additionalData.allergies.join(', ') : '',
              additionalData.notes || ''
            );
          } else if (eventSegment === 'mamaBreakfast') {
            // Mama Breakfast fields (6 fields + 3 breakfast choices = 9 fields total)
            rowData.push(
              additionalData.emergencyName || '',
              additionalData.emergencyPhone || '',
              additionalData.childDob || '',
              additionalData.childAge || '',
              additionalData.allergies ? additionalData.allergies.join(', ') : '',
              additionalData.notes || '',
              choiceI || '',
              choiceII || '',
              choiceIII || ''
            );
          } else if (eventSegment === 'mamaFit') {
            // MamaFit fields (4 fields)
            rowData.push(
              additionalData.pregnant || '',
              additionalData.postpartum || '',
              additionalData.medicalConditions || '',
              additionalData.notes || ''
            );
          } else if (eventSegment === 'eklektikEdit') {
            // Eklektik Edit fields (1 field)
            rowData.push(
              additionalData.notes || ''
            );
          } else if (eventSegment === 'helloChef') {
            // Hello Chef fields (6 fields)
            rowData.push(
              additionalData.emergencyName || '',
              additionalData.emergencyPhone || '',
              additionalData.childDob || '',
              additionalData.childAge || '',
              additionalData.cookingExperience || '',
              additionalData.foodAllergies || '',
              additionalData.favoriteFoods || '',
              additionalData.notes || ''
            );
          }

          // Debug logging for Google Sheets data
          console.log('=== GOOGLE SHEETS DATA DEBUG ===');
          console.log('Event segment:', eventSegment);
          console.log('Row data length:', rowData.length);
          console.log('Row data:', rowData);
          console.log('Column structure:');
          rowData.forEach((value, index) => {
            console.log(`Column ${index + 1}: ${value}`);
          });
          
          // Ensure all values are strings and handle undefined/null values
          rowData = rowData.map(value => {
            if (value === undefined || value === null) {
              return '';
            }
            return String(value);
          });
          
          console.log('Processed row data:', rowData);
          
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
          
          sheetsResult = { success: true, response: response.data };
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
                title: event.title,
                date: event.date,
                location: event.location,
                description: event.description,
                price: event.price
              }
            );
            
            if (emailResult.success) {
              console.log('Booking confirmation email sent successfully');
            } else {
              console.error('Failed to send booking confirmation email:', emailResult.error);
            }
          } catch (emailError) {
            console.error('Error sending booking confirmation email:', emailError);
            // Don't fail the process if email fails
          }
        }
      } catch (sheetsError) {
        console.error('Google Sheets Error:', sheetsError);
        sheetsResult = { success: false, error: sheetsError.message };
      }
    }

    // Redirect to success page with booking details
    const successUrl = new URL(`/events/${eventId}/success?booking_id=${booking._id}`, req.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.redirect(new URL('/events?error=processing_failed', req.url));
  }
}
