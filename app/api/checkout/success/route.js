import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import Membership from "@/models/Membership";
import { google } from "googleapis";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";
import { updateMemberSavings, addBookingToEventSheet, getEventBookingsCount, addBookingToGeneralSheet } from "@/lib/googleSheets";

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

    // Extract all additional data from metadata
    const extractedData = {
      // Emergency contact information
      emergencyName: session.metadata.emergencyName || additionalData.emergencyName || '',
      emergencyPhone: session.metadata.emergencyPhone || additionalData.emergencyPhone || '',
      
      // Child information
      childAge: session.metadata.childAge || additionalData.childAge || '',
      childGender: session.metadata.childGender || additionalData.childGender || '',
      childDob: session.metadata.childDob || additionalData.childDob || '',
      
      // Allergy and dietary information
      dietaryRequirements: session.metadata.dietaryRequirements || (additionalData.allergies ? additionalData.allergies.join(', ') : '') || '',
      foodAllergies: session.metadata.foodAllergies || additionalData.foodAllergies || '',
      allergies: session.metadata.allergies || (Array.isArray(additionalData.allergies) ? additionalData.allergies.join(',') : additionalData.allergies) || '',
      
      // Medical information
      medicalConditions: session.metadata.medicalConditions || additionalData.medicalConditions || '',
      conditionDetails: session.metadata.conditionDetails || additionalData.conditionDetails || '',
      medicalInfo: session.metadata.medicalInfo || additionalData.medicalInfo || '',
      
      // MamaFit specific fields
      pregnant: session.metadata.pregnant || additionalData.pregnant || '',
      postpartum: session.metadata.postpartum || additionalData.postpartum || '',
      postpartumDuration: session.metadata.postpartumDuration || additionalData.postpartumDuration || '',
      fitnessLevel: session.metadata.fitnessLevel || additionalData.fitnessLevel || '',
      
      // Hello Chef specific fields
      cookingExperience: session.metadata.cookingExperience || additionalData.cookingExperience || '',
      favoriteFoods: session.metadata.favoriteFoods || additionalData.favoriteFoods || '',
      
      // Family Day specific fields
      parent1Name: session.metadata.parent1Name || additionalData.parent1Name || '',
      parent2Name: session.metadata.parent2Name || additionalData.parent2Name || '',
      parent1Phone: session.metadata.parent1Phone || additionalData.parent1Phone || '',
      parent2Phone: session.metadata.parent2Phone || additionalData.parent2Phone || '',
      child1Name: session.metadata.child1Name || additionalData.child1Name || '',
      child1Age: session.metadata.child1Age || additionalData.child1Age || '',
      child2Name: session.metadata.child2Name || additionalData.child2Name || '',
      child2Age: session.metadata.child2Age || additionalData.child2Age || '',
      child3Name: session.metadata.child3Name || additionalData.child3Name || '',
      child3Age: session.metadata.child3Age || additionalData.child3Age || '',
      child4Name: session.metadata.child4Name || additionalData.child4Name || '',
      child4Age: session.metadata.child4Age || additionalData.child4Age || '',
      numberOfChildren: session.metadata.numberOfChildren || additionalData.numberOfChildren || '',
      howDidYouHear: session.metadata.howDidYouHear || additionalData.howDidYouHear || '',
      
      // Special requests and preferences
      specialRequests: session.metadata.specialRequests || additionalData.specialRequests || '',
      tablePreferences: session.metadata.tablePreferences || additionalData.tablePreferences || '',
      additionalNotes: session.metadata.additionalNotes || additionalData.additionalNotes || '',
      notes: session.metadata.notes || additionalData.notes || '',
      
      // Consent fields
      waiverConsent: session.metadata.waiverConsent || additionalData.waiverConsent || ''
    };

    // Check if booking already exists (prevent duplicates from webhook processing)
    const existingBooking = await Booking.findOne({ transactionId });
    if (existingBooking) {
      console.log('Booking already exists, redirecting to ticket page');
      return NextResponse.redirect(new URL(`/ticket?session_id=${sessionId}`, req.url));
    }

    // Save to database with all additional data
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
      additionalData,
      eventSegment,
      isMember: isMember,
      memberSavings: memberSavings,
      choiceI,
      choiceII,
      choiceIII,
      ...extractedData
    });

    // Track member savings if applicable
    const isMemberValue = session.metadata.isMember === 'true';
    const memberSavingsValue = parseFloat(session.metadata.memberSavings || '0');
    
    if (isMemberValue && memberSavingsValue > 0) {
      try {
        // Update member's total savings in database
        await Membership.findOneAndUpdate(
          { email: userEmail.toLowerCase() },
          { $inc: { totalSavings: memberSavingsValue } }
        );
        
        // Update member's total savings in Google Sheets
        await updateMemberSavings(userEmail, memberSavingsValue);
        
        console.log(`Member ${userEmail} saved ${memberSavingsValue} AED on event booking`);
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
          // Add choice fields for all events
          choiceI,
          choiceII,
          choiceIII,
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
          }),
          ...(eventSegment === 'familyDay' && {
            parent1Name: additionalData.parent1Name || '',
            parent2Name: additionalData.parent2Name || '',
            parent1Phone: additionalData.parent1Phone || '',
            parent2Phone: additionalData.parent2Phone || '',
            child1Name: additionalData.child1Name || '',
            child1Age: additionalData.child1Age || '',
            child2Name: additionalData.child2Name || '',
            child2Age: additionalData.child2Age || '',
            child3Name: additionalData.child3Name || '',
            child3Age: additionalData.child3Age || '',
            child4Name: additionalData.child4Name || '',
            child4Age: additionalData.child4Age || '',
            numberOfChildren: additionalData.numberOfChildren || '',
            emergencyName: additionalData.emergencyName || '',
            emergencyPhone: additionalData.emergencyPhone || '',
            medicalInfo: additionalData.medicalInfo || '',
            howDidYouHear: additionalData.howDidYouHear || '',
            waiverConsent: additionalData.waiverConsent || '',
            photographyConsent: additionalData.photographyConsent || ''
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
        
        // Also add to general bookings sheet
        try {
          await addBookingToGeneralSheet(booking, event);
          console.log('Booking added to general bookings sheet');
        } catch (generalSheetError) {
          console.error('Error adding booking to general sheet:', generalSheetError);
          // Don't fail the process if general sheet fails
        }
        
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
    } else {
      // If event-specific sheet fails, still try to add to general sheet
      try {
        await addBookingToGeneralSheet(booking, event);
        console.log('Booking added to general bookings sheet (event-specific sheet not configured)');
        sheetsResult = { success: true, ticketNumber: 0 };
      } catch (generalSheetError) {
        console.error('Error adding booking to general sheet:', generalSheetError);
        sheetsResult = { success: false, error: generalSheetError.message };
      }
    }

    // Redirect to success page with booking details
    const successUrl = new URL(`/events/${eventId}/success?booking_id=${booking._id}`, req.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    return NextResponse.redirect(new URL('/events?error=processing_failed', req.url));
  }
}
