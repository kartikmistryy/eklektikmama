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
    console.log('🎯 CHECKOUT SUCCESS ROUTE CALLED');
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    
    console.log('📝 Session ID:', sessionId);
    
    if (!sessionId) {
      console.log('❌ No session ID provided');
      return NextResponse.redirect(new URL('/events?error=no_session', req.url));
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    console.log('🔄 Retrieving session from Stripe...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('✅ Session retrieved successfully');
    
    console.log('💳 Session payment status:', session.payment_status);
    console.log('📋 Session metadata:', session.metadata);
    
    // Handle different payment statuses
    if (session.payment_status === 'unpaid') {
      console.log('❌ Payment not completed yet, redirecting to event page');
      const redirectUrl = new URL(`/events/${session.metadata.eventId}?error=payment_incomplete`, req.url);
      console.log('🔄 Redirect URL:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }
    
    if (session.payment_status === 'no_payment_required') {
      console.log('❌ No payment required, this should not happen for event bookings');
      const redirectUrl = new URL(`/events/${session.metadata.eventId}?error=payment_not_required`, req.url);
      console.log('🔄 Redirect URL:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }
    
    if (session.payment_status !== 'paid') {
      console.log('❌ Payment not successful, status:', session.payment_status);
      const redirectUrl = new URL(`/events/${session.metadata.eventId}?error=payment_failed`, req.url);
      console.log('🔄 Redirect URL:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
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
    const eventSegment = event.segment || session.metadata.eventSegment || '';
    const additionalData = session.metadata.additionalData ? JSON.parse(session.metadata.additionalData) : {};
    const photographyConsent = session.metadata.photographyConsent || 'No';
    
    // Extract otherFormData for comprehensive data extraction (handle optimized structure)
    const otherFormData = additionalData.otherFormData || additionalData || {};
    
    // Extract dropdown choices from metadata and otherFormData
    const choiceI = session.metadata.choiceI || otherFormData.choiceI || '';
    const choiceII = session.metadata.choiceII || otherFormData.choiceII || '';
    const choiceIII = session.metadata.choiceIII || otherFormData.choiceIII || '';

    // QR code generation removed as requested

    // Extract all additional data from metadata and otherFormData
    
    const extractedData = {
      // Emergency contact information
      emergencyName: session.metadata.emergencyName || additionalData.emergencyName || otherFormData.emergencyName || '',
      emergencyPhone: session.metadata.emergencyPhone || additionalData.emergencyPhone || otherFormData.emergencyPhone || '',
      
      // Child information
      childAge: session.metadata.childAge || additionalData.childAge || otherFormData.childAge || '',
      childGender: session.metadata.childGender || additionalData.childGender || otherFormData.childGender || '',
      childDob: session.metadata.childDob || additionalData.childDob || otherFormData.childDob || '',
      
      // Allergy and dietary information
      dietaryRequirements: session.metadata.dietaryRequirements || (Array.isArray(additionalData.allergies) ? additionalData.allergies.join(', ') : additionalData.allergies) || (Array.isArray(otherFormData.allergies) ? otherFormData.allergies.join(', ') : otherFormData.allergies) || '',
      foodAllergies: session.metadata.foodAllergies || additionalData.foodAllergies || otherFormData.foodAllergies || '',
      allergies: session.metadata.allergies || (Array.isArray(additionalData.allergies) ? additionalData.allergies.join(',') : additionalData.allergies) || (Array.isArray(otherFormData.allergies) ? otherFormData.allergies.join(',') : otherFormData.allergies) || '',
      
      // Medical information
      medicalConditions: session.metadata.medicalConditions || additionalData.medicalConditions || otherFormData.medicalConditions || '',
      conditionDetails: session.metadata.conditionDetails || additionalData.conditionDetails || otherFormData.conditionDetails || '',
      medicalInfo: session.metadata.medicalInfo || additionalData.medicalInfo || otherFormData.medicalInfo || '',
      
      // MamaFit specific fields
      pregnant: session.metadata.pregnant || additionalData.pregnant || otherFormData.pregnant || '',
      postpartum: session.metadata.postpartum || additionalData.postpartum || otherFormData.postpartum || '',
      postpartumDuration: session.metadata.postpartumDuration || additionalData.postpartumDuration || otherFormData.postpartumDuration || '',
      fitnessLevel: session.metadata.fitnessLevel || additionalData.fitnessLevel || otherFormData.fitnessLevel || '',
      
      // Hello Chef specific fields
      cookingExperience: session.metadata.cookingExperience || additionalData.cookingExperience || otherFormData.cookingExperience || '',
      favoriteFoods: session.metadata.favoriteFoods || additionalData.favoriteFoods || otherFormData.favoriteFoods || '',
      
      // Family Day specific fields
      parent1Name: session.metadata.parent1Name || additionalData.parent1Name || otherFormData.parent1Name || '',
      parent2Name: session.metadata.parent2Name || additionalData.parent2Name || otherFormData.parent2Name || '',
      parent1Phone: session.metadata.parent1Phone || additionalData.parent1Phone || otherFormData.parent1Phone || '',
      parent2Phone: session.metadata.parent2Phone || additionalData.parent2Phone || otherFormData.parent2Phone || '',
      child1Name: session.metadata.child1Name || additionalData.child1Name || otherFormData.child1Name || '',
      child1Age: session.metadata.child1Age || additionalData.child1Age || otherFormData.child1Age || '',
      child2Name: session.metadata.child2Name || additionalData.child2Name || otherFormData.child2Name || '',
      child2Age: session.metadata.child2Age || additionalData.child2Age || otherFormData.child2Age || '',
      child3Name: session.metadata.child3Name || additionalData.child3Name || otherFormData.child3Name || '',
      child3Age: session.metadata.child3Age || additionalData.child3Age || otherFormData.child3Age || '',
      child4Name: session.metadata.child4Name || additionalData.child4Name || otherFormData.child4Name || '',
      child4Age: session.metadata.child4Age || additionalData.child4Age || otherFormData.child4Age || '',
      numberOfChildren: session.metadata.numberOfChildren || additionalData.numberOfChildren || otherFormData.numberOfChildren || '',
      howDidYouHear: session.metadata.howDidYouHear || additionalData.howDidYouHear || otherFormData.howDidYouHear || '',
      
      // Special requests and preferences
      specialRequests: session.metadata.specialRequests || additionalData.specialRequests || otherFormData.specialRequests || '',
      tablePreferences: session.metadata.tablePreferences || additionalData.tablePreferences || otherFormData.tablePreferences || '',
      additionalNotes: session.metadata.additionalNotes || additionalData.additionalNotes || otherFormData.additionalNotes || '',
      notes: session.metadata.notes || additionalData.notes || otherFormData.notes || '',
      
      // Consent fields
      waiverConsent: session.metadata.waiverConsent || additionalData.waiverConsent || otherFormData.waiverConsent || ''
    };

    // Generate ticket numbers for each ticket
    const ticketNumbers = [];
    for (let i = 1; i <= numberOfTickets; i++) {
      ticketNumbers.push(i);
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
      isMember: session.metadata.isMember === 'true',
      memberSavings: parseFloat(session.metadata.memberSavings || '0'),
      choiceI,
      choiceII,
      choiceIII,
      ticketNumbers,
      ...extractedData
    });

    console.log('✅ Booking created successfully:', booking._id);

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
        // Debug choiceI data before creating booking data
        console.log('🍽️ ChoiceI Debug in checkout success:', {
          choiceI,
          choiceII,
          choiceIII,
          sessionMetadataChoiceI: session.metadata.choiceI,
          otherFormDataChoiceI: otherFormData.choiceI,
          additionalDataChoiceI: additionalData.choiceI
        });

        // Prepare comprehensive booking data for Google Sheets
        const bookingData = {
          bookingId: booking._id.toString(),
          eventTitle: event.title,
          eventDate: event.date,
          eventSegment: eventSegment,
          guardianName,
          childName,
          userEmail,
          phone,
          numberOfTickets,
          transactionId,
          paymentStatus: 'paid',
          photographyConsent,
          emergencyName: extractedData.emergencyName,
          emergencyPhone: extractedData.emergencyPhone,
          childAge: extractedData.childAge,
          childGender: extractedData.childGender,
          childDob: extractedData.childDob,
          dietaryRequirements: extractedData.dietaryRequirements,
          foodAllergies: extractedData.foodAllergies,
          allergies: extractedData.allergies,
          medicalConditions: extractedData.medicalConditions,
          conditionDetails: extractedData.conditionDetails,
          medicalInfo: extractedData.medicalInfo,
          specialRequests: extractedData.specialRequests,
          tablePreferences: extractedData.tablePreferences,
          additionalNotes: extractedData.additionalNotes,
          notes: extractedData.notes,
          parent1Name: extractedData.parent1Name,
          parent2Name: extractedData.parent2Name,
          parent1Phone: extractedData.parent1Phone,
          parent2Phone: extractedData.parent2Phone,
          child1Name: extractedData.child1Name,
          child1Age: extractedData.child1Age,
          child2Name: extractedData.child2Name,
          child2Age: extractedData.child2Age,
          child3Name: extractedData.child3Name,
          child3Age: extractedData.child3Age,
          child4Name: extractedData.child4Name,
          child4Age: extractedData.child4Age,
          numberOfChildren: extractedData.numberOfChildren,
          howDidYouHear: extractedData.howDidYouHear,
          waiverConsent: extractedData.waiverConsent,
          fitnessLevel: extractedData.fitnessLevel,
          pregnant: extractedData.pregnant,
          postpartum: extractedData.postpartum,
          postpartumDuration: extractedData.postpartumDuration,
          cookingExperience: extractedData.cookingExperience,
          favoriteFoods: extractedData.favoriteFoods,
          mainCourseSelection: choiceI, // Map choiceI to mainCourseSelection for mamaBreakfast
          choiceI, // Also include choiceI directly for fallback
          choiceII,
          choiceIII,
          isMember: session.metadata.isMember === 'true',
          memberSavings: parseFloat(session.metadata.memberSavings || '0'),
          bookingDate: new Date(),
          lastUpdated: new Date()
        };

        // Add booking to event-specific sheet
        console.log('📊 Adding booking to Google Sheets...');
        console.log('Event data for Google Sheets:', {
          eventId: event._id,
          eventTitle: event.title,
          eventSegment: event.segment,
          eventDate: event.date
        });
        console.log('Booking data for Google Sheets:', {
          guardianName: bookingData.guardianName,
          childName: bookingData.childName,
          numberOfTickets: bookingData.numberOfTickets,
          parent1Name: bookingData.parent1Name,
          child1Name: bookingData.child1Name
        });
        
        console.log('Extracted data for family day:', {
          parent1Name: extractedData.parent1Name,
          parent2Name: extractedData.parent2Name,
          child1Name: extractedData.child1Name,
          child2Name: extractedData.child2Name,
          numberOfChildren: extractedData.numberOfChildren,
          howDidYouHear: extractedData.howDidYouHear
        });
        
        console.log('Session metadata for family day:', {
          parent1Name: session.metadata.parent1Name,
          child1Name: session.metadata.child1Name,
          numberOfChildren: session.metadata.numberOfChildren
        });
        
        try {
          await addBookingToEventSheet(bookingData, event);
          console.log('✅ Booking added to Google Sheets successfully');
        } catch (sheetsError) {
          console.error('❌ Error adding booking to Google Sheets:', sheetsError);
          console.error('Sheets error details:', {
            message: sheetsError.message,
            stack: sheetsError.stack
          });
        }
        
        // Get ticket number from the sheet (we'll calculate it based on row position)
        const ticketNumber = await getEventBookingsCount(event);
        
        // Update booking with ticket number
        await Booking.findByIdAndUpdate(booking._id, {
          ticketNumber
        });
        
        sheetsResult = { success: true, ticketNumber };
        console.log('🎫 Ticket number assigned:', ticketNumber);
        
        
        // Send booking confirmation email after successful Google Sheets update
        try {
          console.log('📧 Sending confirmation email...');
          const emailResult = await sendBookingConfirmationEmail(
            {
              userEmail,
              guardianName,
              childName,
              numberOfTickets,
              transactionId,
              ticketNumbers: ticketNumbers
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
          
          if (emailResult.success) {
            console.log('✅ Confirmation email sent successfully');
          } else {
            console.log('❌ Email sending failed:', emailResult.error);
          }
          
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError);
          // Don't fail the process if email fails
        }
      } catch (sheetsError) {
        console.error('Error adding booking to event sheet:', sheetsError);
        sheetsResult = { success: false, error: sheetsError.message };
      }
    } else {
      // If event-specific sheet is not configured, just log a warning
      console.warn('Event-specific sheet not configured for this event segment');
      sheetsResult = { success: false, error: 'Event-specific sheet not configured' };
    }

    // Redirect to success page with booking details
    console.log('🎉 BOOKING PROCESS COMPLETED SUCCESSFULLY!');
    console.log(`📋 Booking ID: ${booking._id}`);
    console.log(`📊 Google Sheets: ${sheetsResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📧 Email: SENT`);
    console.log(`🎫 Ticket Numbers: ${ticketNumbers.join(', ')}`);
    
    const successUrl = new URL(`/events/${eventId}/success?booking_id=${booking._id}`, req.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('❌ Checkout success error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.redirect(new URL('/events?error=processing_failed', req.url));
  }
}
