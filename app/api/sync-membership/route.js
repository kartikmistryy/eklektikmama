import { NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * POST /api/sync-membership
 * Checks if an email has an active membership from Google Sheets
 * and updates Shopify customer tags accordingly
 * 
 * Request body: { email: string, shopifyCustomerId: string }
 * Response: { email: string, isActive: boolean, updatedTags: string[] }
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
    const { email, shopifyCustomerId } = await req.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!shopifyCustomerId) {
      return NextResponse.json(
        { error: "Shopify Customer ID is required" },
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

    // Validate Shopify environment variables
    if (!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ADMIN_TOKEN) {
      console.error("Shopify credentials not configured");
      return NextResponse.json(
        { error: "Shopify configuration error" },
        { status: 500, headers: corsHeaders }
      );
    }

    // --- Check membership (from Google Sheet) ---
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Read data from Members sheet (same structure as verify-sheets)
    const range = "Members!A:R"; // Adjust range if your data columns go beyond R
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range,
    });

    const rows = result.data.values;

    if (!rows || rows.length < 2) {
      // No data found - remove active-member tag
      const mutation = `
        mutation customerUpdate($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer { id tags }
            userErrors { field message }
          }
        }
      `;

      const input = {
        id: shopifyCustomerId,
        tags: [],
      };

      const resp = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2025-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({ query: mutation, variables: { input } }),
      });

      const data = await resp.json();

      if (data.errors || (data.data?.customerUpdate?.userErrors?.length > 0)) {
        console.error("Shopify update error:", data.errors || data.data?.customerUpdate?.userErrors);
        return NextResponse.json(
          { 
            email,
            isActive: false,
            error: "Failed to update Shopify tags",
            shopifyErrors: data.errors || data.data?.customerUpdate?.userErrors
          },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json({
        email,
        isActive: false,
        updatedTags: data.data?.customerUpdate?.customer?.tags || [],
      }, { headers: corsHeaders });
    }

    // Find column indices (same as verify-sheets)
    const headers = rows[0];
    const emailIndex = headers.indexOf("Email");
    const statusIndex = headers.indexOf("Status");
    const endIndex = headers.indexOf("Current Period End");

    if (emailIndex === -1 || statusIndex === -1 || endIndex === -1) {
      console.error("Missing required columns in sheet:", {
        emailIndex,
        statusIndex,
        endIndex,
        headers,
      });
      return NextResponse.json(
        { 
          email,
          isActive: false,
          error: "Sheet structure error",
          reason: "Missing required columns"
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Search for the member (same logic as verify-sheets)
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();
    let member = null;
    let memberStatus = null;
    let periodEndStr = null;

    // Skip header row (index 0) and search through data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const memberEmail = row[emailIndex]?.trim().toLowerCase();

      // Check if email matches
      if (memberEmail === normalizedEmail) {
        member = row;
        memberStatus = row[statusIndex]?.trim().toLowerCase();
        periodEndStr = row[endIndex];
        break;
      }
    }

    if (!member) {
      // Member not found - remove active-member tag
      const mutation = `
        mutation customerUpdate($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer { id tags }
            userErrors { field message }
          }
        }
      `;

      const input = {
        id: shopifyCustomerId,
        tags: [],
      };

      const resp = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2025-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({ query: mutation, variables: { input } }),
      });

      const data = await resp.json();

      if (data.errors || (data.data?.customerUpdate?.userErrors?.length > 0)) {
        console.error("Shopify update error:", data.errors || data.data?.customerUpdate?.userErrors);
        return NextResponse.json(
          { 
            email,
            isActive: false,
            error: "Failed to update Shopify tags",
            shopifyErrors: data.errors || data.data?.customerUpdate?.userErrors
          },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json({
        email,
        isActive: false,
        updatedTags: data.data?.customerUpdate?.customer?.tags || [],
      }, { headers: corsHeaders });
    }

    // Check if membership is active (same logic as verify-sheets)
    let isActive = false;

    // Check if status is active
    if (memberStatus === "active") {
      // Check if membership period is still valid
      if (periodEndStr) {
        const periodEnd = new Date(periodEndStr);
        
        if (!isNaN(periodEnd.getTime()) && now <= periodEnd) {
          isActive = true;
        }
      } else {
        // No end date specified, consider active if status is active
        isActive = true;
      }
    }

    // --- Update tag in Shopify ---
    const mutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer { id tags }
          userErrors { field message }
        }
      }
    `;

    const input = {
      id: shopifyCustomerId,
      tags: isActive ? ["active-member"] : [],
    };

    const resp = await fetch(`https://${process.env.SHOPIFY_STORE}/admin/api/2025-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ query: mutation, variables: { input } }),
    });

    const data = await resp.json();

    if (data.errors || (data.data?.customerUpdate?.userErrors?.length > 0)) {
      console.error("Shopify update error:", data.errors || data.data?.customerUpdate?.userErrors);
      return NextResponse.json(
        { 
          email,
          isActive,
          error: "Failed to update Shopify tags",
          shopifyErrors: data.errors || data.data?.customerUpdate?.userErrors
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      email,
      isActive,
      updatedTags: data.data?.customerUpdate?.customer?.tags || [],
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Error syncing membership:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

