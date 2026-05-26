import { NextResponse } from 'next/server';
import { addContactFormToSheet } from '../../../lib/googleSheets';

export async function POST(request) {
  try {
    const formData = await request.json();
    const { name, email, website, brandDescription, partnershipType, ideaDetails } = formData;

    if (!name || !email || !partnershipType) {
      return NextResponse.json(
        { error: 'Name, email, and partnership type are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    try {
      await addContactFormToSheet(formData, 'partnershipProgram');
      console.log('Partnership form submission added to Google Sheets:', email);
    } catch (sheetError) {
      console.error('Error adding to Google Sheets:', sheetError);
    }

    return NextResponse.json({
      success: true,
      message: 'Partnership form submitted successfully! We\'ll be in touch soon.'
    });

  } catch (error) {
    console.error('Partnership form submission error:', error);
    return NextResponse.json(
      { error: `Failed to submit form: ${error.message}` },
      { status: 500 }
    );
  }
}
