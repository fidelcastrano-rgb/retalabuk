"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, MessageCircle, Mail, Package, CreditCard, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(() => Boolean(sessionId));
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let isMounted = true;
    async function fetchSession() {
      try {
        const res = await fetch(`/api/checkout/bachs?session_id=${sessionId}`);
        const data = await res.json();
        if (!isMounted) return;
        if (res.ok && data.success) {
          setSessionData(data.session);
        } else {
          setError(data.error || "Could not retrieve order details.");
        }
      } catch (err: any) {
        if (isMounted) setError("Network error fetching payment confirmation.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSession();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const displayReference = sessionData?.reference || sessionId || "RETA-CONFIRMED";

  return (
    <div className="min-h-[75vh] py-16 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">Payment Successful!</h1>
          <p className="text-emerald-100 text-sm mt-1">Thank you for your order with RETA LAB UK.</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#10B981] mx-auto" />
              <p className="text-[#CBD5E1] text-sm">Verifying payment with Bachs Gateway...</p>
            </div>
          ) : (
            <>
              <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155] space-y-2 text-sm">
                <div className="flex justify-between items-center text-[#94A3B8]">
                  <span>Order Reference:</span>
                  <span className="font-mono font-bold text-white">
                    {displayReference}
                  </span>
                </div>
                {sessionData?.customer?.email && (
                  <div className="flex justify-between items-center text-[#94A3B8]">
                    <span>Recipient Email:</span>
                    <span className="text-white font-medium">{sessionData.customer.email}</span>
                  </div>
                )}
                {sessionData?.amount && (
                  <div className="flex justify-between items-center text-[#94A3B8]">
                    <span>Amount Paid:</span>
                    <span className="text-[#10B981] font-bold text-base">
                      ${parseFloat(sessionData.amount).toFixed(2)} USD
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[#94A3B8] pt-2 border-t border-[#334155]">
                  <span>Payment Gateway:</span>
                  <span className="text-[#38BDF8] flex items-center gap-1 font-medium">
                    <CreditCard size={14} /> Bachs Credit Card
                  </span>
                </div>
              </div>

              <div className="bg-[#1D4ED8]/10 border border-[#1D4ED8]/30 rounded-xl p-4 text-xs text-[#CBD5E1] space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <ShieldCheck className="text-[#10B981] w-4 h-4" /> Next Steps & Dispatch Information
                </div>
                <p className="leading-relaxed">
                  Your research compound order is now being queued for rapid laboratory dispatch. You will receive an email confirmation and tracking details as soon as your parcel ships via tracked delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="https://wa.me/447438446215"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#FF6B1A] hover:bg-[#E55A0F] text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle size={18} /> WhatsApp Support
                </a>
                <a
                  href="mailto:sales@reta-lab.co.uk"
                  className="flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#334155] border border-[#475569] text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer"
                >
                  <Mail size={18} /> Email Inquiries
                </a>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm text-[#38BDF8] hover:text-[#60A5FA] font-medium transition-colors"
                >
                  <Package size={16} /> Continue Browsing Catalog <ArrowRight size={14} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
