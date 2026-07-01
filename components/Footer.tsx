"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Simulate submission delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setEmail("");
    }, 1200);
  };

  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8 border-t border-[#1D4ED8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="bg-[#1E293B]/60 border border-[#334155] rounded-2xl p-6 md:p-10 mb-16 shadow-lg backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="inline-block text-xs font-bold tracking-widest text-[#FF6B1A] uppercase bg-[#FF6B1A]/10 px-3 py-1 rounded-full border border-[#FF6B1A]/20">
                Research Updates
              </span>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">
                Get HPLC Batch Testing & Stock Alerts
              </h3>
              <p className="text-[#94A3B8] text-sm md:text-base max-w-xl leading-relaxed">
                Stay updated with raw data reports, independent lab verification documents, and priority alerts when premium stock is replenished.
              </p>
            </div>
            
            <div className="lg:col-span-5">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] w-5 h-5" />
                    <input
                      type="email"
                      required
                      placeholder="Enter researcher or academic email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0F172A] border border-[#475569] focus:border-[#2563EB] text-white placeholder-[#64748B] rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none transition-all focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/50 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg focus:outline-none"
                  >
                    {isLoading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Subscribe to Reports
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-center lg:text-left text-[11px] text-[#64748B] leading-normal">
                    By subscribing, you agree to receive research reports. Unsubscribe at any time.
                  </p>
                </form>
              ) : (
                <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-6 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#10B981]/20 text-[#10B981] mb-1">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-bold text-lg">Subscription Confirmed</h4>
                  <p className="text-[#94A3B8] text-xs max-w-sm mx-auto leading-relaxed">
                    You have been subscribed to RETA LAB UK updates. Purity reports will be sent directly to your inbox upon publication.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
                  >
                    Sign up another email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/logo.png" alt="Reta Lab UK Logo" width={40} height={40} className="object-contain" priority referrerPolicy="no-referrer" />
              <h3 className="font-heading font-bold text-xl">RETA LAB UK</h3>
            </div>
            <p className="text-[#CBD5E1] text-sm mb-4">
              UK&apos;s Most Trusted Research Peptide Wholesaler and Retailer. Elevating global research standards.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 text-[#EEF2F7]">Products</h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li><Link href="/products" className="hover:text-white transition-colors">All Peptides</Link></li>
              <li><Link href="/products/retatrutide-10mg" className="hover:text-white transition-colors">Retatrutide</Link></li>
              <li><Link href="/products/tirzepatide-15mg" className="hover:text-white transition-colors">Tirzepatide</Link></li>
              <li><Link href="/products/semaglutide-10mg" className="hover:text-white transition-colors">Semaglutide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 text-[#EEF2F7]">Research</h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li><Link href="/blog/where-to-buy-retatrutide-uk" className="hover:text-white transition-colors">Buying Guide</Link></li>
              <li><Link href="/blog/retatrutide-vs-tirzepatide-uk" className="hover:text-white transition-colors">Reta vs Tirz</Link></li>
              <li><Link href="/coa" className="hover:text-white transition-colors">Certificates of Analysis</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold mb-4 text-[#EEF2F7]">Company</h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[rgba(255,255,255,0.1)] text-xs text-[#CBD5E1] text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {currentYear} RETA LAB UK. All rights reserved.</p>
          <p className="mt-4 md:mt-0 font-medium text-[rgba(255,255,255,0.5)]">
            We ship to The UK, Europe, Australia and Ireland. All products are approved for human use.
          </p>
        </div>
      </div>
    </footer>
  );
}
