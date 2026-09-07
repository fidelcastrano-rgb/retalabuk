"use client";

import { useOrder } from "./OrderContext";
import { 
  X, 
  Minus, 
  Plus, 
  MessageCircle, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  Loader2 
} from "lucide-react";
import { useState } from "react";

export function OrderBuilder() {
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
    discountMessage, 
    removeItem, 
    updateQuantity, 
    clearOrder, 
    whatsappNumber, 
    getMinQtyForVariant 
  } = useOrder();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    shipping: "UK",
    payment: "Credit Card"
  });

  if (totalItems === 0) return null;

  const isCreditCard = formData.payment === "Credit Card";
  const isCrypto = formData.payment.toLowerCase().includes("crypto") ||
                   formData.payment.toLowerCase().includes("usdt") ||
                   formData.payment.toLowerCase().includes("bitcoin") ||
                   formData.payment.toLowerCase().includes("ether");

  // 10% discount for any crypto payment method
  const cryptoDiscountAmount = isCrypto ? Number((finalSubtotal * 0.10).toFixed(2)) : 0;
  const subtotalAfterCrypto = Math.max(0, finalSubtotal - cryptoDiscountAmount);

  const shippingFee = appliedCoupon?.freeShipping ? 0 : 9.99;
  const finalPrice = subtotalAfterCrypto + shippingFee;

  // Maximum card transaction limit is £350
  const isCardAboveMax = isCreditCard && finalPrice > 350;
  // Minimum £100 only applies to manual alternative options (Bank Transfer/Skrill)
  const isBelowMin = !isCrypto && !isCreditCard && finalSubtotal < 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (cardError) setCardError(null);
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

  const generateMessage = () => {
    const orderItems = items.map(item => `${item.qty}x ${item.name} (${item.variant}) - £${(item.price * item.qty).toFixed(2)}`).join("\n");
    let msg = `New Order from ${formData.name || "Customer"}\n\nOrder Details:\n${orderItems}\n\nSubtotal: £${subtotalPrice.toFixed(2)}\n`;
    if (discountAmount > 0) {
      msg += `Volume Discount (${discountPercentage}%): -£${discountAmount.toFixed(2)}\n`;
    }
    if (appliedCoupon && couponDiscountAmount > 0) {
      msg += `Coupon Code (${appliedCoupon.code}): -£${couponDiscountAmount.toFixed(2)}\n`;
    }
    if (isCrypto && cryptoDiscountAmount > 0) {
      msg += `Crypto Payment Discount (10% OFF): -£${cryptoDiscountAmount.toFixed(2)}\n`;
    }
    msg += `Final Subtotal: £${subtotalAfterCrypto.toFixed(2)}\nShipping Fee (${formData.shipping}): £${shippingFee.toFixed(2)}\nTotal to Pay: £${finalPrice.toFixed(2)}\n\nCustomer Details:\nName: ${formData.name || "Not provided"}\nEmail: ${formData.email || "Not provided"}\nPhone: ${formData.phone || "Not provided"}\nShipping Option: ${formData.shipping}\nAddress: ${formData.address ? formData.address.replace(/\n/g, ", ") : "Not provided"}\nPayment Method: ${formData.payment}${isCrypto ? " (10% Crypto Discount Applied)" : ""}\n\nPlease confirm receipt of this order.`;
    return msg;
  };

  const dispatchOrderNotification = (channel: string) => {
    if (!formData.name?.trim() && !formData.email?.trim()) return;
    const ref = `RETA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    fetch("/api/checkout/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: ref,
        customer: {
          name: formData.name.trim() || "Customer",
          email: formData.email.trim() || "",
          phone: formData.phone.trim() || "",
          address: formData.address.trim() || "",
        },
        items: items.map(i => ({
          name: i.name,
          variant: i.variant,
          qty: i.qty,
          price: i.price,
        })),
        pricing: {
          totalGBP: finalPrice.toFixed(2),
          subtotalGBP: subtotalPrice.toFixed(2),
          cryptoDiscountGBP: cryptoDiscountAmount > 0 ? cryptoDiscountAmount.toFixed(2) : undefined,
          discountGBP: discountAmount > 0 ? discountAmount.toFixed(2) : undefined,
          couponDiscountGBP: couponDiscountAmount > 0 ? couponDiscountAmount.toFixed(2) : undefined,
          shippingGBP: shippingFee.toFixed(2),
        },
        paymentMethod: `${formData.payment} (${channel})`,
        shipping: formData.shipping,
      }),
    }).catch(err => console.error("Error dispatching order notification:", err));
  };

  const handleWA = () => {
    dispatchOrderNotification("WhatsApp Order");
    const text = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  const handleEmail = () => {
    dispatchOrderNotification("Direct Email Order");
    const text = encodeURIComponent(generateMessage());
    window.open(`mailto:sales@reta-lab.co.uk?subject=New Order Enquiry&body=${text}`);
  };

  const handleCardCheckout = async () => {
    setCardError(null);

    if (!formData.name.trim()) {
      setCardError("Please enter your full name for delivery.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setCardError("Please enter a valid email address for your payment receipt.");
      return;
    }
    if (!formData.address.trim()) {
      setCardError("Please enter your shipping address.");
      return;
    }
    if (isCardAboveMax) {
      setCardError("Card payments are limited to £350 maximum. Please select Crypto (10% OFF) or Bank Transfer.");
      return;
    }

    try {
      setCardLoading(true);

      const payload = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone ? formData.phone.trim() : undefined,
        },
        shipping: {
          region: formData.shipping,
          address: formData.address.trim(),
        },
        pricing: {
          totalGBP: finalPrice.toFixed(2),
          subtotalGBP: subtotalAfterCrypto.toFixed(2),
          shippingGBP: shippingFee.toFixed(2),
        },
        items: items.map(i => ({
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
        throw new Error(data.error || "Card checkout failed. Please verify your details or try again.");
      }

      // Save order snapshot locally so the return page can recover details even before webhooks
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "reta_last_order",
            JSON.stringify({
              checkout_id: data.checkout_id,
              reference: data.reference,
              customer: formData,
              items,
              totalGBP: finalPrice.toFixed(2),
              totalUSD: data.totalUSD,
              shipping: formData.shipping,
              createdAt: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.warn("Could not write order backup to localStorage", e);
        }
      }

      // Redirect user directly to Bachs secure hosted card payment page
      window.location.href = data.checkout_url;
    } catch (err: any) {
      console.error("Card checkout error:", err);
      setCardError(err.message || "An unexpected error occurred. Please try again.");
      setCardLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[#1D4ED8] text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 cursor-pointer hover:bg-opacity-90 transition-all font-heading" onClick={() => setIsMinimized(false)}>
        <div className="flex items-center gap-2">
          <span className="font-bold">Your Order ({totalItems} items - £{finalPrice.toFixed(2)})</span>
          {isCreditCard && (
            <span className="bg-[#10B981] text-[10px] px-2 py-0.5 rounded font-sans font-bold uppercase tracking-wider text-white flex items-center gap-1">
              <CreditCard size={11} /> Card Ready
            </span>
          )}
          {isCrypto && (
            <span className="bg-[#10B981] text-[10px] px-2 py-0.5 rounded font-sans font-bold uppercase tracking-wider text-white">
              10% Crypto OFF
            </span>
          )}
        </div>
        <ChevronUp size={20} />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
      {/* Header */}
      <div className="bg-[#1E293B] p-3 border-b border-[#334155] flex justify-between items-center">
        <div>
          <h3 className="font-bold font-heading text-sm">Wholesale Order Builder</h3>
          <span className="text-xs text-[#94A3B8]">{totalItems} items selected</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(true)} className="text-[#94A3B8] hover:text-white p-1 cursor-pointer">
            <ChevronDown size={18} />
          </button>
          <button onClick={clearOrder} className="text-[#94A3B8] hover:text-rose-400 p-1 text-xs cursor-pointer">
            Clear
          </button>
        </div>
      </div>

      {/* Discount banner */}
      <div className="bg-[#1D4ED8]/20 border-b border-[#1D4ED8]/30 px-3 py-1.5 text-xs text-[#60A5FA] flex items-center justify-between">
        <span>{discountMessage}</span>
        {discountPercentage > 0 && <span className="font-bold">Save {discountPercentage}%</span>}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {items.map(item => {
          const minQty = getMinQtyForVariant(item.variant);
          return (
            <div key={item.key} className="bg-[#1E293B] p-2.5 rounded border border-[#334155] flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{item.name}</h4>
                  <div className="text-xs text-[#94A3B8]">{item.variant}</div>
                  <div className="text-xs text-[#10B981] font-mono">£{item.price.toFixed(2)} each</div>
                </div>
                <button onClick={() => removeItem(item.key)} className="text-[#94A3B8] hover:text-rose-400 p-1 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 bg-[#0F172A] border border-[#334155] rounded px-2 py-0.5">
                  <button 
                    onClick={() => updateQuantity(item.key, item.qty - 1)}
                    disabled={item.qty <= minQty}
                    className="text-[#94A3B8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-mono font-bold w-6 text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQuantity(item.key, item.qty + 1)}
                    className="text-[#94A3B8] hover:text-white cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="text-sm font-bold font-mono">
                  £{(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Customer Details Form */}
        <div className="border-t border-[#334155] pt-3 space-y-2">
          <h4 className="text-xs font-bold text-[#CBD5E1] uppercase tracking-wider">Delivery Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#2563EB]" />
            <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone (Optional)" className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#2563EB]" />
          </div>
          <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]" />
          <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Shipping Address (Street, City, Postcode, Country)" rows={2} className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB] resize-none" />
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[#CBD5E1] mb-1 block">Shipping Region</label>
              <select name="shipping" value={formData.shipping} onChange={handleInputChange} className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#2563EB]">
                <option value="UK">The UK</option>
                <option value="Europe">Europe</option>
                <option value="Australia">Australia</option>
                <option value="Ireland">Ireland</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#CBD5E1] mb-1 block font-semibold text-white flex items-center justify-between">
                <span>Payment Method</span>
                {isCreditCard && <span className="text-[#10B981] text-[10px] font-bold">Instant SSL</span>}
                {isCrypto && <span className="text-[#10B981] text-[10px] font-bold">10% OFF</span>}
              </label>
              <select name="payment" value={formData.payment} onChange={handleInputChange} className="w-full bg-[#1E293B] border border-[#3B82F6] rounded px-3 py-1.5 text-sm text-white font-medium focus:outline-none focus:border-[#60A5FA]">
                <option value="Credit Card">💳 Credit / Debit Card (Visa, Mastercard, Apple Pay)</option>
                <option value="Crypto (USDT)">🪙 USDT (TRC20 / ERC20) — 10% OFF</option>
                <option value="Crypto (Bitcoin)">🪙 Bitcoin (BTC) — 10% OFF</option>
                <option value="Crypto (ETHER)">🪙 Ethereum (ETH) — 10% OFF</option>
                <option value="Bank Transfer">Bank Transfer (UK BACS)</option>
                <option value="Skrill">Skrill</option>
              </select>
            </div>
          </div>

          {/* Credit Card Processing Banner */}
          {isCreditCard && (
            <div className="mt-1">
              {isCardAboveMax ? (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-lg p-2.5 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={15} />
                  <div>
                    <span className="font-bold text-amber-300 block">Card Payment Limit: £350</span>
                    <span className="text-[11px] text-[#CBD5E1] block mt-0.5">
                      Card gateway limit is £350. Please switch payment to <strong>Crypto (10% OFF)</strong> or <strong>Bank Transfer</strong> for larger orders.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-2.5 text-xs text-[#A7F3D0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#10B981] shrink-0" />
                    <span>Visa, Mastercard & Apple Pay accepted</span>
                  </div>
                  <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded font-mono font-bold">256-BIT SSL</span>
                </div>
              )}
            </div>
          )}

          {/* Crypto Discount Notification Banner */}
          {isCrypto && (
            <div className="bg-[#10B981]/15 border border-[#10B981]/40 rounded-lg p-2.5 text-xs text-[#A7F3D0] flex items-center gap-2">
              <Sparkles size={16} className="shrink-0 text-[#10B981]" />
              <div>
                <span className="font-bold text-[#10B981]">10% Crypto Discount Applied!</span>
                <span className="block text-[11px] text-[#CBD5E1]">You save £{cryptoDiscountAmount.toFixed(2)} on your order by paying with crypto.</span>
              </div>
            </div>
          )}

          {!isCrypto && !isCreditCard && (
            <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-2 text-[11px] text-[#94A3B8] flex items-center gap-1.5">
              <span>💡</span>
              <span>Tip: Pay with <strong>Credit Card</strong> for instant checkout, or <strong>Crypto</strong> for <strong>10% discount</strong>!</span>
            </div>
          )}

          {/* Coupon Code Section */}
          <div className="pt-2 border-t border-[#475569]">
            <label className="text-xs font-bold text-[#CBD5E1] mb-1.5 flex items-center gap-1">
              <Tag size={12} className="text-[#FF6B1A]" /> Have a Coupon Code?
            </label>
            {appliedCoupon ? (
              <div className="bg-[#10B981]/15 border border-[#10B981]/40 rounded p-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#10B981]">{appliedCoupon.code}</span>
                  <span className="text-[#CBD5E1] ml-2">({appliedCoupon.description})</span>
                </div>
                <button 
                  type="button" 
                  onClick={handleRemoveCoupon} 
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold ml-2 underline cursor-pointer"
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
                  placeholder="Enter code (e.g. RETA10)" 
                  className="flex-1 bg-[#1E293B] border border-[#475569] rounded px-3 py-1.5 text-xs text-white uppercase placeholder:normal-case focus:outline-none focus:border-[#2563EB]"
                />
                <button 
                  type="submit" 
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}
            {couponFeedback && !appliedCoupon && (
              <p className={`text-[11px] mt-1 ${couponFeedback.success ? "text-[#10B981]" : "text-rose-400"}`}>
                {couponFeedback.text}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 bg-[#0F172A] border-t border-[#475569]">
        {isBelowMin && (
          <div className="bg-amber-500/10 text-amber-300 text-xs p-2 rounded border border-amber-500/30 text-center font-medium mb-3 animate-pulse">
            ⚠️ Minimum order is £100 for manual options. Please select Crypto or add more items.
          </div>
        )}
        
        {discountAmount > 0 && (
          <>
            <div className="flex justify-between items-center text-sm text-[#CBD5E1] mb-1">
              <span>Original Subtotal:</span>
              <span className="line-through">£{subtotalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-[#10B981] font-bold mb-1">
              <span>Volume Discount ({discountPercentage}%):</span>
              <span>-£{discountAmount.toFixed(2)}</span>
            </div>
          </>
        )}

        {appliedCoupon && couponDiscountAmount > 0 && (
          <div className="flex justify-between items-center text-sm text-[#10B981] font-bold mb-1">
            <span>Coupon ({appliedCoupon.code}):</span>
            <span>-£{couponDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        {isCrypto && cryptoDiscountAmount > 0 && (
          <div className="flex justify-between items-center text-sm text-[#10B981] font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="shrink-0 text-[#10B981]" /> Crypto Discount (10%):
            </span>
            <span>-£{cryptoDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-[#CBD5E1] mb-1">
          <span>Subtotal:</span>
          <span>£{subtotalAfterCrypto.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-[#CBD5E1] mb-2 border-b border-[#475569] pb-2">
          <span>Shipping ({formData.shipping}):</span>
          <span>
            {shippingFee === 0 ? (
              <span className="text-[#10B981] font-bold">FREE</span>
            ) : (
              `£${shippingFee.toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex justify-between items-center font-bold font-heading mb-3 text-lg">
          <span>Total to Pay:</span>
          <span className="text-[#10B981]">£{finalPrice.toFixed(2)}</span>
        </div>

        {cardError && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs p-2.5 rounded-lg text-center mb-2.5">
            {cardError}
          </div>
        )}

        {isCreditCard ? (
          <div>
            {isCardAboveMax ? (
              <div className="bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs p-2.5 rounded-lg text-center font-medium mb-2.5">
                ⚠️ Total exceeds £350 card limit. Please select <strong>Crypto (10% OFF)</strong> or <strong>Bank Transfer</strong>.
              </div>
            ) : (
              <button 
                onClick={handleCardCheckout}
                disabled={cardLoading}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-2 font-heading"
              >
                {cardLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Connecting to Secure Card Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Pay with Credit Card (£{finalPrice.toFixed(2)})</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-[#94A3B8]">
              <span>Or order manually:</span>
              <button onClick={handleWA} className="text-[#FF6B1A] hover:underline cursor-pointer flex items-center gap-1 font-medium">
                <MessageCircle size={13} /> WhatsApp
              </button>
              <span>•</span>
              <button onClick={handleEmail} className="text-[#CBD5E1] hover:underline cursor-pointer flex items-center gap-1 font-medium">
                <Mail size={13} /> Email
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={handleWA}
              disabled={isBelowMin}
              className={`flex-1 text-white py-2.5 rounded font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                isBelowMin ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60" : "bg-[#FF6B1A] hover:bg-opacity-90 cursor-pointer shadow-md"
              }`}
            >
              <MessageCircle size={18} />
              Order via WhatsApp
            </button>
            
            <button 
              onClick={handleEmail}
              disabled={isBelowMin}
              className={`flex-1 bg-transparent border py-2.5 rounded font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                isBelowMin 
                  ? "border-slate-700 text-slate-500 cursor-not-allowed opacity-60" 
                  : "border-[#CBD5E1] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] cursor-pointer shadow-md"
              }`}
            >
              <Mail size={18} />
              Order via Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
