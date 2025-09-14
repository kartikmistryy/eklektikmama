import { NextResponse } from 'next/server';
import { sendMemberWelcomeEmail } from '../../../lib/memberEmails';

export async function POST(req) {
  try {
    const { membershipType, firstName, email } = await req.json();
    
    if (!membershipType || !firstName || !email) {
      return NextResponse.json({ 
        error: 'Missing required fields: membershipType, firstName, email' 
      }, { status: 400 });
    }

    // Test data
    const memberData = {
      firstName,
      lastName: 'Test',
      email,
      membershipType
    };

    // Send the welcome email
    const result = await sendMemberWelcomeEmail(memberData);
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error.message 
    }, { status: 500 });
  }
}
