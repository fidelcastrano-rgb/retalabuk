"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, PackageCheck, ArrowRight, ShieldCheck, Mail, Loader2, AlertCircle } from "lucide-react";
import { useOrder } from "@/components/OrderContext";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearOrder } = useOrder();
  
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear the cart once checkout is reached
    clearOrder();

    if (!sessionId) {
      setLoading(false);
      return;
    }

    async function fetchSession() {
      try {
        const res = await fetch(`/api/checkout/bachs?session_id=${sessionId}`);
        const data = await res.json();
        if (data.success && data.session) {
          setSessionData(data.session);
        } else {
          setError(data.error || "Unable to retrieve session details");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order receipt");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId, clearOrder]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-8 text-white">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#10B981] animate-spin" />
            <p className="text-[#CBD5E1] text-sm">Verifying payment with Bachs Gateway...</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#10B981]/20 rounded-full flex items-center justify-center text-[#10B981] border border-[#10B981]/40 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-center text-white mb-2">
              Payment Confirmed!
            </h1>
            <p className="text-center text-[#CBD5E1] text-sm mb-6">
              Thank you for ordering with RetaLab UK. Your credit card payment has been successfully processed.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-[#1E293B]/80 rounded-xl p-5 border border-[#334155] space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm border-b border-[#334155] pb-2">
                <span className="text-[#94A3B8]">Payment Method:</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-[#10B981]" /> Credit / Debit Card (Bachs)
                </span>
              </div>

              {sessionId && (
                <div className="flex justify-between items-center text-sm border-b border-[#334155] pb-2">
                  <span className="text-[#94A3B8]">Reference / ID:</span>
                  <span className="font-mono text-xs text-[#CBD5E1]">{sessionData?.reference || sessionId}</span>
                </div>
              )}

              {sessionData?.amount && (
                <div className="flex justify-between items-center text-sm border-b border-[#334155] pb-2">
                  <span className="text-[#94A3B8]">Amount Paid:</span>
                  <span className="font-bold text-[#10B981] text-base">
                    ${sessionData.amount} {sessionData.currency || "USD"}
                  </span>
                </div>
              )}

              {sessionData?.customer?.email && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#94A3B8]">Customer Email:</span>
                  <span className="text-white">{sessionData.customer.email}</span>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-[#1D4ED8]/10 border border-[#1D4ED8]/30 rounded-xl p-4 mb-6 flex gap-3 items-start">
              <PackageCheck className="text-[#3B82F6] shrink-0 mt-0.5" size={20} />
              <div className="text-xs text-[#CBD5E1] space-y-1">
                <p className="font-bold text-white">What happens next?</p>
                <p>
                  Our fulfillment lab will prepare your order for discreet tracked dispatch. You will receive an automated tracking code via email once dispatched.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="flex-1 bg-[#FF6B1A] hover:bg-[#E55A0F] text-white py-3 px-4 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Continue Browsing <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="flex-1 bg-[#1E293B] hover:bg-[#334155] text-[#CBD5E1] hover:text-white py-3 px-4 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Mail size={16} /> Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
