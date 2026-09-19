import nodemailer from "nodemailer";

export type ZohoTransporter = ReturnType<typeof nodemailer.createTransport>;

export interface OrderItem {
  name: string;
  variant?: string;
  qty: number;
  price: number;
}

export interface CustomerDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PricingDetails {
  subtotalGBP?: string | number;
  discountGBP?: string | number;
  couponDiscountGBP?: string | number;
  cryptoDiscountGBP?: string | number;
  finalSubtotalGBP?: string | number;
  shippingGBP?: string | number;
  totalGBP?: string | number;
  totalUSD?: string | number;
}

export interface OrderEmailPayload {
  reference: string;
  customer: CustomerDetails;
  items: OrderItem[];
  pricing: PricingDetails;
  paymentMethod?: string;
  shippingRegion?: string;
  checkoutId?: string;
}

/**
 * Creates and returns a Nodemailer transporter configured for Zoho Mail SMTP.
 */
export function getZohoTransporter(): ZohoTransporter | null {
  const user = (process.env.ZOHO_USER || process.env.ZOHO_EMAIL || "sales@reta-lab.co.uk").trim();
  const pass = (process.env.ZOHO_PASSWORD || process.env.ZOHO_APP_PASSWORD || "LILwayne1446@").trim();
  const host = (process.env.ZOHO_HOST || "smtp.zoho.com").trim();
  const port = parseInt(process.env.ZOHO_PORT || "587", 10);
  const secure = port === 465;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Generates responsive HTML email template for Customer confirmation.
 */
export function generateCustomerEmailHtml(data: OrderEmailPayload): string {
  const customerName = data.customer.name || "Valued Customer";
  const itemsHtml = data.items && data.items.length > 0
    ? data.items.map((item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-weight: 600; color: #0f172a;">
          ${item.name}
          ${item.variant ? `<br/><span style="font-size: 11px; color: #64748b; font-weight: 400;">${item.variant}</span>` : ""}
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #334155;">${item.qty}</td>
        <td style="padding: 12px 8px; text-align: right; color: #334155;">£${Number(item.price).toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #0f172a;">£${(Number(item.price) * item.qty).toFixed(2)}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="4" style="padding: 12px 8px; text-align: center; color: #64748b;">Order details recorded in system.</td>
      </tr>
    `;

  const totalGBP = Number(data.pricing.totalGBP || 0).toFixed(2);
  const subtotalGBP = data.pricing.subtotalGBP ? Number(data.pricing.subtotalGBP).toFixed(2) : null;
  const shippingGBP = data.pricing.shippingGBP ? Number(data.pricing.shippingGBP).toFixed(2) : null;
  const cryptoDiscount = data.pricing.cryptoDiscountGBP ? Number(data.pricing.cryptoDiscountGBP).toFixed(2) : null;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${data.reference}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="background-color: #070C14; padding: 28px 24px; text-align: center; border-bottom: 3px solid #10B981;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px; font-weight: 700;">RETA LAB UK</h1>
        <p style="color: #94A3B8; margin: 6px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Premium Research Peptides</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 28px 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #d1fae5; color: #065f46; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 9999px; margin-bottom: 12px;">
            ✓ Order Placed Successfully
          </div>
          <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px;">Thank You, ${customerName}</h2>
          <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
            Your order has been received and registered under Reference <strong style="color: #0f172a;">${data.reference}</strong>.
          </p>
        </div>

        <!-- Order Summary Box -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Order Reference:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${data.reference}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Payment Method:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">${data.paymentMethod || "Credit / Debit Card"}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Total Amount:</td>
              <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #10b981; font-size: 15px;">£${totalGBP}</td>
            </tr>
            ${data.pricing.totalUSD ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Amount (USD):</td>
              <td style="padding: 4px 0; text-align: right; color: #64748b; font-size: 12px;">$${Number(data.pricing.totalUSD).toFixed(2)} USD</td>
            </tr>` : ""}
          </table>
        </div>

        <!-- Ordered Items Table -->
        <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
          Ordered Items
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Total Calculation -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            ${subtotalGBP ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Subtotal:</td>
              <td style="padding: 4px 0; text-align: right; color: #0f172a;">£${subtotalGBP}</td>
            </tr>` : ""}
            ${cryptoDiscount && Number(cryptoDiscount) > 0 ? `
            <tr>
              <td style="padding: 4px 0; color: #10b981;">10% Crypto Discount:</td>
              <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: 600;">-£${cryptoDiscount}</td>
            </tr>` : ""}
            ${shippingGBP ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Shipping (${data.shippingRegion || "Standard"}):</td>
              <td style="padding: 4px 0; text-align: right; color: #0f172a;">£${shippingGBP}</td>
            </tr>` : ""}
            <tr style="border-top: 2px solid #0f172a;">
              <td style="padding: 8px 0 0 0; font-weight: 700; color: #0f172a; font-size: 15px;">Total:</td>
              <td style="padding: 8px 0 0 0; text-align: right; font-weight: 800; color: #10b981; font-size: 17px;">£${totalGBP}</td>
            </tr>
          </table>
        </div>

        <!-- Delivery Address -->
        ${data.customer.address ? `
        <div style="background-color: #f8fafc; border-left: 3px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #2563eb; letter-spacing: 0.5px;">Delivery Address</h4>
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-line;">${data.customer.address}</p>
        </div>` : ""}

        <!-- Next Steps Note -->
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #1e40af; line-height: 1.5;">
          <strong style="display: block; margin-bottom: 4px;">📦 Dispatch Timeline & Quality Guarantee</strong>
          All research materials undergo HPLC purity testing and temperature-controlled handling. Your parcel is scheduled for swift dispatch, and full courier tracking details will be sent directly to your email once collected.
        </div>

        <!-- Support Info -->
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
          If you have any questions or require special delivery arrangements, reply to this email or reach us on WhatsApp at <strong>+447727171512</strong>.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">RETA LAB UK — Research Grade Peptides & Analytical Standards</p>
        <p style="margin: 0;">London, United Kingdom • sales@reta-lab.co.uk</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Generates detailed HTML email template for Admin notification.
 */
export function generateAdminEmailHtml(data: OrderEmailPayload): string {
  const customerName = data.customer.name || "Customer";
  const customerEmail = data.customer.email || "Not provided";
  const customerPhone = data.customer.phone || "Not provided";
  const customerAddress = data.customer.address || "Not provided";
  const totalGBP = Number(data.pricing.totalGBP || 0).toFixed(2);

  const itemsListHtml = data.items && data.items.length > 0
    ? data.items.map((item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; font-weight: 600; color: #0f172a;">${item.name}</td>
        <td style="padding: 10px 8px; color: #64748b;">${item.variant || "Standard"}</td>
        <td style="padding: 10px 8px; text-align: center; font-weight: 700; color: #0f172a;">${item.qty}</td>
        <td style="padding: 10px 8px; text-align: right; color: #334155;">£${Number(item.price).toFixed(2)}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #0f172a;">£${(Number(item.price) * item.qty).toFixed(2)}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="5" style="padding: 10px 8px; text-align: center; color: #64748b;">No items array provided in payload.</td>
      </tr>
    `;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEW ORDER - ${data.reference}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 12px; color: #e2e8f0;">
    <div style="max-width: 640px; margin: 0 auto; background: #111827; border-radius: 12px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      
      <!-- Top Alert Bar -->
      <div style="background: linear-gradient(90deg, #10B981, #059669); padding: 16px 24px; color: #ffffff;">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; opacity: 0.9;">New Order Alert</div>
        <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 800;">£${totalGBP} — ${data.reference}</h1>
      </div>

      <div style="padding: 24px;">
        
        <!-- Key Metadata Grid -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; background-color: #1f2937; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af; border-bottom: 1px solid #374151;">Order Reference:</td>
            <td style="padding: 10px 16px; text-align: right; font-weight: 700; color: #34d399; font-family: monospace; border-bottom: 1px solid #374151;">${data.reference}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af; border-bottom: 1px solid #374151;">Payment Method:</td>
            <td style="padding: 10px 16px; text-align: right; font-weight: 700; color: #ffffff; border-bottom: 1px solid #374151;">${data.paymentMethod || "Credit / Debit Card"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af; border-bottom: 1px solid #374151;">Total Amount (GBP):</td>
            <td style="padding: 10px 16px; text-align: right; font-weight: 800; color: #10b981; font-size: 16px; border-bottom: 1px solid #374151;">£${totalGBP}</td>
          </tr>
          ${data.pricing.totalUSD ? `
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af; border-bottom: 1px solid #374151;">Total Amount (USD):</td>
            <td style="padding: 10px 16px; text-align: right; color: #9ca3af; font-size: 13px; border-bottom: 1px solid #374151;">$${Number(data.pricing.totalUSD).toFixed(2)} USD</td>
          </tr>` : ""}
          ${data.checkoutId ? `
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af;">Gateway Session ID:</td>
            <td style="padding: 10px 16px; text-align: right; font-family: monospace; font-size: 11px; color: #9ca3af;">${data.checkoutId}</td>
          </tr>` : ""}
        </table>

        <!-- Customer Information Section -->
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin: 0 0 12px 0;">
          Customer & Delivery Details
        </h3>
        <div style="background-color: #1a2234; border: 1px solid #2d3748; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 120px; color: #9ca3af; padding-bottom: 6px;">Customer Name:</td>
              <td style="font-weight: 700; color: #ffffff; padding-bottom: 6px;">${customerName}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding-bottom: 6px;">Email:</td>
              <td style="padding-bottom: 6px;">
                <a href="mailto:${customerEmail}" style="color: #60a5fa; text-decoration: none; font-weight: 600;">${customerEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding-bottom: 6px;">Phone:</td>
              <td style="padding-bottom: 6px;">
                ${customerPhone !== "Not provided" ? `<a href="tel:${customerPhone}" style="color: #60a5fa; text-decoration: none;">${customerPhone}</a>` : '<span style="color: #6b7280;">Not provided</span>'}
              </td>
            </tr>
            <tr>
              <td style="color: #9ca3af; padding-bottom: 6px;">Shipping Region:</td>
              <td style="color: #ffffff; padding-bottom: 6px;">${data.shippingRegion || "UK"}</td>
            </tr>
            <tr>
              <td style="color: #9ca3af; vertical-align: top;">Address:</td>
              <td style="color: #ffffff; font-weight: 600; white-space: pre-line;">${customerAddress}</td>
            </tr>
          </table>
        </div>

        <!-- Items Table -->
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin: 0 0 12px 0;">
          Ordered Line Items
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; background-color: #1f2937; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #263042; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 10px 8px; text-align: left;">Product</th>
              <th style="padding: 10px 8px; text-align: left;">Variant</th>
              <th style="padding: 10px 8px; text-align: center;">Qty</th>
              <th style="padding: 10px 8px; text-align: right;">Unit</th>
              <th style="padding: 10px 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody style="background-color: #ffffff; color: #1e293b;">
            ${itemsListHtml}
          </tbody>
        </table>

        <!-- Quick Action Buttons -->
        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #1f2937;">
          <a href="mailto:${customerEmail}?subject=Regarding Your Order ${data.reference}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 8px; margin: 4px;">
            Reply to Customer
          </a>
          ${customerPhone !== "Not provided" ? `
          <a href="https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 8px; margin: 4px;">
            WhatsApp Customer
          </a>` : ""}
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #0a0e17; padding: 16px 24px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #1f2937;">
        Zoho Mail Notification Gateway • RETA LAB UK Administration
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Sends order notification emails to BOTH the customer and the admin using Zoho Mail SMTP.
 */
export async function sendOrderNotificationEmails(data: OrderEmailPayload): Promise<{
  success: boolean;
  customerSent: boolean;
  adminSent: boolean;
  notes?: string;
}> {
  const rawAdmin = (process.env.ADMIN_EMAIL || "").trim();
  const adminRecipients = Array.from(
    new Set(
      [
        "yamahaoutboardss@gmail.com",
        rawAdmin,
        "sales@reta-lab.co.uk",
      ].filter((email) => Boolean(email) && email.includes("@"))
    )
  );
  const zohoUser = (process.env.ZOHO_USER || process.env.ZOHO_EMAIL || "sales@reta-lab.co.uk").trim();
  const customerEmail = data.customer.email ? data.customer.email.trim() : null;

  const transporter = getZohoTransporter();

  // If Zoho SMTP credentials are not yet defined in environment, log comprehensively so orders are never blocked
  if (!transporter) {
    console.log("--------------------------------------------------");
    console.log("[ZOHO MAIL NOTICE] Zoho credentials (ZOHO_USER / ZOHO_PASSWORD) not configured.");
    console.log(`[ZOHO MAIL MOCK] Admin Notification Queued for: ${adminRecipients.join(", ")}`);
    if (customerEmail) {
      console.log(`[ZOHO MAIL MOCK] Customer Notification Queued for: ${customerEmail}`);
    }
    console.log(`[ZOHO MAIL ORDER REF]: ${data.reference}`);
    console.log(`[ZOHO MAIL TOTAL]: £${data.pricing.totalGBP}`);
    console.log("--------------------------------------------------");

    return {
      success: true,
      customerSent: false,
      adminSent: false,
      notes: "Zoho Mail credentials pending in environment variables. Mock notification logged.",
    };
  }

  const senderName = "RETA LAB UK";
  const fromHeader = `"${senderName}" <${zohoUser}>`;

  const results = {
    customerSent: false,
    adminSent: false,
  };

  // 1. Send confirmation to Customer (if valid email provided)
  if (customerEmail && customerEmail.includes("@")) {
    try {
      await transporter.sendMail({
        from: fromHeader,
        to: customerEmail,
        subject: `Order Confirmation: ${data.reference} - RETA LAB UK`,
        html: generateCustomerEmailHtml(data),
      });
      results.customerSent = true;
      console.log(`[ZOHO MAIL] Customer order confirmation sent to ${customerEmail}`);
    } catch (err: any) {
      console.error(`[ZOHO MAIL ERROR] Failed sending to customer (${customerEmail}):`, err.message);
    }
  }

  // 2. Send notification to Admins (yamahaoutboardss@gmail.com & sales@reta-lab.co.uk)
  try {
    const isCard = data.paymentMethod?.toLowerCase().includes("card");
    const isPaid = data.paymentMethod?.toLowerCase().includes("confirmed") || data.paymentMethod?.toLowerCase().includes("paid");
    const statusTag = isPaid ? "✅ [PAYMENT CONFIRMED]" : isCard ? "💳 [NEW CARD ORDER]" : "🚨 [NEW ORDER]";

    await transporter.sendMail({
      from: fromHeader,
      to: adminRecipients,
      subject: `${statusTag} ${data.reference} - £${Number(data.pricing.totalGBP || 0).toFixed(2)} - ${data.customer.name || "Customer"}`,
      html: generateAdminEmailHtml(data),
    });
    results.adminSent = true;
    console.log(`[ZOHO MAIL] Admin order notification sent to ${adminRecipients.join(", ")}`);
  } catch (err: any) {
    console.error(`[ZOHO MAIL ERROR] Failed sending to admin (${adminRecipients.join(", ")}):`, err.message);
  }

  return {
    success: results.customerSent || results.adminSent,
    customerSent: results.customerSent,
    adminSent: results.adminSent,
  };
}
