import { NextResponse } from "next/server";
import { getGoogleSheet } from "@/lib/googleSheets";
import { spreadsheetIds } from "@/lib/eventForms";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

export async function POST() {
  try {
    console.log('=== SETTING UP FAMILY DAY SHEET ===');
    
    await connectDB();
    
    // Get the family day event
    const event = await Event.findOne({ segment: 'familyDay' });
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'No family day event found'
      });
    }
    
    console.log('Found family day event:', event.title);
    
    // Get the family day spreadsheet
    const familyDaySpreadsheetId = spreadsheetIds.familyDay;
    const doc = await getGoogleSheet(familyDaySpreadsheetId);
    
    // Create the sheet name
    const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    const titleSlug = event.title
      .substring(0, 20)
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    
    const sheetName = `${eventDate}_${titleSlug}_${event._id.toString().slice(-6)}`;
    console.log('Setting up sheet:', sheetName);
    
    // Check if sheet exists
    let sheet = doc.sheetsByTitle[sheetName];
    
    if (sheet) {
      console.log('Sheet exists, clearing it...');
      // Clear the sheet
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });
      
      // Clear the sheet
      await sheets.spreadsheets.values.clear({
        spreadsheetId: familyDaySpreadsheetId,
        range: `${sheetName}!A:Z`
      });
    } else {
      console.log('Creating new sheet...');
      // Create new sheet
      sheet = await doc.addSheet({
        title: sheetName
      });
      
      // Wait for sheet to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Define headers for family day events
    const headers = [
      'Booking Date/Time',
      'Event Title', 
      'Event Date',
      'Guardian Name',
      'Child Name',
      'Email',
      'Phone',
      'Number of Tickets',
      'Transaction ID',
      'Payment Status',
      'Timestamp',
      'Parent 1 Name',
      'Parent 2 Name', 
      'Parent 1 Phone',
      'Parent 2 Phone',
      'Child 1 Name',
      'Child 1 Age',
      'Child 2 Name',
      'Child 2 Age',
      'Child 3 Name',
      'Child 3 Age',
      'Child 4 Name',
      'Child 4 Age',
      'Number of Children',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Medical Information',
      'How Did You Hear',
      'Waiver Consent',
      'Photography Consent'
    ];
    
    console.log('Adding headers...');
    
    // Add headers using direct API
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: familyDaySpreadsheetId,
      range: `${sheetName}!A1:AD1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers]
      }
    });
    
    console.log('✅ Headers added successfully');
    
    // Add a test booking
    const testBookingData = [
      new Date().toISOString(), // Booking Date/Time
      event.title, // Event Title
      new Date(event.date).toISOString().split('T')[0], // Event Date
      'Test Parent', // Guardian Name
      'Test Child 1, Test Child 2', // Child Name (combined)
      'test@example.com', // Email
      '1234567890', // Phone
      '1', // Number of Tickets
      'test-txn-' + Date.now(), // Transaction ID
      'paid', // Payment Status
      new Date().toISOString(), // Timestamp
      'Test Parent 1', // Parent 1 Name
      'Test Parent 2', // Parent 2 Name
      '1234567890', // Parent 1 Phone
      '0987654321', // Parent 2 Phone
      'Test Child 1', // Child 1 Name
      '5', // Child 1 Age
      'Test Child 2', // Child 2 Name
      '3', // Child 2 Age
      '', // Child 3 Name
      '', // Child 3 Age
      '', // Child 4 Name
      '', // Child 4 Age
      '2 children - 270 AED', // Number of Children
      'Test Emergency', // Emergency Contact Name
      '0987654321', // Emergency Contact Phone
      'No medical issues', // Medical Information
      'Social Media', // How Did You Hear
      'Yes', // Waiver Consent
      'Yes' // Photography Consent
    ];
    
    console.log('Adding test booking...');
    
    // Add test booking
    await sheets.spreadsheets.values.update({
      spreadsheetId: familyDaySpreadsheetId,
      range: `${sheetName}!A2:AD2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [testBookingData]
      }
    });
    
    console.log('✅ Test booking added successfully');
    
    // Verify the setup
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: familyDaySpreadsheetId,
      range: `${sheetName}!A1:AD2`
    });
    
    console.log('Sheet verification:', result.data.values);
    
    return NextResponse.json({
      success: true,
      message: 'Family day sheet setup completed successfully',
      sheetName,
      headers: headers.length,
      testBookingAdded: true,
      verification: {
        totalRows: result.data.values?.length || 0,
        headersRow: result.data.values?.[0] || [],
        dataRow: result.data.values?.[1] || []
      }
    });
    
  } catch (error) {
    console.error('❌ Family day sheet setup failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
