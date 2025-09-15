import { NextResponse } from 'next/server';
import { addContactFormToSheet } from '../../../lib/googleSheets';

export async function POST(request) {
  try {
    const formData = await request.json();
    const { name, email, website, partnershipType, otherDetails, isBrand, interestedInFranchise } = formData;

    // Validate required fields
    if (!name || !email || !website || !partnershipType || !isBrand || !interestedInFranchise) {
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

    // Validate website
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Valid website URL is required (must start with http:// or https://)' },
        { status: 400 }
      );
    }

    // Validate otherDetails if partnershipType is "Other"
    if (partnershipType === "Other (Please specify)" && !otherDetails?.trim()) {
      return NextResponse.json(
        { error: 'Please specify your partnership type' },
        { status: 400 }
      );
    }

    // Add form submission to Google Sheets
    try {
      await addContactFormToSheet(formData, 'partnershipProgram');
      console.log('Perks form submission added to Google Sheets:', email);
    } catch (sheetError) {
      console.error('Error adding to Google Sheets:', sheetError);
      // Don't fail the entire process if Google Sheets fails
    }

    return NextResponse.json({
      success: true,
      message: 'Perks form submitted successfully! We\'ll be in touch soon.'
    });

  } catch (error) {
    console.error('Perks form submission error:', error);
    return NextResponse.json(
      { error: `Failed to submit perks form: ${error.message}` },
      { status: 500 }
    );
  }
}