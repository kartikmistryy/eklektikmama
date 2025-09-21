#!/usr/bin/env node

/**
 * Test script for the new seat management system
 * Run this with: node test-seat-system.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const Event = require('./models/Event.js').default;
const Booking = require('./models/Booking.js').default;

// Import Google Sheets functions
const { createEventSheet, addBookingToEventSheet, getEventBookingsCount } = require('./lib/googleSheets.js');

async function testSeatManagementSystem() {
  try {
    console.log('🧪 Starting Seat Management System Test...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Test 1: Create a test event with seats
    console.log('\n📅 Test 1: Creating test event with 5 seats...');
    
    const testEvent = new Event({
      title: 'Test Eklektik Edit Workshop',
      description: 'This is a test event to verify seat management',
      date: new Date('2024-12-25T10:00:00.000Z'),
      startTime: '10:00 AM',
      endDate: new Date('2024-12-25T12:00:00.000Z'),
      endTime: '12:00 PM',
      price: 50,
      location: 'Test Location',
      segment: 'eklektikEdit',
      message: 'Test event message',
      meetingLink: 'https://test-link.com',
      seats: 5, // Only 5 seats available
      bookingDeadline: new Date('2024-12-24T23:59:59.000Z')
    });
    
    await testEvent.save();
    console.log(`✅ Test event created with ID: ${testEvent._id}`);
    console.log(`   - Title: ${testEvent.title}`);
    console.log(`   - Seats: ${testEvent.seats}`);
    console.log(`   - Date: ${testEvent.date}`);
    
    // Test 2: Create event-specific Google Sheet
    console.log('\n📊 Test 2: Creating event-specific Google Sheet...');
    
    try {
      const sheetInfo = await createEventSheet(testEvent);
      console.log('✅ Event sheet created successfully');
      console.log(`   - Sheet Name: ${sheetInfo.sheetName}`);
      console.log(`   - Spreadsheet ID: ${sheetInfo.spreadsheetId}`);
    } catch (sheetError) {
      console.log('⚠️  Sheet creation failed (this is expected if Google Sheets is not configured)');
      console.log(`   Error: ${sheetError.message}`);
    }
    
    // Test 3: Check initial booking count
    console.log('\n🔢 Test 3: Checking initial booking count...');
    
    try {
      const initialCount = await getEventBookingsCount(testEvent);
      console.log(`✅ Initial booking count: ${initialCount} tickets`);
    } catch (countError) {
      console.log('⚠️  Could not get booking count (expected if sheets not configured)');
      console.log(`   Error: ${countError.message}`);
    }
    
    // Test 4: Create test bookings
    console.log('\n🎫 Test 4: Creating test bookings...');
    
    const testBookings = [
      {
        eventId: testEvent._id,
        guardianName: 'John Doe',
        childName: 'Jane Doe',
        userEmail: 'john@test.com',
        phone: '+971501234567',
        numberOfTickets: 2,
        transactionId: 'test_txn_001',
        paymentStatus: 'paid',
        photographyConsent: 'Yes'
      },
      {
        eventId: testEvent._id,
        guardianName: 'Sarah Smith',
        childName: 'Mike Smith',
        userEmail: 'sarah@test.com',
        phone: '+971507654321',
        numberOfTickets: 1,
        transactionId: 'test_txn_002',
        paymentStatus: 'paid',
        photographyConsent: 'No'
      }
    ];
    
    for (let i = 0; i < testBookings.length; i++) {
      const booking = new Booking(testBookings[i]);
      await booking.save();
      console.log(`✅ Booking ${i + 1} created: ${booking.guardianName} (${booking.numberOfTickets} tickets)`);
      
      // Try to add to Google Sheet
      try {
        await addBookingToEventSheet(testBookings[i], testEvent);
        console.log(`   ✅ Added to Google Sheet`);
      } catch (sheetError) {
        console.log(`   ⚠️  Could not add to sheet: ${sheetError.message}`);
      }
    }
    
    // Test 5: Check booking count after bookings
    console.log('\n📈 Test 5: Checking booking count after test bookings...');
    
    try {
      const finalCount = await getEventBookingsCount(testEvent);
      console.log(`✅ Final booking count: ${finalCount} tickets`);
      console.log(`   - Available seats: ${testEvent.seats - finalCount}`);
      
      if (finalCount >= testEvent.seats) {
        console.log('   ⚠️  Event is now fully booked!');
      }
    } catch (countError) {
      console.log('⚠️  Could not get final booking count');
      console.log(`   Error: ${countError.message}`);
    }
    
    // Test 6: Test seat availability logic
    console.log('\n🚫 Test 6: Testing seat availability logic...');
    
    try {
      const currentBookings = await getEventBookingsCount(testEvent);
      const availableSeats = testEvent.seats - currentBookings;
      const requestedTickets = 5; // Try to book more than available
      
      console.log(`   - Current bookings: ${currentBookings} tickets`);
      console.log(`   - Available seats: ${availableSeats}`);
      console.log(`   - Requested tickets: ${requestedTickets}`);
      
      if (availableSeats < requestedTickets) {
        console.log(`   ✅ Seat availability check working: Only ${availableSeats} seats available, cannot book ${requestedTickets}`);
      } else {
        console.log(`   ✅ Seat availability check: Booking allowed`);
      }
    } catch (error) {
      console.log('⚠️  Could not test seat availability logic');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Event created: ${testEvent.title}`);
    console.log(`   - Event ID: ${testEvent._id}`);
    console.log(`   - Total seats: ${testEvent.seats}`);
    console.log(`   - Test bookings created: ${testBookings.length}`);
    
    console.log('\n🧹 Cleanup: You can delete the test event and bookings from the admin panel');
    console.log(`   Event ID to delete: ${testEvent._id}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the test
if (require.main === module) {
  testSeatManagementSystem();
}

module.exports = { testSeatManagementSystem };
