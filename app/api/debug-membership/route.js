import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import Membership from '../../../models/Membership';
import { addMemberToSheet } from '../../../lib/googleSheets';

export async function GET(req) {
  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasWebhookSecret: !!process.env.STRIPE_MEMBERSHIP_WEBHOOK_SECRET,
        hasGoogleEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        hasGoogleKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
        hasSpreadsheet: !!process.env.MEMBERSHIP_SPREADSHEET,
        hasMongoUri: !!process.env.MONGODB_URI
      },
      database: null,
      googleSheets: null,
      recentMemberships: null
    };

    // Test database connection
    try {
      await connectDB();
      const membershipCount = await Membership.countDocuments();
      debug.database = {
        connected: true,
        membershipCount
      };
    } catch (dbError) {
      debug.database = {
        connected: false,
        error: dbError.message
      };
    }

    // Test Google Sheets connection
    try {
      const testMembership = {
        email: `debug-test-${Date.now()}@example.com`,
        firstName: 'Debug',
        lastName: 'Test',
        phone: '+971501234567',
        membershipType: 'monthly',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: 'debug_test_customer'
      };

      const sheetResult = await addMemberToSheet(testMembership);
      debug.googleSheets = {
        connected: true,
        testRowId: sheetResult
      };
    } catch (sheetsError) {
      debug.googleSheets = {
        connected: false,
        error: sheetsError.message
      };
    }

    // Get recent memberships
    try {
      if (debug.database.connected) {
        const recent = await Membership.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('email firstName lastName membershipType status createdAt googleSheetsRowId');
        
        debug.recentMemberships = recent;
      }
    } catch (error) {
      debug.recentMemberships = {
        error: error.message
      };
    }

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
