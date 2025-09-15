import { NextResponse } from 'next/server';
import { addContactFormToSheet } from '../../../lib/googleSheets';

export async function POST(request) {
  try {
    const formData = await request.json();
    const { name, email, isBrand, interestedInFranchise, note } = formData;

    // Validate required fields
    if (!name || !email || !isBrand || !interestedInFranchise || !note) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Add form submission to Google Sheets
    try {
      await addContactFormToSheet(formData, 'contactUs');
      console.log('Partner form submission added to Google Sheets:', email);
    } catch (sheetError) {
      console.error('Error adding to Google Sheets:', sheetError);
      // Don't fail the entire process if Google Sheets fails
    }

    return NextResponse.json({
      success: true,
      message: 'Partner form submitted successfully! We\'ll be in touch soon.'
    });

  } catch (error) {
    console.error('Partner form submission error:', error);
    return NextResponse.json(
      { error: `Failed to submit partner form: ${error.message}` },
      { status: 500 }
    );
  }
}