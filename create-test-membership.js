// Script to create a test membership for testing the discount flow
// Run with: node create-test-membership.js

const mongoose = require('mongoose');

// Connect to your database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eklektikmama');
    console.log('✅ Connected to database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Create test membership
const createTestMembership = async () => {
  try {
    await connectDB();
    
    // Define the membership schema
    const membershipSchema = new mongoose.Schema({
      email: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: String,
      membershipType: { type: String, enum: ["monthly", "annual"], required: true },
      status: { type: String, enum: ["pending", "active", "cancelled", "expired", "past_due"], default: "active" },
      stripeCustomerId: { type: String, required: true },
      stripeSubscriptionId: String,
      stripePriceId: { type: String, required: true },
      currentPeriodStart: { type: Date, default: Date.now },
      currentPeriodEnd: { type: Date, default: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days from now
      cancelAtPeriodEnd: { type: Boolean, default: false },
      discountPercentage: { type: Number, default: 10 },
      totalSavings: { type: Number, default: 0 },
      signupDate: { type: Date, default: Date.now },
      notes: String,
      source: { type: String, default: "test" }
    }, { timestamps: true });
    
    const Membership = mongoose.models.Membership || mongoose.model("Membership", membershipSchema);
    
    // Create test membership
    const testMembership = new Membership({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'Member',
      phone: '+1234567890',
      membershipType: 'monthly',
      status: 'active',
      stripeCustomerId: 'cus_test123',
      stripePriceId: 'price_test123',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      discountPercentage: 10,
      notes: 'Test membership for discount testing'
    });
    
    // Check if membership already exists
    const existing = await Membership.findOne({ email: 'test@example.com' });
    if (existing) {
      console.log('ℹ️ Test membership already exists');
      console.log('📧 Email: test@example.com');
      console.log('✅ Status:', existing.status);
      return;
    }
    
    await testMembership.save();
    console.log('✅ Test membership created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('👤 Name: Test Member');
    console.log('📅 Status: Active');
    console.log('💳 Membership: Monthly');
    console.log('🎯 Discount: 10%');
    
    console.log('\n🧪 Now you can test the discount flow:');
    console.log('1. Go to /shop in your app');
    console.log('2. Enter email: test@example.com');
    console.log('3. Click "Verify"');
    console.log('4. Should see "Membership Verified!"');
    console.log('5. Add products to cart');
    console.log('6. Check cart - should show discount');
    console.log('7. Proceed to checkout - should show 10% off');
    
  } catch (error) {
    console.error('❌ Error creating test membership:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createTestMembership();

