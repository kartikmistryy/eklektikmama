import { NextResponse } from "next/server";
import { spreadsheetIds } from '../../../lib/eventForms';

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? 'Set' : 'Not Set',
      GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY ? 'Set' : 'Not Set',
      CINEMA_MORNING_SPREADSHEET_ID: process.env.CINEMA_MORNING_SPREADSHEET_ID ? 'Set' : 'Not Set',
      MAMA_BREAKFAST_SPREADSHEET_ID: process.env.MAMA_BREAKFAST_SPREADSHEET_ID ? 'Set' : 'Not Set',
      MAMAFIT_SPREADSHEET_ID: process.env.MAMAFIT_SPREADSHEET_ID ? 'Set' : 'Not Set',
      EKLEKTIK_EDIT_SPREADSHEET_ID: process.env.EKLEKTIK_EDIT_SPREADSHEET_ID ? 'Set' : 'Not Set',
      FAMILY_DAY_SPREADSHEET_ID: process.env.FAMILY_DAY_SPREADSHEET_ID ? 'Set' : 'Not Set',
    };

    // Check spreadsheet IDs from the imported object
    const spreadsheetIdsStatus = {
      cinemaMorning: spreadsheetIds.cinemaMorning ? 'Set' : 'Not Set',
      mamaBreakfast: spreadsheetIds.mamaBreakfast ? 'Set' : 'Not Set',
      mamaFit: spreadsheetIds.mamaFit ? 'Set' : 'Not Set',
      eklektikEdit: spreadsheetIds.eklektikEdit ? 'Set' : 'Not Set',
      familyDay: spreadsheetIds.familyDay ? 'Set' : 'Not Set',
    };

    return NextResponse.json({
      success: true,
      environment: envVars,
      spreadsheetIds: spreadsheetIdsStatus,
      message: 'Environment variables and spreadsheet IDs status'
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
