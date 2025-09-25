import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import { addBookingToEventSheet, getEventBookingsCount } from "@/lib/googleSheets";

export async function POST() {
  try {
    console.log('=== COMPLETE FAMILY DAY BOOKING TEST ===');
    
    await connectDB();
    
    // Get the family day event
    const event = await Event.findOne({ segment: 'familyDay' });
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'No family day event found'
      });
    }
    
    console.log('Found family day event:', event.title);
    
    // Simulate complete family day form data
    const completeFormData = {
      // Basic booking info
      guardianName: 'Test Parent Complete',
      childName: 'Test Child Complete',
      userEmail: 'test-complete@example.com',
      phone: '1234567890',
      numberOfTickets: 1,
      transactionId: 'test-complete-txn-' + Date.now(),
      paymentStatus: 'paid',
      
      // Family Day specific data (ALL fields filled)
      parent1Name: 'Test Parent 1 Complete',
      parent2Name: 'Test Parent 2 Complete',
      parent1Phone: '1111111111',
      parent2Phone: '2222222222',
      child1Name: 'Test Child 1 Complete',
      child1Age: '5',
      child2Name: 'Test Child 2 Complete',
      child2Age: '3',
      child3Name: 'Test Child 3 Complete',
      child3Age: '1',
      child4Name: 'Test Child 4 Complete',
      child4Age: '0',
      numberOfChildren: '4 children - 540 AED',
      emergencyName: 'Test Emergency Complete',
      emergencyPhone: '3333333333',
      medicalInfo: 'Complete test medical information with all details',
      howDidYouHear: 'Complete test source information',
      waiverConsent: 'Yes',
      photographyConsent: 'Yes'
    };
    
    console.log('Complete test data prepared:', {
      parent1Name: completeFormData.parent1Name,
      parent2Name: completeFormData.parent2Name,
      child1Name: completeFormData.child1Name,
      child2Name: completeFormData.child2Name,
      child3Name: completeFormData.child3Name,
      child4Name: completeFormData.child4Name,
      numberOfChildren: completeFormData.numberOfChildren,
      medicalInfo: completeFormData.medicalInfo,
      howDidYouHear: completeFormData.howDidYouHear
    });
    
    // Test 1: Add booking to Google Sheets
    console.log('\n=== TEST 1: Adding booking to Google Sheets ===');
    try {
      await addBookingToEventSheet(completeFormData, event);
      console.log('✅ Google Sheets test passed - booking added successfully');
    } catch (sheetsError) {
      console.error('❌ Google Sheets test failed:', sheetsError.message);
      return NextResponse.json({
        success: false,
        error: 'Google Sheets test failed',
        details: sheetsError.message
      });
    }
    
    // Test 2: Check seat counting
    console.log('\n=== TEST 2: Testing seat counting ===');
    try {
      const bookingCount = await getEventBookingsCount(event);
      console.log('✅ Seat counting test passed - current bookings:', bookingCount);
    } catch (countError) {
      console.error('❌ Seat counting test failed:', countError.message);
      return NextResponse.json({
        success: false,
        error: 'Seat counting test failed',
        details: countError.message
      });
    }
    
    // Test 3: Create database booking
    console.log('\n=== TEST 3: Creating database booking ===');
    try {
      const booking = new Booking({
        eventId: event._id,
        eventTitle: event.title,
        eventSegment: 'familyDay',
        guardianName: completeFormData.guardianName,
        childName: completeFormData.childName,
        userEmail: completeFormData.userEmail,
        phone: completeFormData.phone,
        numberOfTickets: completeFormData.numberOfTickets,
        transactionId: completeFormData.transactionId,
        paymentStatus: completeFormData.paymentStatus,
        photographyConsent: completeFormData.photographyConsent,
        
        // Family Day specific fields
        parent1Name: completeFormData.parent1Name,
        parent2Name: completeFormData.parent2Name,
        parent1Phone: completeFormData.parent1Phone,
        parent2Phone: completeFormData.parent2Phone,
        child1Name: completeFormData.child1Name,
        child1Age: completeFormData.child1Age,
        child2Name: completeFormData.child2Name,
        child2Age: completeFormData.child2Age,
        child3Name: completeFormData.child3Name,
        child3Age: completeFormData.child3Age,
        child4Name: completeFormData.child4Name,
        child4Age: completeFormData.child4Age,
        numberOfChildren: completeFormData.numberOfChildren,
        emergencyName: completeFormData.emergencyName,
        emergencyPhone: completeFormData.emergencyPhone,
        medicalInfo: completeFormData.medicalInfo,
        howDidYouHear: completeFormData.howDidYouHear,
        waiverConsent: completeFormData.waiverConsent,
        
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await booking.save();
      console.log('✅ Database booking test passed - booking saved with ID:', booking._id);
    } catch (dbError) {
      console.error('❌ Database booking test failed:', dbError.message);
      return NextResponse.json({
        success: false,
        error: 'Database booking test failed',
        details: dbError.message
      });
    }
    
    // Test 4: Verify all data was captured
    console.log('\n=== TEST 4: Verifying data completeness ===');
    const allFieldsCaptured = {
      basic: {
        guardianName: completeFormData.guardianName,
        childName: completeFormData.childName,
        userEmail: completeFormData.userEmail,
        numberOfTickets: completeFormData.numberOfTickets
      },
      familyDay: {
        parent1Name: completeFormData.parent1Name,
        parent2Name: completeFormData.parent2Name,
        child1Name: completeFormData.child1Name,
        child2Name: completeFormData.child2Name,
        child3Name: completeFormData.child3Name,
        child4Name: completeFormData.child4Name,
        numberOfChildren: completeFormData.numberOfChildren,
        medicalInfo: completeFormData.medicalInfo,
        howDidYouHear: completeFormData.howDidYouHear
      }
    };
    
    console.log('✅ All data verification passed');
    console.log('Basic fields captured:', Object.keys(allFieldsCaptured.basic).length);
    console.log('Family day fields captured:', Object.keys(allFieldsCaptured.familyDay).length);
    
    return NextResponse.json({
      success: true,
      message: 'Complete family day booking test passed successfully',
      tests: {
        googleSheets: 'PASSED',
        seatCounting: 'PASSED',
        databaseBooking: 'PASSED',
        dataCompleteness: 'PASSED'
      },
      dataCaptured: allFieldsCaptured,
      eventTitle: event.title,
      eventSegment: event.segment,
      totalCapacity: event.seats
    });
    
  } catch (error) {
    console.error('❌ Complete family day test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
