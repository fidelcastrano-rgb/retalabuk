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
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function OrderBuilder() {
  const pathname = usePathname();
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

  // If user is already on the dedicated checkout or confirmation page, hide the floating builder
  if (pathname && (pathname === "/checkout" || pathname.startsWith("/checkout/"))) {
    return null;
  }

  if (totalItems === 0) return null;

  const shippingFee = appliedCoupon?.freeShipping ? 0 : 9.99;
  const finalPrice = finalSubtotal + shippingFee;

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

  const handleWAQuick = () => {
    const orderItems = items.map(item => `${item.qty}x ${item.name} (${item.variant}) - £${(item.price * item.qty).toFixed(2)}`).join("\n");
    const msg = `Hello RETA LAB UK, I would like to order the following research compounds:\n\n${orderItems}\n\nSubtotal: £${subtotalPrice.toFixed(2)}\nTotal: £${finalPrice.toFixed(2)}\n\nPlease assist with order dispatch.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleEmailQuick = () => {
    const orderItems = items.map(item => `${item.qty}x ${item.name} (${item.variant}) - £${(item.price * item.qty).toFixed(2)}`).join("\n");
    const msg = `Hello RETA LAB UK,\n\nI would like to order the following research compounds:\n\n${orderItems}\n\nSubtotal: £${subtotalPrice.toFixed(2)}\nTotal: £${finalPrice.toFixed(2)}\n\nPlease assist with order dispatch.`;
    window.open(`mailto:sales@reta-lab.co.uk?subject=Research Order Inquiry&body=${encodeURIComponent(msg)}`);
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-[#3B82F6]/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-[#3B82F6] transition-all font-heading backdrop-blur-md"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#3B82F6]">
            <ShoppingBag size={16} />
          </div>
          <div>
            <div className="font-bold text-xs flex items-center gap-1.5">
              <span>Your Cart ({totalItems} items)</span>
              <span className="text-[#10B981] font-mono">£{finalPrice.toFixed(2)}</span>
            </div>
            <span className="text-[10px] text-[#94A3B8]">Click to review or checkout</span>
          </div>
        </div>
        <ChevronUp size={18} className="text-[#94A3B8]" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
      {/* Header */}
      <div className="bg-[#1E293B] p-3.5 border-b border-[#334155] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#3B82F6]">
            <ShoppingBag size={15} />
          </div>
          <div>
            <h3 className="font-bold font-heading text-sm text-white">Research Cart</h3>
            <span className="text-xs text-[#94A3B8]">{totalItems} items selected</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(true)} 
            className="text-[#94A3B8] hover:text-white p-1 cursor-pointer transition-colors"
            title="Minimize"
          >
            <ChevronDown size={18} />
          </button>
          <button 
            onClick={clearOrder} 
            className="text-[#94A3B8] hover:text-rose-400 p-1 text-xs cursor-pointer transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Discount banner */}
      <div className="bg-[#1D4ED8]/20 border-b border-[#1D4ED8]/30 px-3 py-1.5 text-xs text-[#60A5FA] flex items-center justify-between">
        <span>{discountMessage}</span>
        {discountPercentage > 0 && <span className="font-bold text-[#10B981]">Save {discountPercentage}%</span>}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {items.map(item => {
          const minQty = getMinQtyForVariant(item.variant);
          return (
            <div key={item.key} className="bg-[#1E293B] p-2.5 rounded-xl border border-[#334155] flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <h4 className="text-sm font-semibold text-white leading-snug">{item.name}</h4>
                  <div className="text-xs text-[#94A3B8]">{item.variant}</div>
                  <div className="text-xs text-[#10B981] font-mono">£{item.price.toFixed(2)} each</div>
                </div>
                <button 
                  onClick={() => removeItem(item.key)} 
                  className="text-[#94A3B8] hover:text-rose-400 p-1 cursor-pointer transition-colors"
                  title="Remove item"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#334155]/60">
                <div className="flex items-center gap-2 bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-0.5">
                  <button 
                    onClick={() => updateQuantity(item.key, item.qty - 1)}
                    disabled={item.qty <= minQty}
                    className="text-[#94A3B8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-mono font-bold w-6 text-center text-white">{item.qty}</span>
                  <button 
                    onClick={() => updateQuantity(item.key, item.qty + 1)}
                    className="text-[#94A3B8] hover:text-white cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="text-sm font-bold font-mono text-white">
                  £{(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Coupon Code Section */}
        <div className="pt-2 border-t border-[#334155]">
          <label className="text-xs font-bold text-[#CBD5E1] mb-1.5 flex items-center gap-1">
            <Tag size={12} className="text-[#FF6B1A]" /> Have a Coupon Code?
          </label>
          {appliedCoupon ? (
            <div className="bg-[#10B981]/15 border border-[#10B981]/40 rounded-lg p-2 flex items-center justify-between text-xs">
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
                placeholder="e.g. RETA10" 
                className="flex-1 bg-[#1E293B] border border-[#475569] rounded-lg px-3 py-1.5 text-xs text-white uppercase placeholder:normal-case focus:outline-none focus:border-[#2563EB]"
              />
              <button 
                type="submit" 
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
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

        {/* Trust Note */}
        <div className="bg-[#1E293B]/60 border border-[#334155] rounded-lg p-2.5 text-[11px] text-[#94A3B8] flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#10B981] shrink-0" />
          <span>Complete delivery details & payment on our secure checkout page.</span>
        </div>
      </div>

      {/* Footer & Checkout CTA */}
      <div className="p-3.5 bg-[#0F172A] border-t border-[#334155]">
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-xs text-[#10B981] font-bold mb-1">
            <span>Volume Discount ({discountPercentage}%):</span>
            <span>-£{discountAmount.toFixed(2)}</span>
          </div>
        )}

        {appliedCoupon && couponDiscountAmount > 0 && (
          <div className="flex justify-between items-center text-xs text-[#10B981] font-bold mb-1">
            <span>Coupon ({appliedCoupon.code}):</span>
            <span>-£{couponDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-[#94A3B8] mb-1">
          <span>Subtotal:</span>
          <span className="font-mono text-white">£{finalSubtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-xs text-[#94A3B8] mb-2.5 border-b border-[#334155] pb-2">
          <span>Shipping (UK & Intl):</span>
          <span className="font-mono text-white">
            {shippingFee === 0 ? <span className="text-[#10B981] font-bold">FREE</span> : `£${shippingFee.toFixed(2)}`}
          </span>
        </div>

        <div className="flex justify-between items-center font-bold font-heading mb-3 text-base">
          <span>Total:</span>
          <span className="text-[#10B981] font-mono text-lg">£{finalPrice.toFixed(2)}</span>
        </div>

        {/* Primary CTA: Proceed to Dedicated Checkout Page */}
        <Link 
          href="/checkout"
          className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-[#10B981]/20 font-heading mb-2.5 cursor-pointer"
        >
          <ShoppingBag size={17} />
          <span>Proceed to Checkout</span>
          <ArrowRight size={15} />
        </Link>

        {/* Fast alternative ordering options */}
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-[#94A3B8]">
          <span>Quick order:</span>
          <button 
            onClick={handleWAQuick} 
            className="text-[#FF6B1A] hover:underline cursor-pointer flex items-center gap-1 font-medium"
          >
            <MessageCircle size={13} /> WhatsApp
          </button>
          <span>•</span>
          <button 
            onClick={handleEmailQuick} 
            className="text-[#CBD5E1] hover:underline cursor-pointer flex items-center gap-1 font-medium"
          >
            <Mail size={13} /> Direct Email
          </button>
        </div>
      </div>
    </div>
  );
}

