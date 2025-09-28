#!/usr/bin/env node

/**
 * Debug script to check membership upgrade status
 */

import { connectDB } from './lib/db.js';
import Membership from './models/Membership.js';

async function debugUpgrade() {
  try {
    console.log('🔍 Debugging Membership Upgrade Status...\n');
    
    await connectDB();
    
    const email = 'kartikmistry301@gmail.com';
    
    // Find all memberships for this email
    const memberships = await Membership.find({ email }).sort({ createdAt: -1 });
    
    console.log(`Found ${memberships.length} membership records for ${email}:`);
    console.log('');
    
    memberships.forEach((membership, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${membership._id}`);
      console.log(`  Type: ${membership.membershipType}`);
      console.log(`  Status: ${membership.status}`);
      console.log(`  Created: ${membership.createdAt}`);
      console.log(`  Stripe Customer ID: ${membership.stripeCustomerId}`);
      console.log(`  Stripe Subscription ID: ${membership.stripeSubscriptionId}`);
      console.log(`  Current Period End: ${membership.currentPeriodEnd}`);
      console.log(`  Notes: ${membership.notes || 'None'}`);
      console.log('');
    });
    
    // Find the active membership
    const activeMembership = await Membership.findOne({
      email,
      status: { $in: ['active', 'past_due'] }
    }).sort({ createdAt: -1 });
    
    console.log('Active membership (what dashboard should show):');
    if (activeMembership) {
      console.log(`  Type: ${activeMembership.membershipType}`);
      console.log(`  Status: ${activeMembership.status}`);
      console.log(`  Created: ${activeMembership.createdAt}`);
    } else {
      console.log('  No active membership found');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the debug
debugUpgrade();
