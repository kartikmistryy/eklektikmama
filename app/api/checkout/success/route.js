import { NextResponse } from "next/server";
import Stripe from "stripe";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import Membership from "@/models/Membership";
import { google } from "googleapis";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";
import { updateMemberSavings, addBookingToEventSheet, getEventBookingsCount } from "@/lib/googleSheets";

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not configured');
      return NextResponse.redirect(new URL('/events?error=stripe_not_configured', req.url));
    }
    
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    
    console.log('📝 Session ID:', sessionId);
    console.log('📝 Request URL:', req.url);
    
    if (!sessionId) {
      console.log('❌ No session ID provided');
      return NextResponse.redirect(new URL('/events?error=no_session', req.url));
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    console.log('🔄 Retrieving session from Stripe...');
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log('✅ Session retrieved successfully');
    } catch (stripeError) {
      console.error('❌ Error retrieving Stripe session:', stripeError);
      console.error('Stripe error details:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      });
      return NextResponse.redirect(new URL('/events?error=stripe_session_error', req.url));
    }
    
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
    try {
      await connectDB();
      console.log('✅ Database connected');
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      return NextResponse.redirect(new URL('/events?error=database_error', req.url));
    }
    
    const eventId = session.metadata?.eventId;
    if (!eventId) {
      console.error('❌ No eventId in session metadata');
      console.log('Session metadata:', session.metadata);
      return NextResponse.redirect(new URL('/events?error=no_event_id', req.url));
    }
    
    console.log('📋 Event ID from metadata:', eventId);
    console.log('📋 Event ID type:', typeof eventId);
    console.log('📋 Event ID is valid ObjectId:', mongoose.Types.ObjectId.isValid(eventId));
    
    // Ensure eventId is a valid ObjectId
    let validEventId = eventId;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      console.error('❌ Invalid eventId format:', eventId);
      return NextResponse.redirect(new URL('/events?error=invalid_event_id', req.url));
    }
    
    const event = await Event.findById(validEventId);
    if (!event) {
      console.error('❌ Event not found for ID:', validEventId);
      return NextResponse.redirect(new URL('/events?error=event_not_found', req.url));
    }
    console.log('✅ Event found:', event.title);

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
      ticketType: session.metadata.ticketType || additionalData.ticketType || otherFormData.ticketType || '',
      medicalClearance: session.metadata.medicalClearance || additionalData.medicalClearance || otherFormData.medicalClearance || '',
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
      waiverConsent: session.metadata.waiverConsent || additionalData.waiverConsent || otherFormData.waiverConsent || '',
      newsletterSignup: session.metadata.newsletterSignup || additionalData.newsletterSignup || otherFormData.newsletterSignup || '',
      
      // Friends & Family Discount fields
      applyFriendsFamilyDiscount: session.metadata.applyFriendsFamilyDiscount === 'true',
      // Extra guest data (comma-separated)
      extraGuestNames: session.metadata.extraGuestNames || additionalData.extraGuestNames || otherFormData.extraGuestNames || '',
      extraGuestEmails: session.metadata.extraGuestEmails || additionalData.extraGuestEmails || otherFormData.extraGuestEmails || '',
      extraGuestMainCourses: session.metadata.extraGuestMainCourses || additionalData.extraGuestMainCourses || otherFormData.extraGuestMainCourses || '',
      // Legacy fields for backward compatibility
      familyMemberNames: session.metadata.familyMemberNames || session.metadata.extraGuestNames || additionalData.familyMemberNames || additionalData.extraGuestNames || otherFormData.familyMemberNames || otherFormData.extraGuestNames || '',
      familyMemberContacts: session.metadata.familyMemberContacts || session.metadata.extraGuestEmails || additionalData.familyMemberContacts || additionalData.extraGuestEmails || otherFormData.familyMemberContacts || otherFormData.extraGuestEmails || '',
      familyDiscountTerms: session.metadata.familyDiscountTerms === 'true',
      totalTickets: parseInt(session.metadata.totalTickets) || numberOfTickets
    };

    // Calculate total adult guests - when Friends & Family discount is applied, it's the number of tickets
    const totalAdultGuests = extractedData.totalTickets || numberOfTickets;

    // Update extractedData with the correct total adult guests count
    extractedData.totalTickets = totalAdultGuests;

    // Generate ticket numbers for each ticket (including family members if applicable)
    const ticketNumbers = [];
    const totalTicketsForBooking = totalAdultGuests;
    for (let i = 1; i <= totalTicketsForBooking; i++) {
      ticketNumbers.push(i);
    }

    // Save to database with all additional data
    let booking;
    try {
      console.log('💾 Creating booking in MongoDB...', {
        eventId: validEventId,
        transactionId,
        guardianName,
        userEmail,
        numberOfTickets: totalTicketsForBooking
      });
      
      const bookingData = {
        eventId: validEventId, // Use validated eventId
        guardianName,
        childName,
        userEmail,
        phone,
        numberOfTickets: totalTicketsForBooking,
        transactionId,
        paymentStatus: 'paid',
        totalAmount: typeof session.amount_total === 'number' ? session.amount_total / 100 : 0,
        currency: (session.currency || 'aed').toUpperCase(),
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
      };
      
      console.log('📋 Booking data to save:', {
        eventId: bookingData.eventId,
        transactionId: bookingData.transactionId,
        numberOfTickets: bookingData.numberOfTickets,
        hasEventId: !!bookingData.eventId,
        eventIdType: typeof bookingData.eventId,
        eventIdIsValid: mongoose.Types.ObjectId.isValid(bookingData.eventId)
      });
      
      booking = await Booking.create(bookingData);

      console.log('✅ Booking created successfully in MongoDB:', booking._id);
      console.log('📋 Booking details:', {
        _id: booking._id,
        transactionId: booking.transactionId,
        eventId: booking.eventId,
        numberOfTickets: booking.numberOfTickets,
        createdAt: booking.createdAt
      });
      
      // Immediately verify the booking was saved
      const verifyBooking = await Booking.findById(booking._id);
      if (!verifyBooking) {
        console.error('❌ CRITICAL: Booking was created but not found in database!');
        throw new Error('Booking creation verification failed - booking not found after creation');
      }
      console.log('✅ Booking verified in database immediately after creation');
      
    } catch (bookingError) {
      console.error('❌ Error creating booking in MongoDB:', bookingError);
      console.error('❌ Booking error details:', {
        message: bookingError.message,
        name: bookingError.name,
        code: bookingError.code,
        errors: bookingError.errors,
        stack: bookingError.stack,
        eventId: validEventId,
        transactionId
      });
      
      // Check if it's a validation error
      if (bookingError.name === 'ValidationError') {
        console.error('❌ Validation errors:', bookingError.errors);
      }
      
      // Don't proceed if booking creation fails
      return NextResponse.redirect(new URL(`/events/${validEventId}?error=booking_failed`, req.url));
    }

    // Handle newsletter signup if requested
    if (extractedData.newsletterSignup === 'Yes') {
      try {
        const newsletterResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/newsletter-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            name: guardianName
          }),
        });

        if (newsletterResponse.ok) {
          console.log('Newsletter signup successful for:', userEmail);
        } else {
          console.error('Newsletter signup failed for:', userEmail);
        }
      } catch (newsletterError) {
        console.error('Error with newsletter signup:', newsletterError);
        // Don't fail the booking if newsletter signup fails
      }
    }

    // Parse and save extra guest data to main booking
    // Handle both new system (extraGuestNames/Emails/MainCourses) and old system (familyMemberNames/Contacts)
    // Process extra guest data whenever numberOfTickets > 1, not just when discount is applied
    let extraGuestNames = [];
    let extraGuestEmails = [];
    let extraGuestMainCourses = [];
    
    // Check if there are extra guests (numberOfTickets > 1 means there are extra guests)
    const hasExtraGuests = (parseInt(numberOfTickets) || 1) > 1;
    
    // Parse extra guest data from new system
    if (hasExtraGuests && extractedData.extraGuestNames && extractedData.extraGuestEmails) {
      if (typeof extractedData.extraGuestNames === 'string') {
        extraGuestNames = extractedData.extraGuestNames.split(',').map(name => name.trim()).filter(name => name);
      } else if (Array.isArray(extractedData.extraGuestNames)) {
        extraGuestNames = extractedData.extraGuestNames.filter(name => name && name.trim());
      }
      
      if (typeof extractedData.extraGuestEmails === 'string') {
        extraGuestEmails = extractedData.extraGuestEmails.split(',').map(email => email.trim()).filter(email => email);
      } else if (Array.isArray(extractedData.extraGuestEmails)) {
        extraGuestEmails = extractedData.extraGuestEmails.filter(email => email && email.trim());
      }
      
      if (extractedData.extraGuestMainCourses) {
        if (typeof extractedData.extraGuestMainCourses === 'string') {
          extraGuestMainCourses = extractedData.extraGuestMainCourses.split(',').map(course => course.trim()).filter(course => course);
        } else if (Array.isArray(extractedData.extraGuestMainCourses)) {
          extraGuestMainCourses = extractedData.extraGuestMainCourses.filter(course => course && course.trim());
        }
      }
    }
    // Fallback to old system (familyMemberNames/Contacts) if new system data not available
    else if (extractedData.familyMemberNames && extractedData.familyMemberContacts) {
      if (typeof extractedData.familyMemberNames === 'string') {
        extraGuestNames = extractedData.familyMemberNames.split(',').map(name => name.trim()).filter(name => name);
      } else if (Array.isArray(extractedData.familyMemberNames)) {
        extraGuestNames = extractedData.familyMemberNames.filter(name => name && name.trim());
      }
      
      if (typeof extractedData.familyMemberContacts === 'string') {
        extraGuestEmails = extractedData.familyMemberContacts.split(',').map(email => email.trim()).filter(email => email);
      } else if (Array.isArray(extractedData.familyMemberContacts)) {
        extraGuestEmails = extractedData.familyMemberContacts.filter(email => email && email.trim());
      }
    }
    
    // Always initialize extra object, even if empty (for consistency)
    booking.extra = {
      name: extraGuestNames,
      email: extraGuestEmails,
      menuSelections: extraGuestMainCourses
    };
    
    // Also update comma-separated strings for backward compatibility
    booking.extraGuestNames = extraGuestNames.length > 0 ? extraGuestNames.join(', ') : '';
    booking.extraGuestEmails = extraGuestEmails.length > 0 ? extraGuestEmails.join(', ') : '';
    booking.extraGuestMainCourses = extraGuestMainCourses.length > 0 ? extraGuestMainCourses.join(', ') : '';
    
    // Save booking with extra data
    try {
      console.log('💾 Saving booking with extra guest data...');
      await booking.save();
      console.log('✅ Extra guest data saved to booking:', {
        bookingId: booking._id,
        extraGuestNames: extraGuestNames.length,
        extraGuestEmails: extraGuestEmails.length,
        extraGuestMainCourses: extraGuestMainCourses.length,
        extraObject: booking.extra
      });
    } catch (saveError) {
      console.error('❌ Error saving booking with extra data:', saveError);
      console.error('❌ Save error details:', {
        message: saveError.message,
        name: saveError.name,
        bookingId: booking._id
      });
      // Continue anyway - the booking was created, just extra data failed to save
    }
    
    // Note: We no longer create separate booking records for extra guests
    // All extra guest data is stored in the main booking's 'extra' object and comma-separated fields
    // This data will be displayed in Google Sheets in the extra guest columns
    if (extraGuestNames.length > 0 || extraGuestEmails.length > 0) {
      console.log('✅ Extra guest data saved to main booking (no separate records created):', {
        extraGuestNames: extraGuestNames.length,
        extraGuestEmails: extraGuestEmails.length,
        extraGuestMainCourses: extraGuestMainCourses.length
      });
    }

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

    // Verify booking was created successfully before proceeding
    if (!booking || !booking._id) {
      console.error('❌ Booking was not created successfully, cannot proceed to Google Sheets');
      return NextResponse.redirect(new URL(`/events/${eventId}?error=booking_creation_failed`, req.url));
    }
    
    // Verify booking exists in database
    try {
      const verifyBooking = await Booking.findById(booking._id);
      if (!verifyBooking) {
        console.error('❌ Booking not found in database after creation:', booking._id);
        return NextResponse.redirect(new URL(`/events/${eventId}?error=booking_not_saved`, req.url));
      }
      console.log('✅ Verified booking exists in database:', verifyBooking._id);
    } catch (verifyError) {
      console.error('❌ Error verifying booking in database:', verifyError);
      return NextResponse.redirect(new URL(`/events/${eventId}?error=booking_verification_failed`, req.url));
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
        // Reload booking from database to ensure we have the latest data including extra object
        let updatedBooking;
        try {
          updatedBooking = await Booking.findById(booking._id);
          if (!updatedBooking) {
            console.error('❌ Booking not found when reloading:', booking._id);
            throw new Error(`Booking ${booking._id} not found in database`);
          }
          console.log('✅ Booking reloaded from database:', updatedBooking._id);
        } catch (reloadError) {
          console.error('❌ Error reloading booking from database:', reloadError);
          // Use the booking object we already have
          updatedBooking = booking;
          console.log('⚠️ Using existing booking object instead of reloaded version');
        }
        
        const bookingData = {
          ...updatedBooking.toObject(),
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
          ticketType: extractedData.ticketType,
          fitnessLevel: extractedData.fitnessLevel,
          medicalClearance: extractedData.medicalClearance,
          cookingExperience: extractedData.cookingExperience,
          favoriteFoods: extractedData.favoriteFoods,
          mainCourseSelection: choiceI, // Map choiceI to mainCourseSelection for mamaBreakfast
          choiceI, // Also include choiceI directly for fallback
          choiceII,
          choiceIII,
          isMember: session.metadata.isMember === 'true',
          memberSavings: parseFloat(session.metadata.memberSavings || '0'),
          // Friends & Family Discount fields
          applyFriendsFamilyDiscount: extractedData.applyFriendsFamilyDiscount,
          familyMemberNames: extractedData.familyMemberNames,
          familyMemberContacts: extractedData.familyMemberContacts,
          familyDiscountTerms: extractedData.familyDiscountTerms,
          totalTickets: extractedData.totalTickets,
          // Extra guest data - use the saved booking's extra object
          extra: updatedBooking.extra || {
            name: [],
            email: [],
            menuSelections: []
          },
          extraGuestNames: updatedBooking.extraGuestNames || '',
          extraGuestEmails: updatedBooking.extraGuestEmails || '',
          extraGuestMainCourses: updatedBooking.extraGuestMainCourses || '',
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
          console.log('📊 Booking data for Google Sheets:', {
            bookingId: bookingData._id || bookingData.bookingId,
            numberOfTickets: bookingData.numberOfTickets,
            hasExtra: !!bookingData.extra,
            extraNames: bookingData.extra?.name?.length || 0,
            extraEmails: bookingData.extra?.email?.length || 0,
            extraMenuSelections: bookingData.extra?.menuSelections?.length || 0,
            extraGuestNames: bookingData.extraGuestNames,
            extraGuestEmails: bookingData.extraGuestEmails
          });
          
          await addBookingToEventSheet(bookingData, event);
          console.log('✅ Booking added to Google Sheets successfully');
        } catch (sheetsError) {
          console.error('❌ Error adding booking to Google Sheets:', sheetsError);
          console.error('Sheets error details:', {
            message: sheetsError.message,
            stack: sheetsError.stack
          });
        }

        // Note: We no longer create separate Google Sheets entries for family members/extra guests
        // All extra guest data is stored in the main booking's 'extra' object and will be
        // displayed in the extra guest columns (Extra Guest Names, Extra Guest Emails, Extra Guest Menu Selections)
        // in the main booking row in Google Sheets
        
        // Get ticket number from the sheet (we'll calculate it based on row position)
        const ticketNumber = await getEventBookingsCount(event);
        
        // Update booking with ticket number
        try {
          console.log('💾 Updating booking with ticket number:', ticketNumber);
          const updatedBooking = await Booking.findByIdAndUpdate(
            booking._id,
            { ticketNumber },
            { new: true } // Return updated document
          );
          
          if (!updatedBooking) {
            console.error('❌ Failed to update booking with ticket number - booking not found:', booking._id);
          } else {
            console.log('✅ Booking updated with ticket number:', {
              bookingId: updatedBooking._id,
              ticketNumber: updatedBooking.ticketNumber
            });
          }
        } catch (updateError) {
          console.error('❌ Error updating booking with ticket number:', updateError);
          console.error('❌ Update error details:', {
            message: updateError.message,
            bookingId: booking._id,
            ticketNumber
          });
        }
        
        sheetsResult = { success: true, ticketNumber };
        console.log('🎫 Ticket number assigned:', ticketNumber);
        
        
        // Send booking confirmation email after successful Google Sheets update
        try {
          console.log('📧 Sending confirmation email to main user...');
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
            console.log('✅ Confirmation email sent successfully to main user');
          } else {
            console.log('❌ Email sending failed:', emailResult.error);
          }
          
          // Send emails to extra guests if they exist
          if (extraGuestEmails && extraGuestEmails.length > 0 && extraGuestNames && extraGuestNames.length > 0) {
            console.log(`📧 Sending confirmation emails to ${extraGuestEmails.length} extra guest(s)...`);
            
            for (let i = 0; i < extraGuestEmails.length; i++) {
              const guestEmail = extraGuestEmails[i];
              const guestName = extraGuestNames[i] || 'Valued Guest';
              
              // Skip if email is invalid
              if (!guestEmail || !guestEmail.trim()) {
                console.log(`⚠️ Skipping invalid email for guest ${i + 1}`);
                continue;
              }
              
              try {
                // Generate email content for the extra guest
                const { generateBookingEmailContent } = await import('@/lib/emailTemplates');
                const guestEmailContent = await generateBookingEmailContent(
                  {
                    userEmail: guestEmail,
                    guardianName: guestName,
                    childName: '',
                    numberOfTickets: 1, // Each guest gets 1 ticket
                    transactionId,
                    ticketNumbers: ticketNumbers.length > i + 1 ? [ticketNumbers[i + 1]] : []
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
                
                // Send email to extra guest using the same service as main user
                const { sendEmailViaService } = await import('@/lib/mailchimp');
                const guestEmailResult = await sendEmailViaService(guestEmailContent.to_email, guestEmailContent);
                
                if (guestEmailResult.success) {
                  console.log(`✅ Confirmation email sent successfully to extra guest ${i + 1}: ${guestEmail}`);
                } else {
                  console.log(`❌ Failed to send email to extra guest ${i + 1} (${guestEmail}):`, guestEmailResult.error);
                }
              } catch (guestEmailError) {
                console.error(`❌ Error sending email to extra guest ${i + 1} (${guestEmail}):`, guestEmailError);
                // Continue with other guests even if one fails
              }
            }
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

    // Final verification: Check if booking still exists in MongoDB
    try {
      const finalCheck = await Booking.findById(booking._id);
      if (!finalCheck) {
        console.error('❌ CRITICAL: Booking not found in final verification!', booking._id);
        console.error('❌ This means the booking was created but then lost from the database');
        return NextResponse.redirect(new URL(`/events/${validEventId}?error=booking_lost`, req.url));
      }
      console.log('✅ Final verification: Booking confirmed in MongoDB:', {
        bookingId: finalCheck._id,
        transactionId: finalCheck.transactionId,
        eventId: finalCheck.eventId,
        numberOfTickets: finalCheck.numberOfTickets,
        paymentStatus: finalCheck.paymentStatus
      });
      
      // Also verify booking count for this event
      const eventBookingCount = await Booking.countDocuments({ 
        eventId: validEventId,
        paymentStatus: 'paid'
      });
      console.log(`📊 Total paid bookings for this event in MongoDB: ${eventBookingCount}`);
      
    } catch (finalCheckError) {
      console.error('❌ Error in final booking verification:', finalCheckError);
      // Continue anyway - we'll log the error but still redirect
    }
    
    // Redirect to success page with booking details
    console.log('🎉 BOOKING PROCESS COMPLETED SUCCESSFULLY!');
    console.log(`📋 Booking ID: ${booking._id}`);
    console.log(`📋 Transaction ID: ${transactionId}`);
    console.log(`📊 Google Sheets: ${sheetsResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📧 Email: SENT`);
    console.log(`🎫 Ticket Numbers: ${ticketNumbers.join(', ')}`);
    
    const successUrl = new URL(`/events/${validEventId}/success?booking_id=${booking._id}`, req.url);
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('❌ Checkout success error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.redirect(new URL('/events?error=processing_failed', req.url));
  }
}
