import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Helper function to create checkout using Storefront API (fallback method)
async function createCheckoutWithStorefrontAPI(cartItems, email) {
  try {
    if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || !process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      console.error("Storefront API credentials not configured");
      return null;
    }

    const client = createStorefrontApiClient({
      storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
      apiVersion: '2025-01',
      publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    });

    // Create cart with items
    const cartCreateMutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const cartResult = await client.request(cartCreateMutation, {
      variables: {
        input: {
          lines: cartItems.map(item => ({
            merchandiseId: item.variantId,
            quantity: item.quantity || 1,
          })),
          buyerIdentity: {
            email: email,
          },
          discountCodes: ["MEMBER10"], // Apply discount code
        },
      },
    });

    if (cartResult.data?.cartCreate?.cart?.checkoutUrl) {
      return cartResult.data.cartCreate.cart.checkoutUrl;
    }

    // If discount code application fails, try without it first, then apply
    const cartWithoutDiscount = await client.request(cartCreateMutation, {
      variables: {
        input: {
          lines: cartItems.map(item => ({
            merchandiseId: item.variantId,
            quantity: item.quantity || 1,
          })),
          buyerIdentity: {
            email: email,
          },
        },
      },
    });

    const cartId = cartWithoutDiscount.data?.cartCreate?.cart?.id;
    if (cartId) {
      // Apply discount code to cart
      const discountMutation = `
        mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
          cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
            cart {
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const discountResult = await client.request(discountMutation, {
        variables: {
          cartId: cartId,
          discountCodes: ["MEMBER10"],
        },
      });

      return discountResult.data?.cartDiscountCodesUpdate?.cart?.checkoutUrl || null;
    }

    return null;
  } catch (error) {
    console.error("Error creating checkout with Storefront API:", error);
    return null;
  }
}

/**
 * POST /api/membership/verify-sheets
 * Verifies membership status by checking Google Sheets directly
 * If active member and cartItems provided, creates Shopify checkout with discount applied server-side
 * Suitable for Shopify integration
 * 
 * Request body: { 
 *   email: string,
 *   cartItems?: Array<{ variantId: string, quantity: number }> // Optional: if provided, creates checkout
 * }
 * Response: { 
 *   isActiveMember: boolean, 
 *   planType?: string, 
 *   currentPeriodEnd?: string, 
 *   reason?: string,
 *   checkoutUrl?: string // If cartItems provided and member is active
 * }
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
    const { email, cartItems } = await req.json();

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

        // If cartItems provided, create Shopify checkout with discount applied
        let checkoutUrl = null;
        if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
          try {
            // Try Storefront API first (most common setup)
            if (process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN && process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
              checkoutUrl = await createCheckoutWithStorefrontAPI(cartItems, email);
              if (checkoutUrl) {
                console.log("✅ Checkout created with discount applied (Storefront API):", checkoutUrl);
              }
            }
            
            // Fallback to Admin API if Storefront API didn't work and Admin API credentials are available
            if (!checkoutUrl && process.env.SHOPIFY_STORE && process.env.SHOPIFY_ADMIN_TOKEN) {
              const checkoutResponse = await fetch(
                `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/checkouts.json`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
                  },
                  body: JSON.stringify({
                    checkout: {
                      email: email,
                      line_items: cartItems.map(item => ({
                        variant_id: item.variantId,
                        quantity: item.quantity || 1,
                      })),
                      discount_code: "MEMBER10", // Apply member discount server-side
                    },
                  }),
                }
              );

              if (checkoutResponse.ok) {
                const checkoutData = await checkoutResponse.json();
                checkoutUrl = checkoutData.checkout?.web_url || checkoutData.checkout?.abandoned_checkout_url;
                console.log("✅ Checkout created with discount applied (Admin API):", checkoutUrl);
              } else {
                const errorData = await checkoutResponse.json();
                console.error("❌ Failed to create checkout with Admin API:", errorData);
              }
            }
            
            if (!checkoutUrl) {
              console.warn("⚠️ Could not create checkout - Shopify credentials may be missing");
            }
          } catch (checkoutError) {
            console.error("❌ Error creating checkout:", checkoutError);
            // Continue without checkout URL - membership verification still succeeds
          }
        }

        return NextResponse.json({
          isActiveMember: true,
          planType: planType,
          currentPeriodEnd: periodEndStr,
          checkoutUrl: checkoutUrl, // Only included if cartItems provided and checkout created
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

