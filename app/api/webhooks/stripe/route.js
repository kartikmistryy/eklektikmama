import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import { addBookingToEventSheet, addBookingToGeneralSheet } from "@/lib/googleSheets";
import { sendBookingConfirmationEmail } from "@/lib/mailchimp";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');


  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Check if payment actually succeeded
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true, message: 'Payment not successful, skipping processing' });
    }

    // Only process event ticket checkouts (not membership checkouts)
    // Membership checkouts have 'membershipType' in metadata, event checkouts have 'eventId'
    if (!session.metadata?.eventId) {
      console.log('No eventId in metadata, skipping event webhook processing (likely a membership checkout)');
      return NextResponse.json({ received: true, message: 'Not an event checkout, skipping' });
    }
    
    try {
      await connectDB();
      const eventId = session.metadata?.eventId;
      
      const paidEvent = await Event.findById(eventId);
      if (!paidEvent) throw new Error('Event not found for booking');

      const transactionId = session.payment_intent || session.id;
      const guardianName = session.metadata?.guardianName || session.customer_details?.name || '';
      const userEmail = session.metadata?.email || session.customer_details?.email || '';
      const childName = session.metadata?.childName || '';
      const phone = session.metadata?.phone || '';
      const numberOfTickets = parseInt(session.metadata?.numberOfTickets) || 1;
      const photographyConsent = session.metadata?.photographyConsent === 'Yes' ? 'Yes' : 'No';

      // Check if booking already exists to prevent duplicates
      const existingBooking = await Booking.findOne({ transactionId });
      if (existingBooking) {
        return NextResponse.json({ received: true, message: 'Booking already exists' });
      }

      // Parse additional data from metadata
      let additionalData = {};
      try {
        if (session.metadata?.additionalData) {
          additionalData = JSON.parse(session.metadata.additionalData);
        }
      } catch (parseError) {
        console.log('Error parsing additional data:', parseError);
      }

      // Extract all additional data from metadata
      const extractedData = {
        // Emergency contact information
        emergencyName: session.metadata?.emergencyName || additionalData.emergencyName || '',
        emergencyPhone: session.metadata?.emergencyPhone || additionalData.emergencyPhone || '',

        // Child information
        childAge: session.metadata?.childAge || additionalData.childAge || '',
        childGender: session.metadata?.childGender || additionalData.childGender || '',
        childDob: session.metadata?.childDob || additionalData.childDob || '',

        // Allergy and dietary information
        dietaryRequirements: session.metadata?.dietaryRequirements || (additionalData.allergies ? additionalData.allergies.join(', ') : '') || '',
        foodAllergies: session.metadata?.foodAllergies || additionalData.foodAllergies || '',
        allergies: session.metadata?.allergies || (Array.isArray(additionalData.allergies) ? additionalData.allergies.join(',') : additionalData.allergies) || '',

        // Medical information
        medicalConditions: session.metadata?.medicalConditions || additionalData.medicalConditions || '',
        conditionDetails: session.metadata?.conditionDetails || additionalData.conditionDetails || '',
        medicalInfo: session.metadata?.medicalInfo || additionalData.medicalInfo || '',

        // MamaFit specific fields
        pregnant: session.metadata?.pregnant || additionalData.pregnant || '',
        postpartum: session.metadata?.postpartum || additionalData.postpartum || '',
        postpartumDuration: session.metadata?.postpartumDuration || additionalData.postpartumDuration || '',
        fitnessLevel: session.metadata?.fitnessLevel || additionalData.fitnessLevel || '',

        // Hello Chef specific fields
        cookingExperience: session.metadata?.cookingExperience || additionalData.cookingExperience || '',
        favoriteFoods: session.metadata?.favoriteFoods || additionalData.favoriteFoods || '',

        // Family Day specific fields
        parent1Name: session.metadata?.parent1Name || additionalData.parent1Name || '',
        parent2Name: session.metadata?.parent2Name || additionalData.parent2Name || '',
        parent1Phone: session.metadata?.parent1Phone || additionalData.parent1Phone || '',
        parent2Phone: session.metadata?.parent2Phone || additionalData.parent2Phone || '',
        child1Name: session.metadata?.child1Name || additionalData.child1Name || '',
        child1Age: session.metadata?.child1Age || additionalData.child1Age || '',
        child2Name: session.metadata?.child2Name || additionalData.child2Name || '',
        child2Age: session.metadata?.child2Age || additionalData.child2Age || '',
        child3Name: session.metadata?.child3Name || additionalData.child3Name || '',
        child3Age: session.metadata?.child3Age || additionalData.child3Age || '',
        child4Name: session.metadata?.child4Name || additionalData.child4Name || '',
        child4Age: session.metadata?.child4Age || additionalData.child4Age || '',
        numberOfChildren: session.metadata?.numberOfChildren || additionalData.numberOfChildren || '',
        howDidYouHear: session.metadata?.howDidYouHear || additionalData.howDidYouHear || '',

        // Special requests and preferences
        specialRequests: session.metadata?.specialRequests || additionalData.specialRequests || '',
        tablePreferences: session.metadata?.tablePreferences || additionalData.tablePreferences || '',
        additionalNotes: session.metadata?.additionalNotes || additionalData.additionalNotes || '',
        notes: session.metadata?.notes || additionalData.notes || '',

        // Consent fields
        waiverConsent: session.metadata?.waiverConsent || additionalData.waiverConsent || '',

        // Choice fields
        choiceI: session.metadata?.choiceI || additionalData.choiceI || '',
        choiceII: session.metadata?.choiceII || additionalData.choiceII || '',
        choiceIII: session.metadata?.choiceIII || additionalData.choiceIII || '',

        // Event segment for reference
        eventSegment: session.metadata?.eventSegment || paidEvent.segment || '',

        // Member information
        isMember: session.metadata?.isMember === 'true' || false,
        memberSavings: parseFloat(session.metadata?.memberSavings) || 0,

        // Store all additional data for comprehensive storage
        additionalData: additionalData
      };

      // Generate ticket number for each ticket
      const ticketNumbers = [];
      for (let i = 1; i <= numberOfTickets; i++) {
        ticketNumbers.push(i);
      }

      // Create booking with all extracted data
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
        ticketNumbers,
        ...extractedData // Include all extracted form data
      });

      console.log('Booking created successfully:', booking._id);

      // Add booking to Google Sheets
      try {
        // Prepare booking data for Google Sheets
        const bookingData = {
          bookingId: booking._id.toString(),
          eventTitle: paidEvent.title,
          eventDate: paidEvent.date,
          eventSegment: extractedData.eventSegment,
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
          medicalInfo: extractedData.medicalInfo,
          howDidYouHear: extractedData.howDidYouHear,
          waiverConsent: extractedData.waiverConsent,
          fitnessLevel: extractedData.fitnessLevel,
          pregnant: extractedData.pregnant,
          postpartum: extractedData.postpartum,
          postpartumDuration: extractedData.postpartumDuration,
          cookingExperience: extractedData.cookingExperience,
          favoriteFoods: extractedData.favoriteFoods,
          mainCourseSelection: extractedData.choiceI, // Map choiceI to mainCourseSelection for mamaBreakfast
          isMember: extractedData.isMember,
          memberSavings: extractedData.memberSavings,
          bookingDate: new Date(),
          lastUpdated: new Date()
        };

        // Add to event-specific sheet
        await addBookingToEventSheet(paidEvent, bookingData);
        console.log('Booking added to event-specific sheet');

        // Add to general bookings sheet
        await addBookingToGeneralSheet(bookingData);
        console.log('Booking added to general bookings sheet');

      } catch (sheetsError) {
        console.error('Error adding booking to Google Sheets:', sheetsError);
        // Don't fail the webhook if Google Sheets fails
      }

      // Send booking confirmation email
      try {
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
            title: paidEvent.title,
            date: paidEvent.date,
            location: paidEvent.location,
            description: paidEvent.description,
            price: paidEvent.price
          }
        );
        
        if (emailResult.success) {
          console.log('Booking confirmation email sent successfully');
        } else {
          console.log('Failed to send booking confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError);
        // Don't fail the webhook if email fails
      }

    } catch (e) {
      console.error('Webhook processing error:', e);
      return NextResponse.json({ received: true, error: e.message }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}


