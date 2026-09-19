"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Coins, 
  Building2, 
  Truck, 
  Check,
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Tag, 
  Sparkles, 
  Trash2, 
  Plus, 
  Minus, 
  Mail, 
  MessageCircle,
  FileCheck
} from "lucide-react";
import { useOrder } from "@/components/OrderContext";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    totalPrice: subtotalPrice,
    discountPercentage,
    discountAmount,
    appliedCoupon,
    couponDiscountAmount,
    applyCouponCode,
    removeCoupon,
    finalSubtotal,
    removeItem,
    updateQuantity,
    clearOrder,
    getMinQtyForVariant,
    whatsappNumber,
  } = useOrder();

  const [formData, setFormData] = useState(() => {
    const initial = {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postcode: "",
      shippingRegion: "UK",
      notes: "",
    };
    if (typeof window !== "undefined") {
      try {
        const savedOrder = localStorage.getItem("reta_last_order");
        if (savedOrder) {
          const parsed = JSON.parse(savedOrder);
          if (parsed.customer) {
            return {
              ...initial,
              name: parsed.customer.name || "",
              email: parsed.customer.email || "",
              phone: parsed.customer.phone || "",
              address: parsed.customer.address || "",
              shippingRegion: parsed.customer.shipping || "UK",
            };
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return initial;
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "crypto">("card");
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const isCreditCard = paymentMethod === "card";
  const isCrypto = paymentMethod === "crypto";
  const isBank = paymentMethod === "bank";

  // 10% instant discount for cryptocurrency payments
  const cryptoDiscountAmount = isCrypto ? Number((finalSubtotal * 0.10).toFixed(2)) : 0;
  const subtotalAfterCrypto = Math.max(0, finalSubtotal - cryptoDiscountAmount);

  const shippingFee = appliedCoupon?.freeShipping ? 0 : 9.99;
  const finalPrice = subtotalAfterCrypto + shippingFee;

  // Card limit: £350 maximum per transaction via Bachs gateway
  const isCardAboveMax = isCreditCard && finalPrice > 350;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyCouponCode(couponInput);
    setCouponFeedback({ success: result.success, text: result.message });
    if (result.success) {
      setCouponInput("");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name for laboratory delivery.");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address so we can send your order confirmation.");
      return false;
    }
    if (!formData.address.trim()) {
      setErrorMessage("Please enter your street delivery address.");
      return false;
    }
    if (!formData.city.trim()) {
      setErrorMessage("Please enter your city / town.");
      return false;
    }
    if (!formData.postcode.trim()) {
      setErrorMessage("Please enter your postcode or postal code.");
      return false;
    }
    if (isCardAboveMax) {
      setErrorMessage("Credit card payments are limited to £350 maximum per order. Please choose Bank Transfer or Cryptocurrency (10% OFF) for larger orders.");
      return false;
    }
    if (!acceptedTerms) {
      setErrorMessage("Please confirm that these products are purchased strictly for laboratory research.");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);

    const fullAddress = `${formData.address.trim()}, ${formData.city.trim()}, ${formData.postcode.trim()}${formData.notes.trim() ? ` (Notes: ${formData.notes.trim()})` : ""}`;
    const orderRef = `RETA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const paymentLabel = 
      isCreditCard ? "Credit / Debit Card (Bachs Gateway)" :
      isCrypto ? "Cryptocurrency (USDT / BTC) - 10% Discount" :
      isBank ? "Bank Transfer" :
      "Direct Research Inquiry";

    // 1. Snapshot payload for localStorage & email
    const orderSnapshot = {
      reference: orderRef,
      customer: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: fullAddress,
        shipping: formData.shippingRegion,
        payment: paymentLabel,
      },
      items: items.map((i) => ({
        name: i.name,
        variant: i.variant,
        qty: i.qty,
        price: i.price,
      })),
      pricing: {
        totalGBP: finalPrice.toFixed(2),
        subtotalGBP: subtotalPrice.toFixed(2),
        discountGBP: discountAmount > 0 ? discountAmount.toFixed(2) : undefined,
        couponDiscountGBP: couponDiscountAmount > 0 ? couponDiscountAmount.toFixed(2) : undefined,
        cryptoDiscountGBP: cryptoDiscountAmount > 0 ? cryptoDiscountAmount.toFixed(2) : undefined,
        shippingGBP: shippingFee.toFixed(2),
      },
      shipping: formData.shippingRegion,
      paymentMethod: paymentLabel,
      createdAt: new Date().toISOString(),
    };

    // Save order snapshot locally
    try {
      localStorage.setItem("reta_last_order", JSON.stringify(orderSnapshot));
    } catch (e) {
      console.warn("Could not save order snapshot to localStorage", e);
    }

    // 2. Process based on payment method:
    if (isCreditCard) {
      try {
        const payload = {
          customer: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || undefined,
          },
          shipping: {
            region: formData.shippingRegion,
            address: fullAddress,
          },
          pricing: {
            totalGBP: finalPrice.toFixed(2),
            subtotalGBP: subtotalAfterCrypto.toFixed(2),
            shippingGBP: shippingFee.toFixed(2),
          },
          items: items.map((i) => ({
            name: i.name,
            variant: i.variant,
            qty: i.qty,
            price: i.price,
          })),
          appUrl: typeof window !== "undefined" ? window.location.origin : undefined,
        };

        const res = await fetch("/api/checkout/bachs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.checkout_url) {
          throw new Error(
            data.error || "Card checkout failed to initialize. Please try again or choose Bank Transfer / Crypto."
          );
        }

        // Redirect customer to Bachs 256-bit encrypted checkout session
        window.location.href = data.checkout_url;
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMessage(err.message || "Unable to connect to card processor. Please try again.");
      }
    } else {
      // For non-card orders (Bank Transfer, Crypto):
      // Dispatch Zoho Mail notification to both customer and admin
      try {
        await fetch("/api/checkout/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: orderRef,
            customer: orderSnapshot.customer,
            items: orderSnapshot.items,
            pricing: orderSnapshot.pricing,
            paymentMethod: paymentLabel,
            shipping: formData.shippingRegion,
          }),
        });
      } catch (emailErr) {
        console.error("Order notification dispatch error:", emailErr);
      }

      // Clear current cart and redirect to success page with method parameter
      clearOrder();
      const methodParam = isCrypto ? "crypto" : "bank";
      router.push(`/checkout/success?ref=${orderRef}&method=${methodParam}`);
    }
  };

  // Empty Cart Screen
  if (totalItems === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-[#070C14] text-white">
        <div className="max-w-lg w-full bg-[#0F172A] border border-[#1E293B] rounded-2xl p-8 sm:p-10 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/30 flex items-center justify-center text-[#3B82F6] mx-auto mb-5">
            <ShoppingBag size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
            Your Research Cart is Empty
          </h1>
          <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
            You currently have no research compounds in your order builder. Select items from our verified peptide catalog to configure your order.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/products"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#FF6B1A] hover:bg-[#E55A0F] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg font-heading"
            >
              <ArrowLeft size={16} /> Explore Research Peptides
            </Link>
            <Link
              href="/coa"
              className="w-full inline-flex items-center justify-center gap-2 bg-transparent border border-[#334155] hover:border-[#64748B] text-[#CBD5E1] hover:text-white px-6 py-3 rounded-xl font-medium text-xs transition-colors"
            >
              <FileCheck size={15} /> View Independent Laboratory COAs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070C14] text-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#3B82F6] transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E293B] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  <ShieldCheck size={12} /> Encrypted Laboratory Checkout
                </span>
                <span className="hidden sm:inline-block text-xs text-[#64748B]">•</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Mail size={12} className="text-[#3B82F6]" /> Instant Dual Email Notification
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                Review & Place Research Order
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1 font-mono text-[#CBD5E1]">
                <Lock size={13} className="text-[#10B981]" /> 256-Bit SSL
              </span>
              <span>•</span>
              <span>Next-Day UK Dispatch</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Form (7 cols), Right Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Customer & Delivery Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Contact Information */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1E293B]">
                <div className="w-7 h-7 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-xs font-bold text-[#3B82F6]">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold font-heading text-white">
                    Contact Information
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Your order receipt and batch tracking will be dispatched to this address.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                    Full Name / Researcher Name <span className="text-[#FF6B1A]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Alexander Scott"
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                      Email Address <span className="text-[#FF6B1A]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="alexander@research.ox.ac.uk"
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                    <span className="block text-[11px] text-[#64748B] mt-1">
                      Order confirmation & PDF invoice sent here.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+44 7700 900123"
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                    <span className="block text-[11px] text-[#64748B] mt-1">
                      For courier SMS delivery notifications.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping & Laboratory Delivery Address */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1E293B]">
                <div className="w-7 h-7 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-xs font-bold text-[#3B82F6]">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold font-heading text-white">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Shipped in sterile temperature-controlled insulated packaging.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                    Shipping Region
                  </label>
                  <select
                    name="shippingRegion"
                    value={formData.shippingRegion}
                    onChange={handleInputChange}
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                  >
                    <option value="UK">The United Kingdom (Royal Mail Special Delivery / Tracked 24)</option>
                    <option value="Europe">Europe (DHL / DPD Priority Express)</option>
                    <option value="Australia">Australia (Express Courier International)</option>
                    <option value="Ireland">Ireland (An Post / Royal Mail Express)</option>
                    <option value="International">Rest of World (Tracked Air Express)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                    Street Address / Laboratory Suite <span className="text-[#FF6B1A]">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Unit 4, Oxford BioEscalator, Innovation Way"
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                      Town / City <span className="text-[#FF6B1A]">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Oxford"
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                      Postcode / Postal Code <span className="text-[#FF6B1A]">*</span>
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      placeholder="e.g. OX3 7FZ"
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                    Delivery Notes / Lab Access Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g. Leave with reception or secure laboratory parcel locker"
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3.5 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1E293B]">
                <div className="w-7 h-7 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-xs font-bold text-[#3B82F6]">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold font-heading text-white">
                    Select Payment Method
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    Choose your preferred secure payment method below.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                
                {/* Method 1: Credit / Debit Card */}
                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    isCreditCard
                      ? "bg-[#1E293B] border-[#3B82F6] ring-1 ring-[#3B82F6]"
                      : "bg-[#0B1120] border-[#1E293B] hover:border-[#334155]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={isCreditCard}
                    onChange={() => setPaymentMethod("card")}
                    className="mt-1 text-[#3B82F6] focus:ring-[#3B82F6]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-[#3B82F6]" />
                        <span className="text-sm font-bold text-white">Credit / Debit Card</span>
                      </div>
                      <span className="text-[10px] bg-[#3B82F6]/20 text-[#60A5FA] px-2 py-0.5 rounded font-mono font-bold">
                        INSTANT
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Pay securely with Visa, Mastercard, or Apple Pay via 256-bit encrypted checkout. (Max £350 per transaction).
                    </p>
                    {isCardAboveMax && (
                      <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0 text-amber-400" />
                        <span>Order total (£{finalPrice.toFixed(2)}) exceeds the £350 card limit. Please select Bank Transfer or Cryptocurrency (10% OFF).</span>
                      </div>
                    )}
                  </div>
                </label>

                {/* Method 2: Bank Transfer */}
                <label
                  onClick={() => setPaymentMethod("bank")}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    isBank
                      ? "bg-[#1E293B] border-[#3B82F6] ring-1 ring-[#3B82F6]"
                      : "bg-[#0B1120] border-[#1E293B] hover:border-[#334155]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={isBank}
                    onChange={() => setPaymentMethod("bank")}
                    className="mt-1 text-[#3B82F6] focus:ring-[#3B82F6]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-[#93C5FD]" />
                        <span className="text-sm font-bold text-white">Bank Transfer</span>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] border border-[#334155] px-1.5 py-0.5 rounded">
                        UK Accounts
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Direct invoice with bank sort code & account number sent directly to your email address.
                    </p>
                  </div>
                </label>

                {/* Method 3: Cryptocurrency (10% Discount) */}
                <label
                  onClick={() => setPaymentMethod("crypto")}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    isCrypto
                      ? "bg-[#1E293B] border-[#10B981] ring-1 ring-[#10B981]"
                      : "bg-[#0B1120] border-[#1E293B] hover:border-[#334155]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={isCrypto}
                    onChange={() => setPaymentMethod("crypto")}
                    className="mt-1 text-[#10B981] focus:ring-[#10B981]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins size={18} className="text-[#10B981]" />
                        <span className="text-sm font-bold text-white">Cryptocurrency (USDT / BTC / ETH)</span>
                      </div>
                      <span className="text-[10px] bg-[#10B981] text-[#070C14] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={11} /> 10% OFF
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Save an extra 10% on your entire order. Wallet transfer instructions provided upon order placement and sent to your email.
                    </p>
                    {isCrypto && (
                      <div className="mt-2 text-xs font-semibold text-[#10B981] flex items-center gap-1">
                        <Check size={14} /> 10% Crypto discount (-£{cryptoDiscountAmount.toFixed(2)}) applied to total!
                      </div>
                    )}
                  </div>
                </label>

              </div>
            </div>

            {/* Research Compliance Checkbox */}
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 text-xs text-[#94A3B8] flex items-start gap-3">
              <input
                type="checkbox"
                id="research-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 text-[#3B82F6] rounded focus:ring-0 cursor-pointer"
              />
              <label htmlFor="research-terms" className="cursor-pointer select-none leading-relaxed">
                I acknowledge that all compounds purchased from RETA LAB UK are intended for <strong className="text-white">human consumption</strong> and therapeutic use.
              </label>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-4 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Place Order CTA Button */}
            <div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || isCardAboveMax}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all text-base shadow-[0_0_25px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed font-heading cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{isCreditCard ? "Connecting to Secure Card Gateway..." : "Transmitting Order & Dispatching Notifications..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>
                      {isCreditCard
                        ? `Proceed to Card Payment • £${finalPrice.toFixed(2)}`
                        : isCrypto
                        ? `Confirm & Place Order (10% OFF) • £${finalPrice.toFixed(2)}`
                        : `Place Order & Receive Invoice • £${finalPrice.toFixed(2)}`}
                    </span>
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#10B981]" /> Dual Zoho Mail Alert
                </span>
                <span>•</span>
                <span>Tracked Royal Mail Dispatch</span>
                <span>•</span>
                <span>Dedicated Support</span>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Item Adjustments (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1E293B]">
                <h3 className="font-bold font-heading text-base text-white">
                  Order Summary
                </h3>
                <span className="text-xs text-[#94A3B8] font-mono">
                  {totalItems} items
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#1E293B] max-h-80 overflow-y-auto pr-1 mb-4 space-y-3">
                {items.map((item) => {
                  const minQty = getMinQtyForVariant(item.variant);
                  return (
                    <div key={item.key} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white leading-tight">
                          {item.name}
                        </h4>
                        <div className="text-xs text-[#94A3B8] mt-0.5">
                          {item.variant}
                        </div>
                        <div className="text-xs text-[#10B981] font-mono mt-0.5">
                          £{item.price.toFixed(2)} each
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5 bg-[#1E293B] border border-[#334155] rounded px-2 py-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, item.qty - 1)}
                              disabled={item.qty <= minQty}
                              className="text-[#94A3B8] hover:text-white disabled:opacity-30 cursor-pointer p-0.5"
                              title="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-mono font-bold w-5 text-center text-white">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, item.qty + 1)}
                              className="text-[#94A3B8] hover:text-white cursor-pointer p-0.5"
                              title="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="text-[#94A3B8] hover:text-rose-400 p-1 text-xs cursor-pointer flex items-center gap-0.5 transition-colors"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-white">
                          £{(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code Input */}
              <div className="border-t border-[#1E293B] pt-4 mb-4">
                <label className="text-xs font-semibold text-[#CBD5E1] mb-1.5 flex items-center gap-1">
                  <Tag size={12} className="text-[#FF6B1A]" /> Have a Promotional Code?
                </label>
                {appliedCoupon ? (
                  <div className="bg-[#10B981]/15 border border-[#10B981]/40 rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#10B981]">{appliedCoupon.code}</span>
                      <span className="text-[#CBD5E1] ml-2">({appliedCoupon.description})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. RETA10"
                      className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-xs text-white uppercase placeholder:normal-case focus:outline-none focus:border-[#3B82F6]"
                    />
                    <button
                      type="submit"
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponFeedback && !appliedCoupon && (
                  <p className={`text-[11px] mt-1.5 ${couponFeedback.success ? "text-[#10B981]" : "text-rose-400"}`}>
                    {couponFeedback.text}
                  </p>
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="border-t border-[#1E293B] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Original Items Subtotal:</span>
                  <span className="font-mono text-white">£{subtotalPrice.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#10B981] font-medium">
                    <span>Wholesale Volume Discount ({discountPercentage}%):</span>
                    <span className="font-mono">-£{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {appliedCoupon && couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-[#10B981] font-medium">
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                    <span className="font-mono">-£{couponDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                {isCrypto && cryptoDiscountAmount > 0 && (
                  <div className="flex justify-between text-[#10B981] font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} /> Crypto Payment Savings (10%):
                    </span>
                    <span className="font-mono">-£{cryptoDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#94A3B8]">
                  <span>Cold-Chain Insulated Shipping:</span>
                  <span className="font-mono text-white">
                    {shippingFee === 0 ? (
                      <span className="text-[#10B981] font-bold">FREE</span>
                    ) : (
                      `£${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="border-t border-[#334155] pt-3 mt-2 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold font-heading text-white block">
                      Total Due:
                    </span>
                    <span className="text-[11px] text-[#94A3B8]">
                      Includes all taxes & laboratory packaging
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-heading text-[#10B981] font-mono block">
                      £{finalPrice.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      (approx. ${(finalPrice * 1.30).toFixed(2)} USD)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust and Verification Card */}
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 space-y-2.5 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Truck size={15} className="text-[#3B82F6]" />
                <span>Priority Logistics Information</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Orders placed before 2:00 PM GMT ship same-day from our UK distribution hub via Royal Mail Special Delivery Guaranteed by 1:00 PM.
              </p>
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
                <span className="text-[#CBD5E1]">Questions or PO requests?</span>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B82F6] hover:underline font-medium"
                >
                  Chat with Support
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

