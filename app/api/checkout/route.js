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
    
    // Debug logging for family day events
    console.log('=== FAMILY DAY FORM DEBUG ===');
    console.log('Event Segment:', eventSegment);
    console.log('Full body received:', JSON.stringify(body, null, 2));
    console.log('Extracted fields:');
    console.log('- eventId:', eventId);
    console.log('- guardianName:', guardianName);
    console.log('- childName:', childName);
    console.log('- email:', email);
    console.log('- phone:', phone);
    console.log('- numberOfTickets:', numberOfTickets);
    console.log('- eventSegment:', eventSegment);
    console.log('Other form data:', JSON.stringify(otherFormData, null, 2));
    console.log('=== END DEBUG ===');
    
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
      console.log('=== FAMILY DAY VALIDATION ===');
      // Check if the data is nested in otherFormData.otherFormData
      const formData = otherFormData.otherFormData || otherFormData;
      console.log('Checking parent1Name:', formData.parent1Name);
      console.log('Checking child1Name:', formData.child1Name);
      console.log('Checking numberOfChildren:', formData.numberOfChildren);
      
      if (!formData.parent1Name) {
        console.log('❌ Validation failed: parent1Name missing');
        return NextResponse.json({ error: 'Parent/Guardian 1 name is required' }, { status: 400 });
      }
      if (!formData.child1Name) {
        console.log('❌ Validation failed: child1Name missing');
        return NextResponse.json({ error: 'At least one child name is required' }, { status: 400 });
      }
      if (!formData.numberOfChildren) {
        console.log('❌ Validation failed: numberOfChildren missing');
        return NextResponse.json({ error: 'Number of children selection is required' }, { status: 400 });
      }
      console.log('✅ Family day validation passed');
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

    // Validate event price
    if (!event.price || event.price <= 0) {
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
    
    const discountedPrice = isMember ? originalPrice * (1 - memberDiscount / 100) : originalPrice;
    
    // Debug logging
    console.log('Event checkout debug:', {
      eventSegment: event.segment,
      numberOfChildren: event.segment === 'familyDay' ? (otherFormData.numberOfChildren || 'not provided') : 'N/A',
      originalPrice,
      discountedPrice,
      isMember,
      memberDiscount,
      memberSavings: isMember ? originalPrice - discountedPrice : 0
    });
    
    // Create line item with discounted price (simpler approach)
    const finalPrice = Math.max(0, Math.round(discountedPrice * 100));
    
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
    
    console.log('Final pricing:', {
      originalPrice,
      discountedPrice,
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
        quantity: parseInt(numberOfTickets) || 1,
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
        
        // Choice fields for all events
        choiceI: (otherFormData.choiceI || '').substring(0, 100),
        choiceII: (otherFormData.choiceII || '').substring(0, 100),
        choiceIII: (otherFormData.choiceIII || '').substring(0, 100),
        
        // Emergency contact information
        emergencyName: (otherFormData.emergencyName || '').substring(0, 100),
        emergencyPhone: (otherFormData.emergencyPhone || '').substring(0, 100),
        
        // Child information
        childDob: otherFormData.childDob || '',
        childAge: otherFormData.childAge || '',
        childGender: (otherFormData.childGender || '').substring(0, 50),
        
        // Allergy and dietary information
        allergies: Array.isArray(otherFormData.allergies) ? otherFormData.allergies.join(',').substring(0, 200) : (otherFormData.allergies || ''),
        dietaryRequirements: (otherFormData.dietaryRequirements || '').substring(0, 200),
        foodAllergies: (otherFormData.foodAllergies || '').substring(0, 200),
        
        // Medical information
        medicalConditions: (otherFormData.medicalConditions || '').substring(0, 200),
        conditionDetails: (otherFormData.conditionDetails || '').substring(0, 200),
        medicalInfo: (otherFormData.medicalInfo || '').substring(0, 200),
        
        // MamaFit specific fields
        pregnant: otherFormData.pregnant || '',
        postpartum: otherFormData.postpartum || '',
        postpartumDuration: (otherFormData.postpartumDuration || '').substring(0, 100),
        fitnessLevel: (otherFormData.fitnessLevel || '').substring(0, 50),
        
        // Hello Chef specific fields
        cookingExperience: otherFormData.cookingExperience || '',
        favoriteFoods: (otherFormData.favoriteFoods || '').substring(0, 200),
        
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
        
        // Special requests and preferences
        specialRequests: (otherFormData.specialRequests || '').substring(0, 200),
        tablePreferences: (otherFormData.tablePreferences || '').substring(0, 200),
        additionalNotes: (otherFormData.additionalNotes || '').substring(0, 200),
        notes: (otherFormData.notes || '').substring(0, 200),
        
        // Consent fields
        photographyConsent: otherFormData.photographyConsent ? 'Yes' : 'No',
        waiverConsent: otherFormData.waiverConsent ? 'Yes' : 'No',
        
        // Store all additional data as JSON for comprehensive storage
        additionalData: JSON.stringify(otherFormData)
      },
    };
    
    const session = await stripe.checkout.sessions.create(sessionData);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout session creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}




