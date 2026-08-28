import Link from "next/link";
import { XCircle, ArrowLeft, MessageCircle, RefreshCw } from "lucide-react";

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-[70vh] py-16 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">Payment Cancelled</h1>
          <p className="text-[#94A3B8] text-sm mt-2">
            Your credit card payment was not completed. No charges have been made to your account.
          </p>
        </div>

        <div className="bg-[#1E293B] rounded-xl p-4 border border-[#334155] text-left text-xs text-[#CBD5E1] space-y-2">
          <p className="font-semibold text-white">Need assistance with your order?</p>
          <p className="text-[#94A3B8] leading-relaxed">
            You can return to the store to retry, choose an alternate payment method like Crypto, or reach out to our team directly on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            <RefreshCw size={16} /> Return to Store
          </Link>
          <a
            href="https://wa.me/447438446215"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#FF6B1A] hover:bg-[#E55A0F] text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md"
          >
            <MessageCircle size={16} /> WhatsApp Help
          </a>
        </div>
      </div>
    </div>
  );
}
