"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  PackageCheck, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Loader2, 
  Mail,
  ExternalLink
} from "lucide-react";
import { useOrder } from "@/components/OrderContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const refFromUrl = searchParams.get("ref");
  const { clearOrder } = useOrder();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [localOrder, setLocalOrder] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("reta_last_order");
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.error("Could not parse saved order", e);
      }
    }
    return null;
  });
  const [emailStatus, setEmailStatus] = useState<"pending" | "sent" | "error">("pending");

  useEffect(() => {
    // Clear the cart on successful completion
    clearOrder();

    async function triggerEmailNotification(session: any, reference: string) {
      if (!reference) return;
      const sentKey = `reta_email_sent_${reference}`;
      if (typeof window !== "undefined" && localStorage.getItem(sentKey)) {
        setEmailStatus("sent");
        return;
      }

      try {
        const res = await fetch("/api/checkout/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session,
            reference,
            localOrder,
          }),
        });
        if (res.ok) {
          if (typeof window !== "undefined") {
            localStorage.setItem(sentKey, "true");
          }
          setEmailStatus("sent");
        } else {
          setEmailStatus("error");
        }
      } catch (e) {
        console.error("Failed to notify via email", e);
        setEmailStatus("error");
      }
    }

    async function fetchSession() {
      const validSessionId =
        sessionId && sessionId !== "{CHECKOUT_SESSION_ID}" ? sessionId : null;

      if (validSessionId) {
        try {
          const res = await fetch(`/api/checkout/bachs?session_id=${encodeURIComponent(validSessionId)}`);
          const data = await res.json();
          if (data.success && data.session) {
            setSessionData(data.session);
            await triggerEmailNotification(data.session, refFromUrl || data.session.reference || localOrder?.reference);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error fetching Bachs session:", err);
        }
      }

      // Fallback to local order details if session retrieval was not possible
      if (localOrder) {
        const simulatedSession = {
          checkout_id: localOrder.checkout_id || validSessionId || "CH_MANUAL",
          amount: localOrder.totalUSD || "0.00",
          currency: "USD",
          customer: {
            email: localOrder.customer?.email,
            name: localOrder.customer?.name,
            phone: localOrder.customer?.phone,
          },
          status: "completed",
        };
        setSessionData(simulatedSession);
        await triggerEmailNotification(simulatedSession, refFromUrl || localOrder.reference);
      }

      setLoading(false);
    }

    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, refFromUrl]);

  const orderReference =
    refFromUrl ||
    sessionData?.reference ||
    localOrder?.reference ||
    "RETA-ORDER-CONFIRMED";

  const customerName =
    sessionData?.customer?.name ||
    localOrder?.customer?.name ||
    "Valued Researcher";

  const customerEmail =
    sessionData?.customer?.email ||
    localOrder?.customer?.email ||
    "";

  const displayGBP = localOrder?.totalGBP;
  const displayUSD = sessionData?.amount || localOrder?.totalUSD;

  return (
    <div className="min-h-screen bg-[#070C14] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#10B981] via-[#2563EB] to-[#10B981]" />

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] mb-3 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <CheckCircle2 size={36} />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#10B981] font-bold">
            Payment Verified & Approved
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-1">
            Thank You for Your Order
          </h1>
          <p className="text-sm text-[#94A3B8] mt-2 max-w-md">
            Your payment was successfully processed via Bachs Secure Gateway. A receipt has been issued to <strong className="text-white">{customerEmail || "your email"}</strong>.
          </p>
        </div>

        {/* Reference and Details Box */}
        <div className="bg-[#1E293B]/80 border border-[#334155] rounded-xl p-4 sm:p-5 mb-6 space-y-3 text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <span className="text-[#94A3B8]">Order Reference:</span>
            <span className="font-mono font-bold text-[#FF6B1A] text-base">
              {orderReference}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <span className="text-[#94A3B8]">Recipient:</span>
            <span className="font-medium text-white">{customerName}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#334155]">
            <span className="text-[#94A3B8]">Payment Method:</span>
            <span className="flex items-center gap-1.5 font-medium text-white">
              <ShieldCheck size={16} className="text-[#10B981]" /> Confirmed Order
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#94A3B8]">Amount Paid:</span>
            <div className="text-right">
              {displayGBP && (
                <span className="font-bold text-[#10B981] text-lg">
                  £{displayGBP}
                </span>
              )}
              {displayUSD && (
                <span className="text-xs text-[#94A3B8] block">
                  (${displayUSD} USD billed)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ordered Items Summary if available */}
        {localOrder?.items && localOrder.items.length > 0 && (
          <div className="bg-[#1E293B]/40 border border-[#334155] rounded-xl p-4 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
              Reserved Research Compounds
            </h3>
            <div className="space-y-1.5 text-xs">
              {localOrder.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between text-[#CBD5E1]">
                  <span>
                    {it.qty}x {it.name} <span className="text-[#94A3B8]">({it.variant})</span>
                  </span>
                  <span className="font-mono text-white">
                    £{(it.price * it.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dispatch Timeline */}
        <div className="bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Truck className="text-[#3B82F6] shrink-0 mt-0.5" size={20} />
          <div className="text-xs leading-relaxed text-[#CBD5E1]">
            <strong className="text-white block mb-0.5 font-medium">
              Priority Cold-Chain Laboratory Dispatch
            </strong>
            Your batch is now being prepared in our specialized sterile packing unit. Tracking numbers are dispatched automatically via email and SMS within 24 hours.
          </div>
        </div>

        {/* Email Notification Pill */}
        <div className="flex items-center justify-between bg-[#0B1120] border border-[#1E293B] rounded-lg px-3.5 py-2.5 mb-6 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#2563EB]" />
            <span>Confirmation & Tracking Email:</span>
          </div>
          <span className="font-medium text-[#10B981] flex items-center gap-1">
            {emailStatus === "sent" ? "Dispatched" : "Processing"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md"
          >
            <span>Return to Catalog</span>
            <ArrowRight size={16} />
          </Link>

          <a
            href="https://wa.me/447723217812"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-transparent border border-[#334155] hover:border-[#64748B] text-[#CBD5E1] hover:text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <span>Questions regarding your delivery? Contact WhatsApp Support</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070C14] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#2563EB]" />
            <span className="text-sm text-[#94A3B8]">Verifying secure payment...</span>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
