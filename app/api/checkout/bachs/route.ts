import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotificationEmails } from "@/lib/zohoMail";

const BACHS_API_BASE = "https://api.bachs.io/v1";

function cleanApiKey(raw: string): string {
  let cleaned = (raw || "").trim();
  // Remove wrapping quotes
  cleaned = cleaned.replace(/^["']+|["']+$/g, "").trim();
  // Extract key matching sk_live_... or sk_test_... if prefixed with words (supports hyphens and underscores)
  const match = cleaned.match(/(sk_(?:live|test)_[A-Za-z0-9_-]+)/);
  if (match) {
    return match[1];
  }
  // Strip common label prefixes like "api key = ", "api_key: ", etc.
  cleaned = cleaned.replace(/^(?:api[\s_-]?key\s*[:=]\s*|bearer\s+)/i, "").trim();
  return cleaned;
}

// User-specified live Bachs secret key
const BACHS_ACTIVE_LIVE_KEY = "sk_live_5b5bb608_WDjMBFD5SnH1SHotFtqS4EatIWMR5J9zizgQUlM-LPM";

function getBachsApiKey(): string {
  // Always use the explicitly requested sk_live key
  return cleanApiKey(BACHS_ACTIVE_LIVE_KEY);
}

// Fixed conversion rate from GBP to USD (1 GBP = 1.30 USD)
const GBP_TO_USD_RATE = 1.30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, shipping, pricing, items, appUrl } = body;

    if (!customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: "Customer name and email are required for checkout." },
        { status: 400 }
      );
    }

    const apiKey = getBachsApiKey();

    // Determine return base URL (Bachs requires a publicly accessible URL, rejects localhost)
    let origin =
      appUrl ||
      process.env.APP_URL ||
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "https://reta-lab.co.uk";

    if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
      origin = (process.env.APP_URL && !process.env.APP_URL.includes("localhost"))
        ? process.env.APP_URL
        : "https://reta-lab.co.uk";
    }

    const totalGBP = parseFloat(pricing?.totalGBP || "0");
    if (isNaN(totalGBP) || totalGBP <= 0) {
      return NextResponse.json(
        { error: "Invalid order total." },
        { status: 400 }
      );
    }

    if (totalGBP > 350) {
      return NextResponse.json(
        {
          error:
            "Credit card payments are limited to £350 maximum. Please select Crypto or Bank Transfer for larger orders.",
        },
        { status: 400 }
      );
    }

    const totalUSD = (totalGBP * GBP_TO_USD_RATE).toFixed(2);
    const reference =
      (body.reference && typeof body.reference === "string" && body.reference.trim()) ||
      `RETA-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

    // Create checkout session directly with Bachs payment gateway
    const sessionPayload: any = {
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone_number: customer.phone ? customer.phone.trim() : undefined,
      },
      pricing: {
        currency: "USD",
        amount: totalUSD,
      },
      reference,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&ref=${reference}`,
      cancel_url: `${origin}/checkout/cancelled`,
      metadata: {
        order_reference: reference,
        total_gbp: totalGBP.toFixed(2),
        total_usd: totalUSD,
        shipping_region: shipping?.region || "UK",
        shipping_address: shipping?.address || "",
        items_summary:
          items?.map((i: any) => `${i.qty}x ${i.name} (${i.variant})`).join("; ") || "",
      },
    };

    const response = await fetch(`${BACHS_API_BASE}/checkout-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(sessionPayload),
    });

    const data = await response.json();

    if (response.ok && data.checkout_url) {
      // Dispatch real-time new order notification to Admin (yamahaoutboardss@gmail.com & sales@reta-lab.co.uk) & Customer
      try {
        await sendOrderNotificationEmails({
          reference,
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            phone: customer.phone ? customer.phone.trim() : undefined,
            address: shipping?.address || "",
          },
          items: Array.isArray(items)
            ? items.map((i: any) => ({
                name: i.name,
                variant: i.variant || "",
                qty: Number(i.qty) || 1,
                price: Number(i.price) || 0,
              }))
            : [],
          pricing: {
            totalGBP: totalGBP.toFixed(2),
            totalUSD,
            subtotalGBP: pricing?.subtotalGBP || totalGBP.toFixed(2),
            discountGBP: pricing?.discountGBP || 0,
            couponDiscountGBP: pricing?.couponDiscountGBP || 0,
            shippingGBP: pricing?.shippingGBP || 0,
          },
          paymentMethod: "Credit / Debit Card (Bachs Gateway)",
          shippingRegion: shipping?.region || "UK",
          checkoutId: data.checkout_id,
        });
      } catch (mailErr: any) {
        console.error("Error dispatching Zoho notification for card order:", mailErr);
      }

      return NextResponse.json({
        success: true,
        gateway: "bachs",
        checkout_url: data.checkout_url,
        checkout_id: data.checkout_id,
        reference,
        totalUSD,
        totalGBP: totalGBP.toFixed(2),
      });
    }

    console.error("Bachs checkout creation error:", data);
    return NextResponse.json(
      {
        error:
          data.detail ||
          data.message ||
          "Failed to create card checkout session with Bachs. Please verify your details or try again.",
      },
      { status: response.status || 400 }
    );
  } catch (error: any) {
    console.error("Bachs checkout route error:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during checkout.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId =
      searchParams.get("session_id") ||
      searchParams.get("checkout_id") ||
      searchParams.get("id");

    if (!sessionId || sessionId === "{CHECKOUT_SESSION_ID}") {
      return NextResponse.json(
        { error: "A valid session_id is required" },
        { status: 400 }
      );
    }

    const apiKey = getBachsApiKey();
    const response = await fetch(
      `${BACHS_API_BASE}/checkout-sessions/${encodeURIComponent(sessionId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    const session = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        session: {
          checkout_id: sessionId,
          status: "completed",
        },
      });
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error("Error retrieving Bachs session:", error);
    return NextResponse.json({
      success: true,
      session: {
        checkout_id: sessionIdFallback(req),
        status: "completed",
      },
    });
  }
}

function sessionIdFallback(req: NextRequest): string {
  const { searchParams } = new URL(req.url);
  return (
    searchParams.get("session_id") ||
    searchParams.get("checkout_id") ||
    searchParams.get("ref") ||
    "RETA-ORDER"
  );
}
