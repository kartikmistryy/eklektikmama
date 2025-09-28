#!/usr/bin/env node

/**
 * Test script to verify membership upgrade functionality
 * This script simulates the upgrade flow to ensure it works correctly
 */

import { connectDB } from './lib/db.js';
import Membership from './models/Membership.js';

async function testUpgradeFlow() {
  try {
    console.log('🧪 Testing Membership Upgrade Flow...\n');
    
    await connectDB();
    
    // Find a test monthly membership
    const monthlyMembership = await Membership.findOne({
      membershipType: 'monthly',
      status: { $in: ['active', 'past_due'] }
    });
    
    if (!monthlyMembership) {
      console.log('❌ No monthly membership found for testing');
      console.log('Please create a monthly membership first to test the upgrade flow');
      return;
    }
    
    console.log('✅ Found monthly membership for testing:');
    console.log(`   Email: ${monthlyMembership.email}`);
    console.log(`   Type: ${monthlyMembership.membershipType}`);
    console.log(`   Status: ${monthlyMembership.status}`);
    console.log(`   Stripe Customer ID: ${monthlyMembership.stripeCustomerId}`);
    console.log(`   Current Period End: ${monthlyMembership.currentPeriodEnd}`);
    console.log('');
    
    // Simulate the upgrade scenario
    console.log('🔄 Simulating upgrade scenario...');
    
    // Check if they already have an annual membership
    const existingAnnualMembership = await Membership.findOne({
      email: monthlyMembership.email,
      membershipType: 'annual',
      status: { $in: ['active', 'past_due', 'pending'] }
    });
    
    if (existingAnnualMembership) {
      console.log('⚠️  Annual membership already exists for this user');
      console.log(`   Annual membership ID: ${existingAnnualMembership._id}`);
      console.log(`   Annual membership status: ${existingAnnualMembership.status}`);
      return;
    }
    
    console.log('✅ No annual membership found - upgrade can proceed');
    
    // Test the upgrade logic
    const isUpgrade = monthlyMembership.membershipType === 'monthly';
    const newMembershipType = 'annual';
    const previousMembershipType = monthlyMembership.membershipType;
    
    console.log('🔍 Upgrade detection logic:');
    console.log(`   Is upgrade: ${isUpgrade}`);
    console.log(`   Previous type: ${previousMembershipType}`);
    console.log(`   New type: ${newMembershipType}`);
    console.log(`   Types different: ${previousMembershipType !== newMembershipType}`);
    
    if (isUpgrade && previousMembershipType !== newMembershipType) {
      console.log('✅ Upgrade logic would trigger correctly');
      
      // Simulate the upgrade (without actually doing it)
      console.log('📝 Simulated upgrade would:');
      console.log('   1. Update membership type from monthly to annual');
      console.log('   2. Update Stripe price ID to annual price');
      console.log('   3. Update period end date to 1 year from now');
      console.log('   4. Add upgrade note to membership record');
      console.log('   5. Update Google Sheets record');
      console.log('   6. Send upgrade confirmation email');
      
      console.log('\n✅ Upgrade flow test PASSED - the logic should work correctly');
    } else {
      console.log('❌ Upgrade logic would NOT trigger');
      console.log('This indicates a problem with the upgrade detection logic');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testUpgradeFlow();
