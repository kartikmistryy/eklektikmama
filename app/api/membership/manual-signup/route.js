import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import Membership from '../../../../models/Membership';
import { addMemberToSheet } from '../../../../lib/googleSheets';
import { sendMemberWelcomeEmail } from '../../../../lib/memberEmails';

export async function POST(req) {
  try {
    await connectDB();
    
    const {
      email,
      firstName,
      lastName,
      phone,
      membershipType,
      paymentMethod, // 'cash', 'bank_transfer', 'other'
      paymentReference, // Reference number or note
      startDate,
      endDate
    } = await req.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !membershipType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has an active membership
    const existingMembership = await Membership.findOne({
      email: email.toLowerCase(),
      status: { $in: ['active', 'past_due'] }
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You already have an active membership' },
        { status: 400 }
      );
    }

    // Calculate membership dates
    const now = new Date();
    const membershipStart = startDate ? new Date(startDate) : now;
    const membershipEnd = endDate ? new Date(endDate) : (() => {
      const end = new Date(membershipStart);
      if (membershipType === 'monthly') {
        end.setMonth(end.getMonth() + 1);
      } else {
        end.setFullYear(end.getFullYear() + 1);
      }
      return end;
    })();

    // Create membership record in database
    const membership = new Membership({
      email: email.toLowerCase(),
      firstName,
      lastName,
      phone,
      membershipType,
      status: 'active',
      currentPeriodStart: membershipStart,
      currentPeriodEnd: membershipEnd,
      nextPaymentDate: membershipEnd,
      // Manual payment fields
      stripeCustomerId: `manual_${Date.now()}`,
      stripeSubscriptionId: `manual_sub_${Date.now()}`,
      stripePriceId: `manual_price_${membershipType}`,
      notes: `Manual signup - Payment: ${paymentMethod}, Reference: ${paymentReference || 'N/A'}`
    });

    await membership.save();

    // Add to Google Sheets
    try {
      const googleSheetsRowId = await addMemberToSheet({
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone,
        membershipType,
        status: 'active',
        signupDate: now,
        currentPeriodStart: membershipStart,
        currentPeriodEnd: membershipEnd,
        nextPaymentDate: membershipEnd,
        stripeCustomerId: membership.stripeCustomerId,
        stripeSubscriptionId: membership.stripeSubscriptionId,
        totalSavings: 0
      });

      membership.googleSheetsRowId = googleSheetsRowId;
      await membership.save();
    } catch (sheetError) {
      console.error('Error adding to Google Sheets:', sheetError);
      // Don't fail the entire process if Google Sheets fails
    }

    // Send welcome email using your existing email system
    try {
      await sendMemberWelcomeEmail({
        email: email.toLowerCase(),
        firstName,
        lastName,
        membershipType
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the process if email fails
    }

    return NextResponse.json({
      success: true,
      membership: {
        id: membership._id,
        email: membership.email,
        firstName: membership.firstName,
        lastName: membership.lastName,
        membershipType: membership.membershipType,
        status: membership.status,
        currentPeriodEnd: membership.currentPeriodEnd,
        googleSheetsRowId: membership.googleSheetsRowId
      },
      message: 'Membership created successfully! Welcome email sent.'
    });

  } catch (error) {
    console.error('Manual membership signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create membership' },
      { status: 500 }
    );
  }
}
