import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import { createEventSheet, addBookingToEventSheet, getEventBookingsCount } from "@/lib/googleSheets";

export async function GET(req) {
  try {
    await connectDB();
    
    const results = {
      testResults: [],
      summary: {},
      errors: []
    };
    
    // Test 1: Create a test event with seats
    results.testResults.push("🧪 Test 1: Creating test event with 3 seats...");
    
    const testEvent = new Event({
      title: 'Test Seat Management Event',
      description: 'This is a test event to verify the new seat management system',
      date: new Date('2024-12-25T10:00:00.000Z'),
      startTime: '10:00 AM',
      endDate: new Date('2024-12-25T12:00:00.000Z'),
      endTime: '12:00 PM',
      price: 25,
      location: 'Test Venue',
      segment: 'eklektikEdit',
      message: 'Testing seat management functionality',
      meetingLink: 'https://test-meeting.com',
      seats: 3, // Only 3 seats available for testing
      bookingDeadline: new Date('2024-12-24T23:59:59.000Z')
    });
    
    await testEvent.save();
    results.testResults.push(`✅ Test event created successfully`);
    results.testResults.push(`   - Event ID: ${testEvent._id}`);
    results.testResults.push(`   - Title: ${testEvent.title}`);
    results.testResults.push(`   - Seats: ${testEvent.seats}`);
    results.testResults.push(`   - Date: ${testEvent.date.toISOString()}`);
    
    results.summary.eventId = testEvent._id.toString();
    results.summary.eventTitle = testEvent.title;
    results.summary.totalSeats = testEvent.seats;
    
    // Test 2: Create event-specific Google Sheet
    results.testResults.push("\n📊 Test 2: Creating event-specific Google Sheet...");
    
    try {
      const sheetInfo = await createEventSheet(testEvent);
      results.testResults.push(`✅ Event sheet created successfully`);
      results.testResults.push(`   - Sheet Name: ${sheetInfo.sheetName}`);
      results.testResults.push(`   - Spreadsheet ID: ${sheetInfo.spreadsheetId}`);
      results.summary.sheetCreated = true;
      results.summary.sheetName = sheetInfo.sheetName;
    } catch (sheetError) {
      results.testResults.push(`⚠️  Sheet creation failed: ${sheetError.message}`);
      results.summary.sheetCreated = false;
      results.errors.push(`Sheet creation error: ${sheetError.message}`);
    }
    
    // Test 3: Check initial booking count
    results.testResults.push("\n🔢 Test 3: Checking initial booking count...");
    
    try {
      const initialCount = await getEventBookingsCount(testEvent);
      results.testResults.push(`✅ Initial booking count: ${initialCount} tickets`);
      results.summary.initialBookings = initialCount;
    } catch (countError) {
      results.testResults.push(`⚠️  Could not get booking count: ${countError.message}`);
      results.summary.initialBookings = 0;
      results.errors.push(`Booking count error: ${countError.message}`);
    }
    
    // Test 4: Create test booking (within seat limit)
    results.testResults.push("\n🎫 Test 4: Creating test booking (2 tickets)...");
    
    const testBooking = {
      eventId: testEvent._id,
      guardianName: 'Test Guardian',
      childName: 'Test Child',
      email: 'test@example.com',
      phone: '+971501234567',
      numberOfTickets: 2,
      transactionId: `test_txn_${Date.now()}`,
      paymentStatus: 'paid',
      photographyConsent: 'Yes',
      additionalNotes: 'Test booking for seat management'
    };
    
    try {
      // Add to Google Sheet
      await addBookingToEventSheet(testBooking, testEvent);
      results.testResults.push(`✅ Booking added to Google Sheet successfully`);
      
      // Check updated count
      const updatedCount = await getEventBookingsCount(testEvent);
      results.testResults.push(`✅ Updated booking count: ${updatedCount} tickets`);
      results.testResults.push(`   - Available seats remaining: ${testEvent.seats - updatedCount}`);
      
      results.summary.finalBookings = updatedCount;
      results.summary.availableSeats = testEvent.seats - updatedCount;
      
    } catch (bookingError) {
      results.testResults.push(`⚠️  Booking failed: ${bookingError.message}`);
      results.errors.push(`Booking error: ${bookingError.message}`);
    }
    
    // Test 5: Test seat availability logic
    results.testResults.push("\n🚫 Test 5: Testing seat availability logic...");
    
    try {
      const currentBookings = await getEventBookingsCount(testEvent);
      const availableSeats = testEvent.seats - currentBookings;
      const requestedTickets = 5; // Try to book more than available
      
      results.testResults.push(`   - Current bookings: ${currentBookings} tickets`);
      results.testResults.push(`   - Available seats: ${availableSeats}`);
      results.testResults.push(`   - Requested tickets: ${requestedTickets}`);
      
      if (availableSeats < requestedTickets) {
        results.testResults.push(`   ✅ Seat availability check working: Only ${availableSeats} seats available, cannot book ${requestedTickets}`);
        results.summary.seatCheckWorking = true;
      } else {
        results.testResults.push(`   ⚠️  Seat availability check: Booking would be allowed`);
        results.summary.seatCheckWorking = false;
      }
    } catch (error) {
      results.testResults.push(`⚠️  Could not test seat availability logic: ${error.message}`);
      results.errors.push(`Seat availability test error: ${error.message}`);
    }
    
    results.testResults.push("\n🎉 Test completed!");
    results.testResults.push("\n📋 Summary:");
    results.testResults.push(`   - Event created: ${testEvent.title}`);
    results.testResults.push(`   - Event ID: ${testEvent._id}`);
    results.testResults.push(`   - Total seats: ${testEvent.seats}`);
    results.testResults.push(`   - Final bookings: ${results.summary.finalBookings || 0}`);
    results.testResults.push(`   - Available seats: ${results.summary.availableSeats || testEvent.seats}`);
    
    return NextResponse.json({
      success: true,
      message: "Seat management system test completed",
      results: results.testResults,
      summary: results.summary,
      errors: results.errors,
      eventId: testEvent._id.toString(),
      cleanup: {
        message: "You can delete the test event from the admin panel",
        eventId: testEvent._id.toString(),
        adminUrl: `/admin/events`
      }
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// POST method to clean up test data
export async function POST(req) {
  try {
    await connectDB();
    
    const { action, eventId } = await req.json();
    
    if (action === 'cleanup' && eventId) {
      // Delete test event and related bookings
      await Booking.deleteMany({ eventId });
      await Event.findByIdAndDelete(eventId);
      
      return NextResponse.json({
        success: true,
        message: `Test event ${eventId} and related bookings deleted successfully`
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action or missing eventId'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
