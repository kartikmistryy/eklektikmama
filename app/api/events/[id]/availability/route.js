import { NextResponse } from "next/server";
import { google } from "googleapis";

// Event segment capacity limits
// Update these values as needed for each segment
const SEGMENT_CAPACITY = {
  cinemaMorning: 10,
  mamaBreakfast: 9, // Currently has 5 records, so 4 more can be added (5 + 4 = 9)
  mamaFit: 10,
  eklektikEdit: 10,
  helloChef: 10
};

// Display capacity for UI (different from actual booking limit)
const DISPLAY_CAPACITY = {
  cinemaMorning: 10,
  mamaBreakfast: 15, // Display as 15 in UI, but actual limit is 9
  mamaFit: 10,
  eklektikEdit: 10,
  helloChef: 10
};

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    // First, get the event to determine its segment
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const eventRes = await fetch(`${base}/api/events/${id}`, {
      cache: 'no-store'
    });
    
    if (!eventRes.ok) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const event = await eventRes.json();
    const eventSegment = event.segment;
    
    if (!eventSegment) {
      return NextResponse.json({ 
        available: true, 
        remaining: SEGMENT_CAPACITY.cinemaMorning,
        total: DISPLAY_CAPACITY.cinemaMorning,
        actualTotal: SEGMENT_CAPACITY.cinemaMorning,
        message: 'Event segment not specified'
      });
    }
    
    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      return NextResponse.json({ 
        available: true, 
        remaining: SEGMENT_CAPACITY[eventSegment] || 10,
        total: DISPLAY_CAPACITY[eventSegment] || 10,
        actualTotal: SEGMENT_CAPACITY[eventSegment] || 10,
        message: 'Google Sheets not configured, assuming available'
      });
    }
    
    // Get the correct spreadsheet ID based on event segment
    let spreadsheetId;
    switch (eventSegment) {
      case 'cinemaMorning':
        spreadsheetId = process.env.CINEMA_MORNING_SPREADSHEET_ID;
        break;
      case 'mamaBreakfast':
        spreadsheetId = process.env.MAMA_BREAKFAST_SPREADSHEET_ID;
        break;
      case 'mamaFit':
        spreadsheetId = process.env.MAMAFIT_SPREADSHEET_ID;
        break;
      case 'eklektikEdit':
        spreadsheetId = process.env.EKLEKTIK_EDIT_SPREADSHEET_ID;
        break;
      default:
        spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    }
    
    if (!spreadsheetId) {
      return NextResponse.json({ 
        available: true, 
        remaining: SEGMENT_CAPACITY[eventSegment] || 10,
        total: DISPLAY_CAPACITY[eventSegment] || 10,
        actualTotal: SEGMENT_CAPACITY[eventSegment] || 10,
        message: 'Spreadsheet not configured for this segment'
      });
    }
    
    // Authenticate with Google Sheets
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:Z',
    });
    
    const values = response.data.values || [];
    
    // Count existing bookings (excluding header row)
    // Each row represents one booking, regardless of number of tickets
    const existingBookings = Math.max(0, values.length - 1); // Subtract 1 for header row
    
    const totalCapacity = SEGMENT_CAPACITY[eventSegment] || 10;
    const displayCapacity = DISPLAY_CAPACITY[eventSegment] || 10;
    const remaining = Math.max(0, totalCapacity - existingBookings);
    const available = remaining > 0;
    
    return NextResponse.json({
      available,
      remaining,
      total: displayCapacity, // Use display capacity for UI
      actualTotal: totalCapacity, // Keep actual capacity for reference
      existing: existingBookings,
      segment: eventSegment,
      message: available 
        ? `${remaining} tickets remaining` 
        : 'Event is fully booked'
    });
    
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ 
      available: true, 
      remaining: 10,
      total: 10,
      actualTotal: 10,
      message: 'Error checking availability, assuming available',
      error: error.message
    }, { status: 500 });
  }
}
