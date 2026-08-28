import { NextRequest, NextResponse } from "next/server";

const NEW_BACHS_LIVE_KEY = "sk_live_c58e2ddb_ixgLAIRNj5sv0dXGH0ha9QnTc_qdKJtki7jKUsORrJs";
const BACHS_API_KEY = process.env.BACHS_SECRET_KEY && process.env.BACHS_SECRET_KEY.startsWith("sk_live_c58e2ddb") 
  ? process.env.BACHS_SECRET_KEY 
  : NEW_BACHS_LIVE_KEY;
const BACHS_BASE_URL = "https://api.bachs.io/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customer, pricing, shipping, reference, appUrl: clientAppUrl } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "No items in cart." }, { status: 400 });
    }

    if (!customer?.email) {
      return NextResponse.json({ error: "Customer email is required for credit card processing." }, { status: 400 });
    }

    // Determine base host URL for redirect callbacks
    const origin = clientAppUrl || req.headers.get("origin") || req.headers.get("referer") || "https://reta-lab.co.uk";
    const cleanOrigin = origin.replace(/\/$/, "");

    const success_url = `${cleanOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${cleanOrigin}/checkout/cancelled`;

    // Convert total GBP to USD for Bachs international card processing
    // Approx rate 1.30 USD per 1 GBP
    const gbpAmount = parseFloat(pricing?.totalGBP || "0");
    if (isNaN(gbpAmount) || gbpAmount <= 0) {
      return NextResponse.json({ error: "Invalid total price." }, { status: 400 });
    }

    const usdRate = 1.30;
    const usdAmount = (gbpAmount * usdRate).toFixed(2);

    const orderRef = reference || `RETA-${Date.now().toString(36).toUpperCase()}`;

    const lineProducts = items.map((it: { name: string; variant?: string; qty: number; price: number }) => ({
      name: `${it.name} (${it.variant || "Standard"})`,
      quantity: it.qty,
      unit_amount: (it.price * usdRate).toFixed(2),
    }));

    const sessionPayload = {
      customer: {
        name: customer.name || "Customer",
        email: customer.email,
        phone: customer.phone || undefined,
      },
      pricing: {
        amount: usdAmount,
        base_currency: "USD",
      },
      products: lineProducts.length > 0 ? lineProducts : undefined,
      reference: orderRef,
      success_url,
      cancel_url,
    };

    const response = await fetch(`${BACHS_BASE_URL}/checkout-sessions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BACHS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Bachs API error response:", data);
      return NextResponse.json(
        { error: data.detail || data.message || "Failed to initialize Bachs checkout session." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      checkout_id: data.checkout_id,
      checkout_url: data.checkout_url,
      amount_usd: usdAmount,
      amount_gbp: gbpAmount.toFixed(2),
      reference: orderRef,
    });
  } catch (error: any) {
    console.error("Error creating Bachs checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error connecting to payment gateway." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id parameter." }, { status: 400 });
    }

    const response = await fetch(`${BACHS_BASE_URL}/checkout-sessions/${sessionId}`, {
      headers: {
        "Authorization": `Bearer ${BACHS_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Unable to retrieve session." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error verifying session." },
      { status: 500 }
    );
  }
}
