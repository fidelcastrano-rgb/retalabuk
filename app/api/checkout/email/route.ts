import { NextRequest, NextResponse } from "next/server";
import { 
  sendOrderNotificationEmails, 
  OrderEmailPayload, 
  OrderItem 
} from "@/lib/zohoMail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      session,
      reference: refParam,
      localOrder,
      customer: directCustomer,
      items: directItems,
      pricing: directPricing,
      paymentMethod: directPaymentMethod,
      shipping: directShipping,
    } = body;

    // Resolve Order Reference
    const reference =
      refParam ||
      session?.reference ||
      localOrder?.reference ||
      `RETA-${Date.now().toString(36).toUpperCase()}`;

    // Resolve Customer Details (merging direct payload, localOrder, and gateway session)
    const customer = {
      name:
        directCustomer?.name ||
        localOrder?.customer?.name ||
        session?.customer?.name ||
        "Valued Customer",
      email:
        directCustomer?.email ||
        localOrder?.customer?.email ||
        session?.customer?.email ||
        "",
      phone:
        directCustomer?.phone ||
        localOrder?.customer?.phone ||
        session?.customer?.phone ||
        "",
      address:
        directCustomer?.address ||
        localOrder?.customer?.address ||
        localOrder?.shipping?.address ||
        "",
    };

    // Resolve Order Items
    let items: OrderItem[] = [];
    if (Array.isArray(directItems) && directItems.length > 0) {
      items = directItems;
    } else if (Array.isArray(localOrder?.items) && localOrder.items.length > 0) {
      items = localOrder.items.map((it: any) => ({
        name: it.name,
        variant: it.variant || "",
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 0,
      }));
    }

    // Resolve Pricing Details
    const pricing = {
      totalGBP:
        directPricing?.totalGBP ||
        localOrder?.totalGBP ||
        (session?.currency === "GBP" ? session.amount : undefined) ||
        "0.00",
      totalUSD:
        directPricing?.totalUSD ||
        localOrder?.totalUSD ||
        (session?.currency === "USD" ? session.amount : undefined),
      subtotalGBP:
        directPricing?.subtotalGBP ||
        localOrder?.pricing?.subtotalGBP,
      discountGBP:
        directPricing?.discountGBP ||
        localOrder?.pricing?.discountGBP,
      couponDiscountGBP:
        directPricing?.couponDiscountGBP ||
        localOrder?.pricing?.couponDiscountGBP,
      cryptoDiscountGBP:
        directPricing?.cryptoDiscountGBP ||
        localOrder?.pricing?.cryptoDiscountGBP,
      shippingGBP:
        directPricing?.shippingGBP ||
        localOrder?.pricing?.shippingGBP,
    };

    // Resolve Payment Method & Region
    const paymentMethod =
      directPaymentMethod ||
      localOrder?.customer?.payment ||
      (session ? "Credit / Debit Card (Bachs Gateway)" : "Online Order");

    const shippingRegion =
      directShipping ||
      directCustomer?.shipping ||
      localOrder?.shipping ||
      localOrder?.customer?.shipping ||
      "UK";

    const checkoutId = session?.checkout_id || session?.id || localOrder?.checkout_id;

    const emailPayload: OrderEmailPayload = {
      reference,
      customer,
      items,
      pricing,
      paymentMethod,
      shippingRegion,
      checkoutId,
    };

    const result = await sendOrderNotificationEmails(emailPayload);

    return NextResponse.json({
      success: true,
      deliverySystem: "zoho_mail",
      reference,
      customerNotified: result.customerSent,
      adminNotified: result.adminSent,
      notes: result.notes,
    });
  } catch (error: any) {
    console.error("[ZOHO MAIL ROUTE ERROR]:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process order email notifications",
        deliverySystem: "zoho_mail",
      },
      { status: 500 }
    );
  }
}
