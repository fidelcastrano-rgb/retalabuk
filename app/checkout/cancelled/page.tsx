"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw, MessageCircle } from "lucide-react";

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-8 text-white text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 border border-amber-500/40">
            <AlertTriangle size={36} />
          </div>
        </div>

        <h1 className="text-2xl font-heading font-bold text-white mb-2">
          Checkout Incomplete
        </h1>
        <p className="text-[#CBD5E1] text-sm mb-6">
          Your credit card payment was not completed or was cancelled. No charges were made to your account.
        </p>

        <div className="bg-[#1E293B] rounded-xl p-4 text-xs text-[#94A3B8] mb-6 text-left space-y-2">
          <p className="font-semibold text-white">Need help completing your order?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check your card details and billing address</li>
            <li>Ensure international online transactions are enabled on your card</li>
            <li>Alternatively, pay via Bank Transfer, Crypto, or WhatsApp support</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-[#FF6B1A] hover:bg-[#E55A0F] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} /> Return to Shop & Try Again
          </Link>
          <a
            href="https://wa.me/447723217812?text=Hello%2C%20I%20had%20an%20issue%20with%20credit%20card%20checkout"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle size={16} /> Chat on WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}
