const { connectDB } = require('./lib/db');
const Membership = require('./models/Membership');
const { sendMembershipExpirationReminderEmail } = require('./lib/memberEmails');
const { updateMemberInSheet } = require('./lib/googleSheets');

async function checkMembershipExpirations() {
  try {
    console.log('Starting membership expiration check...');
    
    await connectDB();
    
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Find memberships that expire in exactly 7 days
    const membershipsExpiringIn7Days = await Membership.find({
      status: 'active',
      currentPeriodEnd: {
        $gte: new Date(sevenDaysFromNow.getTime() - 24 * 60 * 60 * 1000), // 6 days from now
        $lte: sevenDaysFromNow // 7 days from now
      }
    });

    // Find memberships that have already expired but status is still 'active'
    const expiredMemberships = await Membership.find({
      status: 'active',
      currentPeriodEnd: { $lte: now }
    });

    let remindersSent = 0;
    let membershipsExpired = 0;

    console.log(`Found ${membershipsExpiringIn7Days.length} memberships expiring in 7 days`);
    console.log(`Found ${expiredMemberships.length} expired memberships to update`);

    // Send expiration reminders
    for (const membership of membershipsExpiringIn7Days) {
      try {
        const daysUntilExpiry = Math.ceil((new Date(membership.currentPeriodEnd) - now) / (1000 * 60 * 60 * 24));
        
        await sendMembershipExpirationReminderEmail(
          {
            firstName: membership.firstName,
            lastName: membership.lastName,
            email: membership.email
          },
          {
            membershipType: membership.membershipType,
            currentPeriodEnd: membership.currentPeriodEnd,
            daysUntilExpiry: daysUntilExpiry
          }
        );
        
        remindersSent++;
        console.log(`✓ Expiration reminder sent to ${membership.email} (${membership.membershipType} - ${daysUntilExpiry} days)`);
        
      } catch (error) {
        console.error(`✗ Error sending reminder to ${membership.email}:`, error.message);
      }
    }

    // Update expired memberships
    for (const membership of expiredMemberships) {
      try {
        const wasExpired = await membership.checkAndExpire();
        
        if (wasExpired) {
          membershipsExpired++;
          
          // Update Google Sheets
          try {
            await updateMemberInSheet(membership.email, {
              'Status': 'expired'
            });
            console.log(`✓ Updated Google Sheets for expired membership: ${membership.email}`);
          } catch (error) {
            console.error(`✗ Error updating Google Sheets for ${membership.email}:`, error.message);
          }
          
          console.log(`✓ Membership expired: ${membership.email} (${membership.membershipType})`);
        }
        
      } catch (error) {
        console.error(`✗ Error expiring membership for ${membership.email}:`, error.message);
      }
    }

    console.log('\n=== EXPIRATION CHECK COMPLETED ===');
    console.log(`Reminders sent: ${remindersSent}`);
    console.log(`Memberships expired: ${membershipsExpired}`);
    console.log(`Memberships expiring in 7 days: ${membershipsExpiringIn7Days.length}`);
    console.log(`Expired memberships found: ${expiredMemberships.length}`);

    process.exit(0);
    
  } catch (error) {
    console.error('Error in expiration check:', error);
    process.exit(1);
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkMembershipExpirations();
}

module.exports = { checkMembershipExpirations };
