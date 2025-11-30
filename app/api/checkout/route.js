import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Membership from "@/models/Membership";
import { updateMemberSavings, getEventBookingsCount } from "@/lib/googleSheets";

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const { eventId, guardianName, childName, email, phone, numberOfTickets, eventSegment, ...otherFormData } = body;
    
    // Debug logging for family day events (simplified)
    console.log('Event Segment:', eventSegment);
    console.log('Form data received for', eventSegment === 'familyDay' ? 'family day' : 'other event');
    
    // Validate required fields
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!numberOfTickets || numberOfTickets < 1 || numberOfTickets > 15) {
      return NextResponse.json({ error: 'Number of tickets must be between 1 and 15' }, { status: 400 });
    }

    // For family day events, validate that we have the required parent/child information
    if (eventSegment === 'familyDay') {
      // Check if the data is nested in otherFormData.otherFormData
      const formData = otherFormData.otherFormData || otherFormData;
      
      if (!formData.parent1Name) {
        return NextResponse.json({ error: 'Parent/Guardian 1 name is required' }, { status: 400 });
      }
      if (!formData.child1Name) {
        return NextResponse.json({ error: 'At least one child name is required' }, { status: 400 });
      }
      if (!formData.numberOfChildren) {
        return NextResponse.json({ error: 'Number of children selection is required' }, { status: 400 });
      }
    }

    await connectDB();
    
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Enforce booking cutoff on the server (defense-in-depth)
    const now = new Date();
    if (event.bookingDeadline) {
      const bookingDeadline = new Date(event.bookingDeadline);
      if (!isNaN(bookingDeadline.getTime()) && now > bookingDeadline) {
        return NextResponse.json({ error: 'Booking has closed for this event.' }, { status: 403 });
      }
    }

    // Prevent bookings after the event has passed (use endDate if provided, else date)
    const eventEndDate = event.endDate ? new Date(event.endDate) : (event.date ? new Date(event.date) : null);
    if (eventEndDate && !isNaN(eventEndDate.getTime()) && now > eventEndDate) {
      return NextResponse.json({ error: 'This event has already passed.' }, { status: 403 });
    }

    // Check if this is a free event (coffee meetup)
    const isFreeEvent = event.segment === 'coffeeMeetup';
    
    // Check if this event uses dynamic pricing (mamaFit, familyDay)
    const usesDynamicPricing = event.segment === 'mamaFit' || event.segment === 'familyDay';
    
    // Check if this is a members-only event (coffee meetup is always members-only)
    if (event.isMembersOnly || isFreeEvent) {
      console.log(`Event ${event.title} is members-only, checking membership status for ${email}`);
      
      try {
        const membership = await Membership.findOne({
          email: email.toLowerCase(),
          status: { $in: ['active', 'past_due'] }
        });

        if (!membership || !membership.isActive()) {
          return NextResponse.json({ 
            error: 'This event is exclusive to Eklektik AF members only. Please become a member to book this event.',
            isMembersOnly: true,
            membershipRequired: true
          }, { status: 403 });
        }
        
        console.log(`Membership verified for ${email} - access granted to members-only event`);
      } catch (membershipError) {
        console.error('Error checking membership for members-only event:', membershipError);
        return NextResponse.json({ 
          error: 'Unable to verify membership status. Please try again or contact support.',
          isMembersOnly: true,
          membershipRequired: true
        }, { status: 500 });
      }
    }
    
    // Validate event price (skip for free events and events with dynamic pricing)
    if (!isFreeEvent && !usesDynamicPricing && (!event.price || event.price <= 0)) {
      return NextResponse.json({ error: 'Event price is invalid' }, { status: 400 });
    }

    // Check seat availability (only if seats are configured)
    if (event.seats && event.seats > 0) {
      const currentBookings = await getEventBookingsCount(event);
      const availableSeats = event.seats - currentBookings;
      
      if (availableSeats < numberOfTickets) {
        return NextResponse.json({ 
          error: `Only ${availableSeats} seats available. You requested ${numberOfTickets} tickets.` 
        }, { status: 400 });
      }
    } else {
      console.log(`Event ${event.title} has no seat limit configured (seats: ${event.seats})`);
    }

    // Check if user is a member and calculate discount
    let memberDiscount = 0;
    let memberSavings = 0;
    let isMember = false;
    
    try {
      const membership = await Membership.findOne({
        email: email.toLowerCase(),
        status: { $in: ['active', 'past_due'] }
      });

      if (membership && membership.isActive()) {
        isMember = true;
        memberDiscount = membership.discountPercentage || 10; // 10% default discount
        const originalTotal = event.price * numberOfTickets;
        memberSavings = Math.round((originalTotal * memberDiscount / 100) * 100) / 100; // Round to 2 decimal places
      }
    } catch (membershipError) {
      console.error('Error checking membership:', membershipError);
      // Continue without discount if membership check fails
    }

    // Handle free events (coffee meetup) - no payment required
    if (isFreeEvent) {
      console.log(`Processing free event booking for ${event.title}`);
      console.log('Form data received:', otherFormData);
      console.log('Email from URL params:', email);
      console.log('Event segment:', event.segment);
      
      // Extract the actual form data (it's nested in otherFormData.otherFormData)
      const formData = otherFormData.otherFormData || otherFormData;
      console.log('Extracted form data:', formData);
      
      // Create a free booking record directly
      const bookingData = {
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.date,
        guardianName: formData.name || '',
        childName: formData.childName || '',
        email: email,
        phone: formData.phone || '',
        numberOfTickets: 1, // Free events are typically 1 ticket per member
        eventSegment: event.segment,
        paymentStatus: 'free',
        transactionId: `free_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        // Include all form data for Google Sheets
        name: formData.name || '',
        phone: formData.phone || '',
        email: email,
        childName: formData.childName || '',
        childAge: formData.childAge || '',
        photographyConsent: formData.photographyConsent || 'No',
        ...formData
      };
      
      console.log('🔍 Final booking data for Google Sheets:', {
        name: bookingData.name,
        guardianName: bookingData.guardianName,
        childName: bookingData.childName,
        phone: bookingData.phone,
        email: bookingData.email
      });
      
      // Add to Google Sheets
      try {
        const { addBookingToEventSheet } = await import('@/lib/googleSheets');
        await addBookingToEventSheet(bookingData, event);
        console.log('Free event booking added to Google Sheets');
      } catch (error) {
        console.error('Error adding free event booking to Google Sheets:', error);
        // Continue even if Google Sheets fails
      }
      
      return NextResponse.json({
        success: true,
        message: 'Booking confirmed! This is a free event - no payment required.',
        isFreeEvent: true,
        bookingData: {
          eventTitle: event.title,
          eventDate: event.date,
          memberName: otherFormData.name,
          childName: otherFormData.childName
        }
      });
    }

    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Build absolute URLs for redirects
    const hdrs = await headers();
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host');
    const protocol = (hdrs.get('x-forwarded-proto') || 'http') + '://';
    const origin = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${protocol}${host}` : 'http://localhost:3000');
    
    // Calculate pricing based on event segment
    let originalPrice = event.price;
    
    // Special pricing for Family Day events based on number of children
    if (event.segment === 'familyDay') {
      // Get the correct form data (handle nested structure)
      const formData = otherFormData.otherFormData || otherFormData;
      const numberOfChildrenValue = formData.numberOfChildren || '';
      let numberOfChildren = 2; // Default to 2 children
      
      // Parse the number of children from the select option
      if (numberOfChildrenValue.includes('2 children')) {
        numberOfChildren = 2;
      } else if (numberOfChildrenValue.includes('3 children')) {
        numberOfChildren = 3;
      } else if (numberOfChildrenValue.includes('4 children')) {
        numberOfChildren = 4;
      }
      
      if (numberOfChildren === 2) {
        originalPrice = 270; // Parents + 2 children
      } else if (numberOfChildren === 3) {
        originalPrice = 405; // Parents + 3 children
      } else if (numberOfChildren === 4) {
        originalPrice = 540; // Parents + 4 children
      } else {
        // Default to 2 children pricing if invalid number
        originalPrice = 270;
      }
    }
    
    // Get form data for use in pricing and discount calculations
    const formData = otherFormData.otherFormData || otherFormData;
    
    // Special pricing for MamaFit events based on ticket type
    if (event.segment === 'mamaFit') {
      const ticketType = formData.ticketType || '';
      
      if (ticketType.includes('Solo mum')) {
        originalPrice = 115; // Solo mum (no sitter)
      } else if (ticketType.includes('Mum + Baby')) {
        originalPrice = 155; // Mum + Baby (with sitters)
      } else {
        // Default to Solo mum pricing if ticket type not selected
        originalPrice = 115;
      }
    }
    
    // Check for Friends & Family discount for mamaBreakfast events
    const applyFriendsFamilyDiscount = formData.applyFriendsFamilyDiscount === true || 
                                      formData.applyFriendsFamilyDiscount === 'true' ||
                                      (Array.isArray(formData.applyFriendsFamilyDiscount) && formData.applyFriendsFamilyDiscount.length > 0);
    const friendsFamilyDiscount = applyFriendsFamilyDiscount ? 0.1 : 0; // 10% discount
    
    // Debug logging for Friends & Family discount
    console.log('🔍 Friends & Family Discount Debug:', {
      applyFriendsFamilyDiscount: formData.applyFriendsFamilyDiscount,
      isArray: Array.isArray(formData.applyFriendsFamilyDiscount),
      arrayLength: Array.isArray(formData.applyFriendsFamilyDiscount) ? formData.applyFriendsFamilyDiscount.length : 'N/A',
      detected: applyFriendsFamilyDiscount,
      familyMemberNames: formData.familyMemberNames
    });
    
    // Calculate total adult guests - when Friends & Family discount is applied, it's the number of tickets
    // (1 for user + extra guests)
    const totalAdultGuests = parseInt(numberOfTickets) || 1;
    
    // Process extra guest data (always process when extra guests exist, not just when discount is applied)
    let extraGuestNamesStr = '';
    let extraGuestEmailsStr = '';
    let extraGuestMainCoursesStr = '';
    
    // Check if there are extra guests (numberOfTickets > 1 means there are extra guests)
    const hasExtraGuests = (parseInt(numberOfTickets) || 1) > 1;
    
    if (hasExtraGuests && formData.extraGuestNames && formData.extraGuestEmails) {
      const extraGuestNames = Array.isArray(formData.extraGuestNames) 
        ? formData.extraGuestNames.filter(name => name && name.trim())
        : [];
      const extraGuestEmails = Array.isArray(formData.extraGuestEmails) 
        ? formData.extraGuestEmails.filter(email => email && email.trim())
        : [];
      
      extraGuestNamesStr = extraGuestNames.join(', ');
      extraGuestEmailsStr = extraGuestEmails.join(', ');
      
      // Main course selections (for all events)
      if (formData.extraGuestMainCourses) {
        const extraGuestMainCourses = Array.isArray(formData.extraGuestMainCourses) 
          ? formData.extraGuestMainCourses.filter(course => course && course.trim())
          : [];
        extraGuestMainCoursesStr = extraGuestMainCourses.join(', ');
      }
      
      console.log('📝 Extra guest data processed:', {
        numberOfTickets,
        extraGuestNames: extraGuestNames.length,
        extraGuestEmails: extraGuestEmails.length,
        extraGuestMainCourses: extraGuestMainCoursesStr ? extraGuestMainCoursesStr.split(',').length : 0
      });
    }
    
    // Calculate price based on total adult guests
    const totalPrice = originalPrice * totalAdultGuests;
    
    // Apply member discount first, then Friends & Family discount
    let discountedPrice = isMember ? totalPrice * (1 - memberDiscount / 100) : totalPrice;
    if (applyFriendsFamilyDiscount) {
      discountedPrice = discountedPrice * (1 - friendsFamilyDiscount);
    }
    
    // Debug logging
    console.log('Event checkout debug:', {
      eventSegment: event.segment,
      numberOfChildren: event.segment === 'familyDay' ? (otherFormData.numberOfChildren || 'not provided') : 'N/A',
      originalPrice,
      numberOfTickets,
      totalAdultGuests,
      totalPrice,
      discountedPrice,
      isMember,
      memberDiscount,
      memberSavings: isMember ? totalPrice - (totalPrice * (1 - memberDiscount / 100)) : 0,
      applyFriendsFamilyDiscount,
      friendsFamilyDiscount: friendsFamilyDiscount * 100
    });
    
    // Debug form data for mama breakfast
    if (event.segment === 'mamaBreakfast') {
      console.log('🍽️ Mama Breakfast Form Data Debug:', {
        otherFormData: otherFormData,
        choiceI: otherFormData.choiceI,
        choiceII: otherFormData.choiceII,
        choiceIII: otherFormData.choiceIII,
        allKeys: Object.keys(otherFormData)
      });
    }
    
    // Create line item with discounted price per adult guest
    const finalPrice = Math.max(0, Math.round((discountedPrice / totalAdultGuests) * 100));
    
    // Create product name based on event type
    let productName = event.title;
    if (event.segment === 'familyDay') {
      // Get the correct form data (handle nested structure)
      const formData = otherFormData.otherFormData || otherFormData;
      const numberOfChildrenValue = formData.numberOfChildren || '';
      let numberOfChildren = 2; // Default to 2 children
      
      // Parse the number of children from the select option
      if (numberOfChildrenValue.includes('2 children')) {
        numberOfChildren = 2;
      } else if (numberOfChildrenValue.includes('3 children')) {
        numberOfChildren = 3;
      } else if (numberOfChildrenValue.includes('4 children')) {
        numberOfChildren = 4;
      }
      
      productName = `${event.title} (Parents + ${numberOfChildren} children)`;
    }
    
    if (isMember) {
      productName += ` (Member Price - ${memberDiscount}% off)`;
    }
    
    if (applyFriendsFamilyDiscount) {
      productName += ` (Friends & Family - ${totalAdultGuests} adult guests, 10% off)`;
    }
    
    console.log('Final pricing:', {
      originalPrice,
      numberOfTickets,
      totalAdultGuests,
      totalPrice,
      discountedPrice,
      finalPricePerAdultGuest: finalPrice / 100,
      finalPrice,
      isMember,
      memberDiscount
    });
    
    const lineItems = [
      {
        price_data: {
          currency: 'aed',
          unit_amount: finalPrice,
          product_data: {
            name: productName,
            images: event.coverImage ? [event.coverImage] : undefined,
          },
        },
        quantity: totalAdultGuests,
      },
    ];
    
    const sessionData = {
      mode: 'payment',
      success_url: `${origin}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${event._id}?canceled=true`,
      customer_email: email,
      line_items: lineItems,
      // Remove payment_method_types
      // payment_method_types: ['card'],
    
      // Use PMC config only in live mode (test mode uses defaults)
      ...(process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? {
        payment_method_configuration: 'pmc_1Q1LozRr8s6DbC7qUqs8HGlx'
      } : {}),
    
      metadata: {
        eventId: String(event._id),
        eventSegment: eventSegment || '',
        guardianName: guardianName || (otherFormData.otherFormData || otherFormData).parent1Name || '',
        childName: childName || (otherFormData.otherFormData || otherFormData).child1Name || '',
        email: email || '',
        phone: phone || (otherFormData.otherFormData || otherFormData).parent1Phone || '',
        numberOfTickets: String(numberOfTickets || 1),
        isMember: isMember ? 'true' : 'false',
        memberDiscount: String(memberDiscount),
        memberSavings: String(memberSavings),
        originalPrice: String(originalPrice),
        finalPrice: String(discountedPrice),
        
        // Choice fields for all events - handle nested structure
        choiceI: ((otherFormData.otherFormData || otherFormData).choiceI || '').substring(0, 100),
        choiceII: ((otherFormData.otherFormData || otherFormData).choiceII || '').substring(0, 100),
        choiceIII: ((otherFormData.otherFormData || otherFormData).choiceIII || '').substring(0, 100),
        
        // Emergency contact information
        emergencyName: ((otherFormData.otherFormData || otherFormData).emergencyName || '').substring(0, 100),
        emergencyPhone: ((otherFormData.otherFormData || otherFormData).emergencyPhone || '').substring(0, 100),
        
        // Child information - handle nested structure
        childDob: (otherFormData.otherFormData || otherFormData).childDob || '',
        childAge: (otherFormData.otherFormData || otherFormData).childAge || '',
        childGender: ((otherFormData.otherFormData || otherFormData).childGender || '').substring(0, 50),
        
        // Allergy and dietary information - handle nested structure
        allergies: Array.isArray((otherFormData.otherFormData || otherFormData).allergies) ? (otherFormData.otherFormData || otherFormData).allergies.join(',').substring(0, 200) : ((otherFormData.otherFormData || otherFormData).allergies || ''),
        dietaryRequirements: ((otherFormData.otherFormData || otherFormData).dietaryRequirements || '').substring(0, 200),
        foodAllergies: ((otherFormData.otherFormData || otherFormData).foodAllergies || '').substring(0, 200),
        
        // Medical information - handle nested structure
        medicalConditions: ((otherFormData.otherFormData || otherFormData).medicalConditions || '').substring(0, 200),
        conditionDetails: ((otherFormData.otherFormData || otherFormData).conditionDetails || '').substring(0, 200),
        medicalInfo: ((otherFormData.otherFormData || otherFormData).medicalInfo || '').substring(0, 200),
        
        // MamaFit specific fields - handle nested structure
        ticketType: ((otherFormData.otherFormData || otherFormData).ticketType || '').substring(0, 100),
        medicalClearance: (otherFormData.otherFormData || otherFormData).medicalClearance || '',
        fitnessLevel: ((otherFormData.otherFormData || otherFormData).fitnessLevel || '').substring(0, 50),
        
        // Hello Chef specific fields - handle nested structure
        cookingExperience: (otherFormData.otherFormData || otherFormData).cookingExperience || '',
        favoriteFoods: ((otherFormData.otherFormData || otherFormData).favoriteFoods || '').substring(0, 200),
        
        // Family Day specific fields
        parent1Name: ((otherFormData.otherFormData || otherFormData).parent1Name || '').substring(0, 100),
        parent2Name: ((otherFormData.otherFormData || otherFormData).parent2Name || '').substring(0, 100),
        parent1Phone: ((otherFormData.otherFormData || otherFormData).parent1Phone || '').substring(0, 50),
        parent2Phone: ((otherFormData.otherFormData || otherFormData).parent2Phone || '').substring(0, 50),
        child1Name: ((otherFormData.otherFormData || otherFormData).child1Name || '').substring(0, 100),
        child1Age: (otherFormData.otherFormData || otherFormData).child1Age || '',
        child2Name: ((otherFormData.otherFormData || otherFormData).child2Name || '').substring(0, 100),
        child2Age: (otherFormData.otherFormData || otherFormData).child2Age || '',
        child3Name: ((otherFormData.otherFormData || otherFormData).child3Name || '').substring(0, 100),
        child3Age: (otherFormData.otherFormData || otherFormData).child3Age || '',
        child4Name: ((otherFormData.otherFormData || otherFormData).child4Name || '').substring(0, 100),
        child4Age: (otherFormData.otherFormData || otherFormData).child4Age || '',
        numberOfChildren: ((otherFormData.otherFormData || otherFormData).numberOfChildren || '').substring(0, 50),
        howDidYouHear: ((otherFormData.otherFormData || otherFormData).howDidYouHear || '').substring(0, 100),
        
        // Special requests and preferences - handle nested structure
        specialRequests: ((otherFormData.otherFormData || otherFormData).specialRequests || '').substring(0, 200),
        tablePreferences: ((otherFormData.otherFormData || otherFormData).tablePreferences || '').substring(0, 200),
        additionalNotes: ((otherFormData.otherFormData || otherFormData).additionalNotes || '').substring(0, 200),
        notes: ((otherFormData.otherFormData || otherFormData).notes || '').substring(0, 200),
        
        // Consent fields - handle nested structure
        photographyConsent: (otherFormData.otherFormData || otherFormData).photographyConsent ? 'Yes' : 'No',
        waiverConsent: (otherFormData.otherFormData || otherFormData).waiverConsent ? 'Yes' : 'No',
        newsletterSignup: (otherFormData.otherFormData || otherFormData).newsletterSignup ? 'Yes' : 'No',
        
        // Friends & Family Discount fields
        applyFriendsFamilyDiscount: applyFriendsFamilyDiscount ? 'true' : 'false',
        // Extra guest data (comma-separated)
        extraGuestNames: extraGuestNamesStr.substring(0, 500),
        extraGuestEmails: extraGuestEmailsStr.substring(0, 500),
        extraGuestMainCourses: extraGuestMainCoursesStr.substring(0, 500),
        // Legacy fields for backward compatibility (using comma-separated format)
        familyMemberNames: extraGuestNamesStr.substring(0, 500),
        familyMemberContacts: extraGuestEmailsStr.substring(0, 500),
        familyDiscountTerms: (otherFormData.otherFormData || otherFormData).familyDiscountTerms ? 'true' : 'false',
        totalTickets: String(totalAdultGuests),
        
        // Store essential additional data (optimized to fit Stripe's 500 char limit)
        additionalData: JSON.stringify({
          parent1Name: (otherFormData.otherFormData || otherFormData).parent1Name || '',
          parent2Name: (otherFormData.otherFormData || otherFormData).parent2Name || '',
          child1Name: (otherFormData.otherFormData || otherFormData).child1Name || '',
          child2Name: (otherFormData.otherFormData || otherFormData).child2Name || '',
          numberOfChildren: (otherFormData.otherFormData || otherFormData).numberOfChildren || '',
          emergencyName: (otherFormData.otherFormData || otherFormData).emergencyName || '',
          medicalInfo: (otherFormData.otherFormData || otherFormData).medicalInfo || '',
          howDidYouHear: (otherFormData.otherFormData || otherFormData).howDidYouHear || ''
        }).substring(0, 450)
      },
    };
    
    const session = await stripe.checkout.sessions.create(sessionData);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout session creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}




