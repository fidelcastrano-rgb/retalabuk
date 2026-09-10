"use client";

import { useState, useEffect, useRef } from "react";
import { products } from "@/lib/data";
import { CheckCircle2, X, Package } from "lucide-react";
import { notificationBuyers } from "@/lib/notification-data";

export function SalesNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<{
    productName: string;
    productImage: string;
    buyerName: string;
    location: string;
    timeAgo: string;
    qty: number;
    totalAmount: number;
    orderType: string;
    variantName: string;
  } | null>(null);

  const shuffleBag = useRef<number[]>([]);

  const drawFromBag = () => {
    if (shuffleBag.current.length === 0) {
      // Refill bag with indices 0 to 299
      const indices = Array.from({ length: notificationBuyers.length }, (_, i) => i);
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      shuffleBag.current = indices;
    }
    return shuffleBag.current.pop()!;
  };

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;
    
    // Initial delay so it doesn't pop up the immediate second the page loads
    const interval = setInterval(() => {
      // Pick random data
      const product = products[Math.floor(Math.random() * products.length)];
      const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
      
      const buyerIndex = drawFromBag();
      const buyer = notificationBuyers[buyerIndex];
      const name = buyer.buyerName;
      const location = buyer.location;
      
      const timeMins = Math.floor(Math.random() * 59) + 1; // 1 to 59 minutes

      // Determine bulk vs single
      const isBulk = Math.random() > 0.6; // 40% chance of bulk
      let qty = isBulk ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 3) + 1; // 5-19 for bulk, 1-3 for single
      
      // Ensure total order is never below 100.56 GBP
      if (variant.price * qty < 100.56) {
        qty = Math.ceil(100.56 / variant.price);
      }
      
      const totalAmount = variant.price * qty;
      const orderType = qty >= 5 ? "Wholesale / Bulk Order" : "Verified Purchase";

      setNotification({
        productName: product.name,
        variantName: variant.name,
        productImage: product.image,
        buyerName: name,
        location,
        qty,
        totalAmount,
        orderType,
        timeAgo: `${timeMins} min${timeMins > 1 ? 's' : ''} ago`,
      });

      setIsVisible(true);

      // Auto-hide after 5 seconds
      hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

    }, 10000); // 10 seconds

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-24 left-4 sm:left-6 z-40 w-72 sm:w-[340px] bg-[#0B1120]/95 backdrop-blur-md border border-[#334155] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col overflow-hidden transition-all duration-500 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#0F172A]" />
      
      <div className="p-3.5">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3.5 right-3.5 text-[#64748B] hover:text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
        
        <div className="flex items-start gap-3.5">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-[#1E293B] overflow-hidden flex-shrink-0 bg-[#070C14] mt-1">
            <img
              src={notification.productImage}
              alt={notification.productName}
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] uppercase tracking-wider mb-1.5">
              {notification.qty >= 5 ? <Package size={11} /> : <CheckCircle2 size={11} />}
              <span>{notification.orderType}</span>
            </div>
            
            <p className="text-xs text-[#CBD5E1] truncate leading-relaxed">
              <strong className="text-white font-medium">{notification.buyerName}</strong> in {notification.location} purchased:
            </p>
            
            <p className="text-sm font-semibold text-white truncate font-heading mt-0.5" title={notification.productName}>
              {notification.qty}x {notification.productName}
            </p>
            <p className="text-[10px] text-[#94A3B8] truncate">
              Variant: {notification.variantName}
            </p>
            
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1E293B]">
              <p className="text-[10px] text-[#64748B] font-medium">
                {notification.timeAgo}
              </p>
              <span className="text-xs font-mono font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-1.5 py-0.5 rounded border border-[#3B82F6]/20">
                £{notification.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
