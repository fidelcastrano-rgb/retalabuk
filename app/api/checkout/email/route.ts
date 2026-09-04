import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function POST(req: NextRequest) {
  try {
    const { session, reference } = await req.json();

    if (!session) {
      return NextResponse.json({ error: "No session data provided" }, { status: 400 });
    }

    const customerEmail = session.customer?.email;
    const customerName = session.customer?.name || "Customer";
    const amount = session.amount || "0.00";
    const currency = session.currency || "USD";
    const adminEmail = process.env.ADMIN_EMAIL || "sales@reta-lab.co.uk";
    
    // In test/dev mode without a valid Resend key, we'll log it instead of failing
    if (!process.env.RESEND_API_KEY) {
      console.log("No RESEND_API_KEY found. Mocking email send:");
      console.log(`To: ${customerEmail}, ${adminEmail}`);
      console.log(`Order ${reference} completed for ${amount} ${currency}`);
      return NextResponse.json({ success: true, mocked: true });
    }

    // 1. Send Email to Customer
    if (customerEmail) {
      await resend.emails.send({
        from: "RETA LAB UK <sales@reta-lab.co.uk>",
        to: customerEmail,
        subject: `Order Confirmation - ${reference}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">Payment Successful!</h2>
            <p>Hi ${customerName},</p>
            <p>Thank you for your order with RETA LAB UK. Your payment has been successfully processed.</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Order Reference:</strong> ${reference}</p>
              <p style="margin: 0 0 10px 0;"><strong>Amount Paid:</strong> ${amount} ${currency}</p>
              <p style="margin: 0;"><strong>Payment Method:</strong> Credit/Debit Card</p>
            </div>
            
            <p>Your research compound order is now being queued for rapid laboratory dispatch. You will receive tracking details as soon as your parcel ships.</p>
            <p>If you have any questions, please reply to this email or contact us via WhatsApp.</p>
            
            <p style="margin-top: 30px; font-size: 0.9em; color: #64748b;">
              Best regards,<br/>
              The RETA LAB UK Team
            </p>
          </div>
        `,
      });
    }

    // 2. Send Email to Admin
    await resend.emails.send({
      from: "RETA LAB UK Orders <sales@reta-lab.co.uk>",
      to: adminEmail,
      subject: `New Card Order Received - ${reference}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>New Card Payment Received</h2>
          <p>A new order has been paid via Bachs Credit Card Gateway.</p>
          <ul>
            <li><strong>Reference:</strong> ${reference}</li>
            <li><strong>Customer Name:</strong> ${customerName}</li>
            <li><strong>Customer Email:</strong> ${customerEmail || "N/A"}</li>
            <li><strong>Amount:</strong> ${amount} ${currency}</li>
            <li><strong>Bachs Session ID:</strong> ${session.checkout_id || session.id || "N/A"}</li>
          </ul>
          <p>Please check the Bachs dashboard to verify the exact payment status and fulfill the order.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending order emails:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
