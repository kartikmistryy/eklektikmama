import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import Membership from "@/models/Membership";
import { google } from "googleapis";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";
import { updateMemberSavings, addBookingToEventSheet, getEventBookingsCount } from "@/lib/googleSheets";

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

    // Enforce booking cutoff here as well in case payment completes after deadline
    const now = new Date();
    if (event.bookingDeadline) {
      const bookingDeadline = new Date(event.bookingDeadline);
      if (!isNaN(bookingDeadline.getTime()) && now > bookingDeadline) {
        return NextResponse.redirect(new URL(`/events/${eventId}?error=booking_closed`, req.url));
      }
    }

    // Also prevent recording bookings after the event has passed
    const eventEndDate = event.endDate ? new Date(event.endDate) : (event.date ? new Date(event.date) : null);
    if (eventEndDate && !isNaN(eventEndDate.getTime()) && now > eventEndDate) {
      return NextResponse.redirect(new URL(`/events/${eventId}?error=event_passed`, req.url));
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

    // Track member savings if applicable
    const isMember = session.metadata.isMember === 'true';
    const memberSavings = parseFloat(session.metadata.memberSavings || '0');
    
    if (isMember && memberSavings > 0) {
      try {
        // Update member's total savings in database
        await Membership.findOneAndUpdate(
          { email: userEmail.toLowerCase() },
          { $inc: { totalSavings: memberSavings } }
        );
        
        // Update member's total savings in Google Sheets
        await updateMemberSavings(userEmail, memberSavings);
        
        console.log(`Member ${userEmail} saved ${memberSavings} AED on event booking`);
      } catch (savingsError) {
        console.error('Error tracking member savings:', savingsError);
        // Don't fail the process if savings tracking fails
      }
    }

    // Save to Google Sheets based on event segment
    let sheetsResult = { success: false, error: 'Not configured' };
    
    // Add booking to event-specific Google Sheet
    if (eventSegment && process.env.GOOGLE_SHEETS_CLIENT_EMAIL && process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      try {
        // Prepare booking data for the new event-specific sheet
        const bookingData = {
          guardianName,
          childName,
          email: userEmail,
          phone,
          numberOfTickets,
          transactionId,
          paymentStatus: 'paid',
          photographyConsent,
          // Add segment-specific data
          ...(eventSegment === 'cinemaMorning' && {
            emergencyContact: additionalData.emergencyName || '',
            emergencyPhone: additionalData.emergencyPhone || '',
            childAge: additionalData.childAge || '',
            childGender: additionalData.childGender || '',
            dietaryRequirements: additionalData.allergies ? additionalData.allergies.join(', ') : '',
            medicalConditions: additionalData.medicalConditions || ''
          }),
          ...(eventSegment === 'mamaBreakfast' && {
            emergencyContact: additionalData.emergencyName || '',
            emergencyPhone: additionalData.emergencyPhone || '',
            childAge: additionalData.childAge || '',
            childGender: additionalData.childGender || '',
            dietaryRequirements: additionalData.allergies ? additionalData.allergies.join(', ') : '',
            medicalConditions: additionalData.medicalConditions || '',
            specialRequests: additionalData.specialRequests || '',
            tablePreferences: additionalData.tablePreferences || '',
            additionalNotes: additionalData.notes || ''
          }),
          ...(eventSegment === 'mamaFit' && {
            fitnessLevel: additionalData.fitnessLevel || '',
            medicalConditions: additionalData.medicalConditions || '',
            emergencyContact: additionalData.emergencyName || '',
            emergencyPhone: additionalData.emergencyPhone || ''
          }),
          ...(eventSegment === 'eklektikEdit' && {
            additionalNotes: additionalData.notes || ''
          })
        };

        // Add booking to event-specific sheet
        await addBookingToEventSheet(bookingData, event);
        
        // Get ticket number from the sheet (we'll calculate it based on row position)
        const ticketNumber = await getEventBookingsCount(event);
        
        // Update booking with ticket number
        await Booking.findByIdAndUpdate(booking._id, {
          ticketNumber
        });
        
        sheetsResult = { success: true, ticketNumber };
        
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
      } catch (sheetsError) {
        console.error('Error adding booking to event sheet:', sheetsError);
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
