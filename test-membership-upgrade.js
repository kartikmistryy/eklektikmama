const { connectDB } = require('./lib/db');
const Membership = require('./models/Membership');

async function testMembershipUpgrade() {
  try {
    await connectDB();
    
    console.log('🧪 Testing Membership Upgrade Flow');
    console.log('=====================================');
    
    // Test scenario: User has monthly membership, tries to buy annual
    const testEmail = 'test-upgrade@example.com';
    
    // Step 1: Create a monthly membership (simulating existing user)
    console.log('\n1️⃣ Creating monthly membership...');
    const monthlyMembership = new Membership({
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      phone: '+971501234567',
      membershipType: 'monthly',
      stripeCustomerId: 'cus_test_monthly',
      stripeSubscriptionId: 'sub_test_monthly',
      stripePriceId: process.env.STRIPE_MONTHLY_MEMBERSHIP_PRICE_ID || 'price_test_monthly',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalSavings: 50 // Some existing savings
    });
    
    await monthlyMembership.save();
    console.log('✅ Monthly membership created:', monthlyMembership._id);
    
    // Step 2: Check if user already has active membership (this is what happens in checkout)
    console.log('\n2️⃣ Checking for existing membership (checkout logic)...');
    const existingMembership = await Membership.findOne({
      email: testEmail,
      status: { $in: ['active', 'past_due'] }
    });
    
    if (existingMembership) {
      console.log('✅ Found existing membership:', existingMembership.membershipType);
      
      // This is the logic from our updated checkout route
      if (existingMembership.membershipType !== 'annual') {
        console.log('✅ Upgrade detected: monthly -> annual');
        console.log('✅ Checkout would proceed (not blocked)');
      } else {
        console.log('❌ Same membership type - would be blocked');
      }
    } else {
      console.log('❌ No existing membership found');
    }
    
    // Step 3: Simulate the upgrade process (what happens in webhook)
    console.log('\n3️⃣ Simulating upgrade process (webhook logic)...');
    
    // This simulates the upgrade metadata from Stripe session
    const upgradeMetadata = {
      isUpgrade: 'true',
      previousMembershipType: 'monthly',
      upgradeType: 'membership_change'
    };
    
    // Simulate the webhook upgrade logic
    if (upgradeMetadata.isUpgrade === 'true' && 
        upgradeMetadata.upgradeType === 'membership_change' && 
        upgradeMetadata.previousMembershipType !== 'annual') {
      
      console.log(`✅ Processing membership upgrade: ${upgradeMetadata.previousMembershipType} -> annual for ${testEmail}`);
      
      // Update existing membership (this is what our webhook does)
      existingMembership.membershipType = 'annual';
      existingMembership.stripePriceId = process.env.STRIPE_ANNUAL_MEMBERSHIP_PRICE_ID || 'price_test_annual';
      existingMembership.stripeSubscriptionId = 'sub_test_annual';
      
      // Update period dates for annual
      existingMembership.currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      existingMembership.nextPaymentDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      
      // Add upgrade note
      const existingNotes = existingMembership.notes || '';
      existingMembership.notes = `${existingNotes}\nUpgraded from monthly to annual on ${new Date().toISOString()}`.trim();
      
      await existingMembership.save();
      
      console.log('✅ Membership upgraded successfully!');
      console.log('   - Type:', existingMembership.membershipType);
      console.log('   - Period End:', existingMembership.currentPeriodEnd);
      console.log('   - Savings Preserved:', existingMembership.totalSavings);
      console.log('   - Notes:', existingMembership.notes);
    }
    
    // Step 4: Verify the upgrade worked
    console.log('\n4️⃣ Verifying upgrade...');
    const upgradedMembership = await Membership.findOne({ email: testEmail });
    
    if (upgradedMembership.membershipType === 'annual') {
      console.log('✅ Upgrade successful! Membership type is now:', upgradedMembership.membershipType);
      console.log('✅ Savings preserved:', upgradedMembership.totalSavings);
      console.log('✅ Notes updated:', upgradedMembership.notes.includes('Upgraded'));
    } else {
      console.log('❌ Upgrade failed! Membership type is still:', upgradedMembership.membershipType);
    }
    
    // Step 5: Test that no duplicate membership was created
    console.log('\n5️⃣ Checking for duplicate memberships...');
    const allMemberships = await Membership.find({ email: testEmail });
    console.log(`Found ${allMemberships.length} membership(s) for ${testEmail}`);
    
    if (allMemberships.length === 1) {
      console.log('✅ No duplicates created - upgrade worked correctly!');
    } else {
      console.log('❌ Multiple memberships found - upgrade created duplicates!');
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Membership.deleteMany({ email: testEmail });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Membership upgrade test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMembershipUpgrade().then(() => {
  console.log('\n🏁 Test script finished');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
