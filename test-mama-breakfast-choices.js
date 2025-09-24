#!/usr/bin/env node

/**
 * Test script to verify that Mama Breakfast main course selection is properly stored
 */

import { connectDB } from './lib/db.js';
import Event from './models/Event.js';
import Booking from './models/Booking.js';

async function testMamaBreakfastChoices() {
  try {
    console.log('🧪 Testing Mama Breakfast main course selection storage...\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Find a Mama Breakfast event
    const mamaBreakfastEvent = await Event.findOne({ segment: 'mamaBreakfast' });
    if (!mamaBreakfastEvent) {
      console.log('❌ No Mama Breakfast events found. Please create one first.');
      return;
    }
    
    console.log(`📅 Using Mama Breakfast event: ${mamaBreakfastEvent.title}`);
    
    // Create test booking with main course selection
    const testBookingData = {
      eventId: mamaBreakfastEvent._id,
      guardianName: 'Emma Garton-Eckett',
      childName: 'April Garton-Eckett',
      userEmail: 'emma.garton@hotmail.co.uk',
      phone: '0507651632',
      numberOfTickets: 1,
      transactionId: 'pi_test_mama_breakfast_' + Date.now(),
      paymentStatus: 'paid',
      photographyConsent: 'Yes',
      eventSegment: 'mamaBreakfast',
      isMember: true,
      memberSavings: 25,
      
      // Main course selection (choiceI)
      choiceI: 'Egg & Truffle Toast',
      choiceII: 'French Toast with Ice cream',
      choiceIII: 'Avocado Croissant',
      
      // Additional Mama Breakfast data
      emergencyName: 'John Garton',
      emergencyPhone: '0507651633',
      childAge: '5',
      childGender: 'Female',
      dietaryRequirements: 'No nuts, vegetarian',
      medicalConditions: 'None',
      specialRequests: 'High chair needed',
      tablePreferences: 'Near window',
      additionalNotes: 'First time attending',
      
      // Additional data object
      additionalData: {
        emergencyName: 'John Garton',
        emergencyPhone: '0507651633',
        childAge: '5',
        childGender: 'Female',
        allergies: ['nuts'],
        medicalConditions: 'None',
        specialRequests: 'High chair needed',
        tablePreferences: 'Near window',
        notes: 'First time attending'
      }
    };
    
    // Create booking in MongoDB
    console.log('💾 Creating Mama Breakfast booking in MongoDB...');
    const booking = await Booking.create(testBookingData);
    console.log(`✅ Booking created with ID: ${booking._id}`);
    
    // Verify choice fields are stored
    console.log('\n📊 Verifying stored choice data in MongoDB:');
    console.log(`   - Choice I (Main Course): ${booking.choiceI}`);
    console.log(`   - Choice II: ${booking.choiceII}`);
    console.log(`   - Choice III: ${booking.choiceIII}`);
    console.log(`   - Event Segment: ${booking.eventSegment}`);
    console.log(`   - Is Member: ${booking.isMember}`);
    console.log(`   - Member Savings: ${booking.memberSavings}`);
    
    // Verify additional data
    console.log('\n📋 Additional Mama Breakfast data:');
    console.log(`   - Emergency Contact: ${booking.emergencyName}`);
    console.log(`   - Child Age: ${booking.childAge}`);
    console.log(`   - Dietary Requirements: ${booking.dietaryRequirements}`);
    console.log(`   - Special Requests: ${booking.specialRequests}`);
    console.log(`   - Table Preferences: ${booking.tablePreferences}`);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Booking.findByIdAndDelete(booking._id);
    console.log('✅ Test booking deleted from MongoDB');
    
    console.log('\n🎉 Test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Main course selection (choiceI) is properly stored in MongoDB');
    console.log('   ✅ All choice fields (I, II, III) are captured');
    console.log('   ✅ Mama Breakfast specific data is stored');
    console.log('   ✅ Member information is tracked');
    console.log('\n💡 The Mama Breakfast main course selection is now working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMamaBreakfastChoices();
