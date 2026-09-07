"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-[#070C14] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#EF4444]" />

        <div className="w-16 h-16 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mx-auto mb-4 mt-2">
          <XCircle size={36} />
        </div>

        <h1 className="text-2xl font-bold font-heading text-white">
          Order Cancelled
        </h1>
        <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
          The order process was interrupted or cancelled. Your cart items remain preserved.
        </p>

        <div className="bg-[#1E293B]/60 border border-[#334155] rounded-xl p-4 my-6 text-left text-xs text-[#CBD5E1] space-y-2">
          <p className="font-semibold text-white">Need assistance?</p>
          <ul className="list-disc pl-4 space-y-1 text-[#94A3B8]">
            <li>You can choose Crypto (Bitcoin/USDT) or Bank Transfer in the checkout drawer.</li>
            <li>Our team is available 24/7 on WhatsApp for direct support.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Catalog & Review Order</span>
          </Link>

          <a
            href="https://wa.me/447723217812"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-transparent border border-[#334155] hover:border-[#64748B] text-[#CBD5E1] hover:text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <MessageCircle size={15} className="text-[#FF6B1A]" />
            <span>Contact Support on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
