#!/usr/bin/env node

/**
 * Cleanup script for test data
 * Run this with: node cleanup-test-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const Event = require('./models/Event.js').default;
const Booking = require('./models/Booking.js').default;

async function cleanupTestData() {
  try {
    console.log('🧹 Starting test data cleanup...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Find and delete test events
    const testEvents = await Event.find({
      $or: [
        { title: /test/i },
        { title: /Test/i },
        { description: /test/i },
        { description: /Test/i }
      ]
    });
    
    console.log(`📋 Found ${testEvents.length} test events to clean up:`);
    
    for (const event of testEvents) {
      console.log(`   - ${event.title} (ID: ${event._id})`);
      
      // Delete related bookings
      const deletedBookings = await Booking.deleteMany({ eventId: event._id });
      console.log(`     ✅ Deleted ${deletedBookings.deletedCount} related bookings`);
      
      // Delete the event
      await Event.findByIdAndDelete(event._id);
      console.log(`     ✅ Deleted event`);
    }
    
    if (testEvents.length === 0) {
      console.log('✅ No test events found - database is clean!');
    }
    
    console.log('\n🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupTestData();
}

module.exports = { cleanupTestData };
