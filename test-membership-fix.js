// Test script to manually send email and add to Google Sheets for existing membership
const { connectDB } = require('./lib/db');
const Membership = require('./models/Membership');
const { addMemberToSheet } = require('./lib/googleSheets');
const { sendMemberWelcomeEmail } = require('./lib/memberEmails');

async function testMembershipFix() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDB();
    
    // Find the existing membership
    const membership = await Membership.findOne({ 
      email: 'kartikmistry301@gmail.com',
      status: 'active'
    });
    
    if (!membership) {
      console.log('❌ No active membership found for kartikmistry301@gmail.com');
      return;
    }
    
    console.log('✅ Found membership:', membership.firstName, membership.lastName);
    console.log('📧 Email:', membership.email);
    console.log('💳 Status:', membership.status);
    
    // Test Google Sheets
    console.log('\n📊 Testing Google Sheets...');
    try {
      const rowId = await addMemberToSheet(membership);
      console.log('✅ Added to Google Sheets with row ID:', rowId);
    } catch (error) {
      console.error('❌ Google Sheets error:', error.message);
      console.error('Full error:', error);
    }
    
    // Test email
    console.log('\n📧 Testing email...');
    try {
      const result = await sendMemberWelcomeEmail(membership);
      console.log('✅ Welcome email sent:', result.messageId);
    } catch (error) {
      console.error('❌ Email error:', error.message);
      console.error('Full error:', error);
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
  
  process.exit(0);
}

testMembershipFix();
