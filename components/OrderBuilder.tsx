"use client";

import { useOrder } from "./OrderContext";
import { X, Minus, Plus, MessageCircle, Mail, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { useState } from "react";

export function OrderBuilder() {
  const { items, totalItems, totalPrice: subtotalPrice, discountPercentage, discountAmount, finalSubtotal, discountMessage, removeItem, updateQuantity, clearOrder, whatsappNumber } = useOrder();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    shipping: "UK",
    payment: "Bank Transfer"
  });

  if (totalItems === 0) return null;

  const shippingFee = 9.99;
  const finalPrice = finalSubtotal + shippingFee;

  const isCrypto = formData.payment.toLowerCase().includes("crypto");
  const isBelowMin = !isCrypto && finalSubtotal < 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateMessage = () => {
    const orderItems = items.map(item => `${item.qty}x ${item.name} (${item.variant}) - £${(item.price * item.qty).toFixed(2)}`).join("\n");
    let msg = `New Order from ${formData.name}\n\nOrder Details:\n${orderItems}\n\nSubtotal: £${subtotalPrice.toFixed(2)}\n`;
    if (discountAmount > 0) {
      msg += `Volume Discount (${discountPercentage}%): -£${discountAmount.toFixed(2)}\nFinal Subtotal: £${finalSubtotal.toFixed(2)}\n`;
    }
    msg += `Shipping Fee (${formData.shipping}): £${shippingFee.toFixed(2)}\nTotal to Pay: £${finalPrice.toFixed(2)}\n\nCustomer Details:\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nShipping Option: ${formData.shipping}\nAddress: ${formData.address.replace(/\n/g, ", ")}\nPayment Method: ${formData.payment}\n\nPlease confirm receipt of this order.`;
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
          <button onClick={() => setIsMinimized(true)} className="text-white hover:text-[#CBD5E1] transition-colors" aria-label="Minimize Order">
            <ChevronDown size={20} />
          </button>
          <button onClick={clearOrder} className="text-white hover:text-[#CBD5E1] transition-colors" aria-label="Clear Order">
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

        {items.map((item) => (
          <div key={item.key} className="flex justify-between items-start border-b border-[#475569] pb-3 text-sm">
            <div className="flex-1">
              <div className="font-medium text-white">{item.name}</div>
              <div className="text-[#CBD5E1] text-xs mt-1">{item.variant}</div>
              <div className="font-bold mt-1 text-[#10B981]">£{(item.price * item.qty).toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => removeItem(item.key)} className="text-[#FF6B1A] hover:text-white transition-colors" aria-label="Remove item">
                 <X size={16} />
              </button>
              <div className="flex items-center gap-2 bg-[#EEF2F7] text-[#0F172A] rounded px-2 py-0.5 text-xs">
                <button onClick={() => updateQuantity(item.key, item.qty - 1)} disabled={item.qty <= 1} className="hover:text-[#FF6B1A] disabled:opacity-30"><Minus size={12} /></button>
                <span className="font-bold w-4 text-center">{item.qty}</span>
                <button onClick={() => updateQuantity(item.key, item.qty + 1)} className="hover:text-[#FF6B1A]"><Plus size={12} /></button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Checkout Form */}
        <div className="pt-2 space-y-3">
          <h3 className="font-heading font-bold text-[#EEF2F7] text-sm border-b border-[#475569] pb-1">Checkout Details</h3>
          <div className="grid grid-cols-2 gap-2">
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]" />
            <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]" />
          </div>
          <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]" />
          <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Shipping Address" rows={2} className="w-full bg-[#1E293B] border border-[#475569] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB] resize-none" />
          
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
        </div>
      </div>

      <div className="p-3 bg-[#0F172A] border-t border-[#475569]">
        {isBelowMin && (
          <div className="bg-amber-500/10 text-amber-300 text-xs p-2 rounded border border-amber-500/30 text-center font-medium mb-3 animate-pulse">
            ⚠️ Minimum order is £100 for non-crypto options. Select Bitcoin/USDT/Ether or add more items.<br/>
            Crypto is the best and preferred payment option for those who want to be anonymous.
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
        <div className="flex justify-between items-center text-sm text-[#CBD5E1] mb-1">
          <span>Subtotal:</span>
          <span>£{finalSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-[#CBD5E1] mb-2 border-b border-[#475569] pb-2">
          <span>Shipping ({formData.shipping}):</span>
          <span>£{shippingFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center font-bold font-heading mb-3 text-lg">
          <span>Total:</span>
          <span className="text-[#10B981]">£{finalPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleWA}
            disabled={isBelowMin}
            className={`flex-1 text-white py-2 rounded font-bold flex items-center justify-center gap-2 transition-all text-sm ${
              isBelowMin ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60" : "bg-[#FF6B1A] hover:bg-opacity-90 cursor-pointer"
            }`}
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
          
          <button 
            onClick={handleEmail}
            disabled={isBelowMin}
            className={`flex-1 bg-transparent border py-2 rounded font-bold flex items-center justify-center gap-2 transition-all text-sm ${
              isBelowMin 
                ? "border-slate-700 text-slate-500 cursor-not-allowed opacity-60" 
                : "border-[#CBD5E1] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] cursor-pointer"
            }`}
          >
            <Mail size={18} />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}
