import { NextResponse } from "next/server";
import { addBookingToEventSheet } from "@/lib/googleSheets";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";

export async function POST() {
  try {
    console.log('=== TESTING FAMILY DAY BOOKING ===');
    
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
    
    // Create test booking data
    const testBookingData = {
      bookingId: 'test-booking-' + Date.now(),
      eventTitle: event.title,
      eventDate: event.date,
      eventSegment: 'familyDay',
      guardianName: 'Test Parent',
      childName: 'Test Child',
      userEmail: 'test@example.com',
      phone: '1234567890',
      numberOfTickets: 1,
      transactionId: 'test-txn-' + Date.now(),
      paymentStatus: 'paid',
      photographyConsent: 'Yes',
      emergencyName: 'Test Emergency',
      emergencyPhone: '0987654321',
      childAge: '5',
      childGender: 'Male',
      childDob: '2020-01-01',
      dietaryRequirements: 'None',
      foodAllergies: 'None',
      allergies: 'None',
      medicalConditions: 'None',
      conditionDetails: 'None',
      medicalInfo: 'None',
      specialRequests: 'None',
      tablePreferences: 'None',
      additionalNotes: 'Test booking',
      notes: 'Test notes',
      // Family Day specific fields
      parent1Name: 'Test Parent 1',
      parent2Name: 'Test Parent 2',
      parent1Phone: '1234567890',
      parent2Phone: '0987654321',
      child1Name: 'Test Child 1',
      child1Age: '5',
      child2Name: 'Test Child 2',
      child2Age: '3',
      child3Name: '',
      child3Age: '',
      child4Name: '',
      child4Age: '',
      numberOfChildren: '2 children - 270 AED',
      howDidYouHear: 'Test source',
      waiverConsent: 'Yes',
      fitnessLevel: '',
      pregnant: '',
      postpartum: '',
      postpartumDuration: '',
      cookingExperience: '',
      favoriteFoods: '',
      mainCourseSelection: '',
      isMember: false,
      memberSavings: 0,
      bookingDate: new Date(),
      lastUpdated: new Date()
    };
    
    console.log('Test booking data:', {
      guardianName: testBookingData.guardianName,
      childName: testBookingData.childName,
      numberOfTickets: testBookingData.numberOfTickets,
      parent1Name: testBookingData.parent1Name,
      child1Name: testBookingData.child1Name,
      numberOfChildren: testBookingData.numberOfChildren
    });
    
    // Add booking to Google Sheets
    console.log('Adding test booking to Google Sheets...');
    await addBookingToEventSheet(testBookingData, event);
    console.log('✅ Test booking added successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Test family day booking added successfully',
      bookingData: {
        guardianName: testBookingData.guardianName,
        childName: testBookingData.childName,
        numberOfTickets: testBookingData.numberOfTickets,
        parent1Name: testBookingData.parent1Name,
        child1Name: testBookingData.child1Name
      }
    });
    
  } catch (error) {
    console.error('❌ Test family day booking failed:', error);
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
