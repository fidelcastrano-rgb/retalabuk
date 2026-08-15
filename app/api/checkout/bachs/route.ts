import { NextRequest, NextResponse } from "next/server";

const BACHS_API_KEY = process.env.BACHS_SECRET_KEY || "sk_live_fe657a53_NMWEM6yPRnPGgxr0aGg3BW5lV9EPea56Czp33XQ9nzs";
const BACHS_BASE_URL = "https://api.bachs.io/v1";

// Conversion rate GBP to USD (approx 1.28)
const GBP_TO_USD_RATE = 1.28;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      items, 
      customer, 
      shipping, 
      shippingFee, 
      discountAmount, 
      couponCode, 
      totalGbp 
    } = body;

    if (!customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: "Customer name and email are required for credit card checkout." },
        { status: 400 }
      );
    }

    if (!totalGbp || totalGbp <= 0) {
      return NextResponse.json(
        { error: "Invalid order total amount." },
        { status: 400 }
      );
    }

    // Convert total GBP to USD for Bachs international card processing
    const amountUsd = (Number(totalGbp) * GBP_TO_USD_RATE).toFixed(2);

    // Get origin URL for callbacks
    const origin = req.headers.get("origin") || req.headers.get("referer") || process.env.APP_URL || "https://reta-lab.co.uk";
    const cleanOrigin = origin.replace(/\/$/, "");

    const payload = {
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone ? customer.phone.trim() : undefined,
      },
      pricing: {
        amount: amountUsd,
        base_currency: "USD",
      },
      success_url: `${cleanOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cleanOrigin}/checkout/cancelled`,
      metadata: {
        store: "RetaLab UK",
        order_total_gbp: `£${Number(totalGbp).toFixed(2)}`,
        usd_converted: `$${amountUsd}`,
        shipping_method: shipping || "Standard",
        shipping_fee_gbp: `£${Number(shippingFee || 0).toFixed(2)}`,
        coupon_code: couponCode || "None",
        discount_gbp: `£${Number(discountAmount || 0).toFixed(2)}`,
        delivery_address: customer.address || "Not provided",
        items_summary: Array.isArray(items) 
          ? items.map((i: any) => `${i.qty}x ${i.name} (${i.variant})`).join(", ") 
          : "Research Peptides & Lab Supplies",
      },
    };

    const response = await fetch(`${BACHS_BASE_URL}/checkout-sessions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BACHS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Bachs API error response:", data);
      return NextResponse.json(
        { error: data.detail || data.message || "Payment gateway failed to initialize session." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      checkout_id: data.checkout_id,
      checkout_url: data.checkout_url,
      reference: data.reference,
      amount_usd: amountUsd,
      amount_gbp: Number(totalGbp).toFixed(2),
    });

  } catch (error: any) {
    console.error("Error creating Bachs checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error occurred while processing checkout." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id parameter" }, { status: 400 });
    }

    const response = await fetch(`${BACHS_BASE_URL}/checkout-sessions/${sessionId}`, {
      headers: {
        "Authorization": `Bearer ${BACHS_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Unable to retrieve checkout session" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
