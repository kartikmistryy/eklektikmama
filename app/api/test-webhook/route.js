import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      eventId, 
      eventSegment, 
      guardianName, 
      childName, 
      email: userEmail, 
      phone, 
      numberOfTickets = 1,
      ...additionalData 
    } = body;

    await connectDB();
    
    // Find the test event
    const testEvent = await Event.findById(eventId);
    if (!testEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Generate a test transaction ID
    const transactionId = `pi_test_${Date.now()}`;

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
        // Use the proper addBookingToEventSheet function
        const { addBookingToEventSheet } = await import('@/lib/googleSheets');
        
        // Prepare booking data for the function
        const bookingData = {
          guardianName,
          childName,
          email: userEmail,
          phone,
          numberOfTickets,
          transactionId,
          paymentStatus: 'paid',
          photographyConsent: additionalData.photographyConsent || 'No',
          // Add segment-specific data
          ...(eventSegment === 'cinemaMorning' && {
            childAge: additionalData.childAge || '',
            childGender: additionalData.childGender || '',
            dietaryRequirements: additionalData.allergies ? additionalData.allergies.join(', ') : '',
            emergencyContact: additionalData.emergencyName || '',
            emergencyPhone: additionalData.emergencyPhone || '',
            medicalConditions: additionalData.medicalConditions || ''
          }),
          ...(eventSegment === 'mamaBreakfast' && {
            childAge: additionalData.childAge || '',
            childGender: additionalData.childGender || '',
            dietaryRequirements: additionalData.allergies ? additionalData.allergies.join(', ') : '',
            emergencyContact: additionalData.emergencyName || '',
            emergencyPhone: additionalData.emergencyPhone || '',
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
            photographyConsent: additionalData.photographyConsent || 'No'
          })
        };

        await addBookingToEventSheet(bookingData, testEvent);
        sheetsResult = { success: true, message: 'Booking added to event sheet' };
      } catch (sheetsError) {
        console.error('Google Sheets Error:', sheetsError);
        sheetsResult = { success: false, error: sheetsError.message };
      }
    } else {
      console.log('Google Sheets not configured or event segment not provided');
      sheetsResult = { success: false, error: 'Not configured' };
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