import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotificationEmails } from "@/lib/zohoMail";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.log("[BACHS WEBHOOK RECEIVED]:", event?.type || event?.event || "unknown_event");

    const eventType = (event?.type || event?.event || "").toLowerCase();
    const data = event?.data || event?.payload || event;

    // Process payment success / collection succeeded events
    const isPaymentSuccess = 
      eventType.includes("succeeded") || 
      eventType.includes("success") || 
      eventType.includes("completed") || 
      data?.status === "completed" || 
      data?.status === "paid" || 
      data?.status === "successful";

    if (isPaymentSuccess) {
      const metadata = data?.metadata || {};
      const reference = metadata?.order_reference || data?.reference || `RETA-CARD-${Date.now().toString(36).toUpperCase()}`;
      const totalGBP = metadata?.total_gbp || (data?.pricing?.amount ? (data.pricing.amount / 1.3).toFixed(2) : "0.00");
      const totalUSD = metadata?.total_usd || (data?.pricing?.amount ? data.pricing.amount.toString() : undefined);

      const customer = {
        name: data?.customer?.name || metadata?.customer_name || "Card Customer",
        email: data?.customer?.email || metadata?.customer_email || "",
        phone: data?.customer?.phone || data?.customer?.phone_number || metadata?.customer_phone || "",
        address: metadata?.shipping_address || "",
      };

      await sendOrderNotificationEmails({
        reference,
        customer,
        items: [],
        pricing: {
          totalGBP,
          totalUSD,
        },
        paymentMethod: "Credit / Debit Card (Payment Confirmed)",
        shippingRegion: metadata?.shipping_region || "UK",
        checkoutId: data?.checkout_id || data?.id,
      });

      console.log(`[BACHS WEBHOOK] Successfully processed payment confirmation for order ${reference}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[BACHS WEBHOOK ERROR]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Bachs webhook endpoint active" });
}
