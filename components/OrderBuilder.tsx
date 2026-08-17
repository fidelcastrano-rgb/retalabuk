"use client";

import { useOrder } from "./OrderContext";
import { X, Minus, Plus, MessageCircle, Mail, ChevronDown, ChevronUp, Tag } from "lucide-react";
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    shipping: "UK",
    payment: "Crypto (Bitcoin)"
  });

  if (totalItems === 0) return null;

  const shippingFee = 9.99;
  const finalPrice = finalSubtotal + shippingFee;

  const isCrypto = formData.payment.toLowerCase().includes("crypto");
  const isBelowMin = !isCrypto && finalSubtotal < 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    msg += `Final Subtotal: £${finalSubtotal.toFixed(2)}\nShipping Fee (${formData.shipping}): £${shippingFee.toFixed(2)}\nTotal to Pay: £${finalPrice.toFixed(2)}\n\nCustomer Details:\nName: ${formData.name || "Not provided"}\nEmail: ${formData.email || "Not provided"}\nPhone: ${formData.phone || "Not provided"}\nShipping Option: ${formData.shipping}\nAddress: ${formData.address ? formData.address.replace(/\n/g, ", ") : "Not provided"}\nPayment Method: ${formData.payment}\n\nPlease confirm receipt of this order.`;
    return msg;
  };

  const handleWA = () => {
    const text = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  const handleEmail = () => {
    const text = encodeURIComponent(generateMessage());
    window.open(`mailto:sales@reta-lab.co.uk?subject=New Order Enquiry&body=${text}`);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[#1D4ED8] text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 cursor-pointer hover:bg-opacity-90 transition-all font-heading" onClick={() => setIsMinimized(false)}>
        <span className="font-bold">Your Order ({totalItems} items - £{finalPrice.toFixed(2)})</span>
        <ChevronUp size={20} />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-[#0F172A] border-t-4 border-[#FF6B1A] rounded-t-lg rounded-b shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-transform transform translate-y-0 text-white flex flex-col max-h-[85vh]">
      <div className="p-3 bg-[#1D4ED8] flex justify-between items-center text-white font-heading">
        <span className="font-bold">Your Order ({totalItems})</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(true)} className="text-white hover:text-[#CBD5E1] transition-colors cursor-pointer" aria-label="Minimize Order">
            <ChevronDown size={20} />
          </button>
          <button onClick={clearOrder} className="text-white hover:text-[#CBD5E1] transition-colors cursor-pointer" aria-label="Clear Order">
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-3 flex-1 overflow-y-auto space-y-4 bg-[#0F172A]">
        {/* Discount Motivation Message */}
        <div className="bg-[#1D4ED8]/20 border border-[#1D4ED8]/50 rounded p-2 text-center text-xs font-medium text-[#EEF2F7] flex items-center justify-center gap-2">
          <Tag size={14} className="text-[#FF6B1A]" />
          <span>{discountMessage}</span>
        </div>

        {items.map((item) => {
          const minQty = getMinQtyForVariant(item.variant);
          return (
            <div key={item.key} className="flex justify-between items-start border-b border-[#475569] pb-3 text-sm">
              <div className="flex-1">
                <div className="font-medium text-white">{item.name}</div>
                <div className="text-[#CBD5E1] text-xs mt-1">{item.variant}</div>
                {minQty > 1 && (
                  <div className="text-amber-400 text-[10px] font-bold mt-0.5">
                    ⚠️ Min. Qty of {minQty} ({minQty * (item.variant.includes("5x") ? 5 : 1)} Vials) applies
                  </div>
                )}
                <div className="font-bold mt-1 text-[#10B981]">£{(item.price * item.qty).toFixed(2)}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeItem(item.key)} className="text-[#FF6B1A] hover:text-white transition-colors cursor-pointer" aria-label="Remove item">
                   <X size={16} />
                </button>
                <div className="flex items-center gap-2 bg-[#EEF2F7] text-[#0F172A] rounded px-2 py-0.5 text-xs">
                  <button onClick={() => updateQuantity(item.key, item.qty - 1)} disabled={item.qty <= minQty} className="hover:text-[#FF6B1A] disabled:opacity-30 cursor-pointer"><Minus size={12} /></button>
                  <span className="font-bold w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQuantity(item.key, item.qty + 1)} className="hover:text-[#FF6B1A] cursor-pointer"><Plus size={12} /></button>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Checkout Form */}
        <div className="pt-2 space-y-3">
          <h3 className="font-heading font-bold text-[#EEF2F7] text-sm border-b border-[#475569] pb-1">Checkout Details</h3>
          <div className="grid grid-cols-2 gap-2">
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]" />
            <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]" />
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
              <label className="text-xs text-[#CBD5E1] mb-1 block">Payment Method</label>
              <select name="payment" value={formData.payment} onChange={handleInputChange} className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#2563EB]">
                <option value="Crypto (Bitcoin)">Bitcoin</option>
                <option value="Crypto (USDT)">USDT</option>
                <option value="Crypto (ETHER)">Ether</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Revolut">Revolut</option>
                <option value="Skrill">Skrill</option>
              </select>
            </div>
          </div>

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
            ⚠️ Minimum order is £100 for Bank Transfer, Revolut & Skrill. Select Crypto or add more items to proceed.
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
        <div className="flex justify-between items-center text-sm text-[#CBD5E1] mb-1">
          <span>Subtotal:</span>
          <span>£{finalSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-[#CBD5E1] mb-2 border-b border-[#475569] pb-2">
          <span>Shipping ({formData.shipping}):</span>
          <span>£{shippingFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center font-bold font-heading mb-3 text-lg">
          <span>Total to Pay:</span>
          <span className="text-[#10B981]">£{finalPrice.toFixed(2)}</span>
        </div>
        
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
      </div>
    </div>
  );
}
