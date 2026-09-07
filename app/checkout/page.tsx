"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-[#070C14] text-white">
      <div className="max-w-md w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] mx-auto mb-4">
          <ShoppingBag size={28} />
        </div>
        <h1 className="text-2xl font-bold font-heading text-white mb-2">Checkout</h1>
        <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
          Please select your research items from our catalog to proceed with your order via WhatsApp or Email.
        </p>
        <Link
          href="/#catalog"
          className="inline-flex items-center justify-center gap-2 bg-[#FF6B1A] hover:bg-[#E55A0F] text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> View Research Catalog
        </Link>
      </div>
    </div>
  );
}
