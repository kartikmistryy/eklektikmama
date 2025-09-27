import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { sendMembershipExpirationReminderEmail } from '../../../../lib/memberEmails';
import { updateMemberInSheet } from '../../../../lib/googleSheets';

export async function POST(req) {
  try {
    await connectDB();
    
    console.log('Starting membership expiration check...');
    
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
        console.log(`Expiration reminder sent to ${membership.email}`);
        
      } catch (error) {
        console.error(`Error sending reminder to ${membership.email}:`, error);
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
            console.log(`Updated Google Sheets for expired membership: ${membership.email}`);
          } catch (error) {
            console.error(`Error updating Google Sheets for ${membership.email}:`, error);
          }
        }
        
      } catch (error) {
        console.error(`Error expiring membership for ${membership.email}:`, error);
      }
    }

    console.log(`Expiration check completed. Reminders sent: ${remindersSent}, Memberships expired: ${membershipsExpired}`);

    return NextResponse.json({
      success: true,
      message: 'Expiration check completed',
      results: {
        remindersSent,
        membershipsExpired,
        expiringIn7Days: membershipsExpiringIn7Days.length,
        expiredFound: expiredMemberships.length
      }
    });

  } catch (error) {
    console.error('Error in expiration check:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for manual testing
export async function GET(req) {
  try {
    await connectDB();
    
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Find memberships that expire in 7 days (for preview)
    const membershipsExpiringIn7Days = await Membership.find({
      status: 'active',
      currentPeriodEnd: {
        $gte: new Date(sevenDaysFromNow.getTime() - 24 * 60 * 60 * 1000),
        $lte: sevenDaysFromNow
      }
    }).select('email firstName lastName membershipType currentPeriodEnd');

    // Find expired memberships
    const expiredMemberships = await Membership.find({
      status: 'active',
      currentPeriodEnd: { $lte: now }
    }).select('email firstName lastName membershipType currentPeriodEnd');

    return NextResponse.json({
      success: true,
      preview: {
        membershipsExpiringIn7Days: membershipsExpiringIn7Days.map(m => ({
          email: m.email,
          name: `${m.firstName} ${m.lastName}`,
          membershipType: m.membershipType,
          currentPeriodEnd: m.currentPeriodEnd,
          daysUntilExpiry: Math.ceil((new Date(m.currentPeriodEnd) - now) / (1000 * 60 * 60 * 24))
        })),
        expiredMemberships: expiredMemberships.map(m => ({
          email: m.email,
          name: `${m.firstName} ${m.lastName}`,
          membershipType: m.membershipType,
          currentPeriodEnd: m.currentPeriodEnd,
          daysOverdue: Math.ceil((now - new Date(m.currentPeriodEnd)) / (1000 * 60 * 60 * 24))
        }))
      }
    });

  } catch (error) {
    console.error('Error in expiration preview:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
