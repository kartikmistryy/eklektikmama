import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Membership from '@/models/Membership';

export async function POST(req) {
  try {
    console.log('🔄 Starting membership verification...');
    
    // Connect to database with timeout
    await connectDB();
    console.log('✅ Database connected for membership verification');
    
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Log the raw email before any processing
    console.log('📧 Raw email received:', email);
    console.log('📧 Email type:', typeof email);
    console.log('📧 Email length:', email?.length);
    console.log('📧 Email after toLowerCase():', email?.toLowerCase());
    console.log('📧 Email after trim():', email?.toLowerCase()?.trim());
    
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Looking up membership for normalized email:', normalizedEmail);
    console.log('🔍 Normalized email length:', normalizedEmail.length);

    // Find the active membership by email with timeout
    // Try exact match first
    let membership = await Membership.findOne({ 
      email: normalizedEmail,
      status: { $in: ['active', 'past_due'] }
    }).sort({ createdAt: -1 }).maxTimeMS(5000);
    
    // If not found, try a case-insensitive regex search in case of any email variations
    if (!membership) {
      console.log('⚠️ Exact match not found, trying regex search...');
      const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      membership = await Membership.findOne({ 
        email: emailRegex,
        status: { $in: ['active', 'past_due'] }
      }).sort({ createdAt: -1 }).maxTimeMS(5000);
    }
    
    // If still not found and email looks truncated (ends with .co.), try searching for .co.uk variants
    if (!membership && normalizedEmail.endsWith('.co.')) {
      console.log('⚠️ Email appears truncated (ends with .co.), trying .co.uk variant...');
      const emailWithUK = normalizedEmail.replace(/\.co\.$/, '.co.uk');
      console.log('🔍 Trying email variant:', emailWithUK);
      membership = await Membership.findOne({ 
        email: emailWithUK,
        status: { $in: ['active', 'past_due'] }
      }).sort({ createdAt: -1 }).maxTimeMS(5000);
    }

    console.log('🔍 Membership verify lookup result:', {
      searchedEmail: normalizedEmail,
      foundEmail: membership?.email,
      found: !!membership,
      membershipType: membership?.membershipType,
      status: membership?.status,
      createdAt: membership?.createdAt,
      emailMatch: membership ? (membership.email === normalizedEmail ? 'exact' : 'variant') : 'none'
    });

    if (!membership) {
      return NextResponse.json({
        isMember: false,
        message: 'No membership found for this email address'
      });
    }

    // Check if membership is active
    const now = new Date();
    const isActive = membership.status === 'active' && 
                   (!membership.currentPeriodEnd || new Date(membership.currentPeriodEnd) > now);

    // Check if membership expires soon (within 7 days)
    const expiresSoon = membership.currentPeriodEnd && 
                       new Date(membership.currentPeriodEnd) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    console.log('✅ Membership verification successful:', {
      isActive,
      membershipType: membership.membershipType,
      expiresSoon
    });

    return NextResponse.json({
      isMember: isActive,
      membership: {
        email: membership.email,
        firstName: membership.firstName,
        lastName: membership.lastName,
        membershipType: membership.membershipType,
        status: membership.status,
        currentPeriodStart: membership.currentPeriodStart,
        currentPeriodEnd: membership.currentPeriodEnd,
        cancelAtPeriodEnd: membership.cancelAtPeriodEnd || false,
        expiresSoon: expiresSoon,
        totalSavings: membership.totalSavings || 0,
        createdAt: membership.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Membership verification error:', error);
    
    // Provide more specific error messages
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again.' },
        { status: 503 }
      );
    }
    
    if (error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your internet connection.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify membership. Please try again.' },
      { status: 500 }
    );
  }
}