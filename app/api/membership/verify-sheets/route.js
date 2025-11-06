import { NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * POST /api/membership/verify-sheets
 * Verifies membership status by checking Google Sheets directly
 * Suitable for Shopify integration
 * 
 * Request body: { email: string }
 * Response: { isActiveMember: boolean, planType?: string, currentPeriodEnd?: string, reason?: string }
 */

// CORS headers for Shopify integration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Update with your Shopify domain if needed
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate environment variables
    if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
      console.error("Google Sheets credentials not configured");
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500, headers: corsHeaders }
      );
    }

    const spreadsheetId = process.env.MEMBERSHIP_SPREADSHEET;
    if (!spreadsheetId) {
      console.error("MEMBERSHIP_SPREADSHEET not configured");
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Read data from Members sheet
    const range = "Members!A:R"; // Adjust range if your data columns go beyond R
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range,
    });

    const rows = result.data.values;

    if (!rows || rows.length < 2) {
      return NextResponse.json({
        isActiveMember: false,
        reason: "No data found in sheet",
      }, { headers: corsHeaders });
    }

    // Find column indices
    const headers = rows[0];
    const emailIndex = headers.indexOf("Email");
    const statusIndex = headers.indexOf("Status");
    const endIndex = headers.indexOf("Current Period End");
    const planTypeIndex = headers.indexOf("Plan Type");

    if (emailIndex === -1 || statusIndex === -1 || endIndex === -1) {
      console.error("Missing required columns in sheet:", {
        emailIndex,
        statusIndex,
        endIndex,
        headers,
      });
      return NextResponse.json({
        isActiveMember: false,
        reason: "Sheet structure error",
      }, { headers: corsHeaders });
    }

    // Search for the member
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();

    // Skip header row (index 0) and search through data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const memberEmail = row[emailIndex]?.trim().toLowerCase();
      const memberStatus = row[statusIndex]?.trim().toLowerCase();
      const periodEndStr = row[endIndex];

      // Check if email matches
      if (memberEmail === normalizedEmail) {
        // Check if status is active
        if (memberStatus !== "active") {
          return NextResponse.json({
            isActiveMember: false,
            reason: `Membership status is ${memberStatus}`,
            status: memberStatus,
          }, { headers: corsHeaders });
        }

        // Check if membership period is still valid
        if (periodEndStr) {
          const periodEnd = new Date(periodEndStr);
          
          if (isNaN(periodEnd.getTime())) {
            // Invalid date format
            console.warn(`Invalid date format for period end: ${periodEndStr}`);
            return NextResponse.json({
              isActiveMember: false,
              reason: "Invalid membership period data",
            }, { headers: corsHeaders });
          }

          if (now > periodEnd) {
            return NextResponse.json({
              isActiveMember: false,
              reason: "Membership period has expired",
              currentPeriodEnd: periodEndStr,
            }, { headers: corsHeaders });
          }
        }

        // Member is active
        const planType = planTypeIndex !== -1 ? row[planTypeIndex] : undefined;

        return NextResponse.json({
          isActiveMember: true,
          planType: planType,
          currentPeriodEnd: periodEndStr,
        }, { headers: corsHeaders });
      }
    }

    // Email not found in sheet
    return NextResponse.json({
      isActiveMember: false,
      reason: "Email not found in membership records",
    }, { headers: corsHeaders });
  } catch (err) {
    console.error("Error verifying membership:", err);
    return NextResponse.json(
      { error: "Failed to verify membership", message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

