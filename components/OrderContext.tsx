"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { calculateDiscount, getDiscountMessage } from "@/lib/discounts";

export interface OrderItem {
  key: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
  slug: string;
}

interface OrderContextProps {
  items: OrderItem[];
  addToOrder: (item: Omit<OrderItem, "key" | "qty">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, qty: number) => void;
  clearOrder: () => void;
  totalItems: number;
  totalPrice: number; // This is now original subtotal
  discountPercentage: number;
  discountAmount: number;
  finalSubtotal: number;
  discountMessage: string;
  sendWA: () => void;
  sendEmail: () => void;
  whatsappNumber: string;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const whatsappNumber = "447341056054"; // Active WhatsApp number

  // Optionally load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("reta_order");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("reta_order", JSON.stringify(items));
  }, [items]);

  const addToOrder = (newItem: Omit<OrderItem, "key" | "qty">) => {
    const key = `${newItem.slug}_${newItem.variant.replace(/\s+/g, "")}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...newItem, key, qty: 1 }];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key: string, qty: number) => {
    setItems((prev) => prev.map((item) => item.key === key ? { ...item, qty: Math.max(1, qty) } : item));
  };

  const clearOrder = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  const discountPercentage = calculateDiscount(totalItems);
  const discountAmount = totalPrice * (discountPercentage / 100);
  const finalSubtotal = totalPrice - discountAmount;
  const discountMessage = getDiscountMessage(totalItems, discountAmount);

  const formatOrderText = () => {
    return items.map(item => `${item.qty}x ${item.name} (${item.variant}) - £${(item.price * item.qty).toFixed(2)}`).join("%0A");
  };

  const sendWA = () => {
    let text = `Hello RETA LAB UK, I'd like to place an order:%0A%0A${formatOrderText()}%0A%0ASubtotal: £${totalPrice.toFixed(2)}`;
    if (discountAmount > 0) {
      text += `%0AVolume Discount (${discountPercentage}%): -£${discountAmount.toFixed(2)}`;
    }
    text += `%0AFinal Subtotal: £${finalSubtotal.toFixed(2)}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  const sendEmail = () => {
    let text = `Hello RETA LAB UK,\n\nI'd like to place an order:\n\n${items.map(item => `${item.qty}x ${item.name} (${item.variant}) - £${(item.price * item.qty).toFixed(2)}`).join("\n")}\n\nSubtotal: £${totalPrice.toFixed(2)}`;
    if (discountAmount > 0) {
      text += `\nVolume Discount (${discountPercentage}%): -£${discountAmount.toFixed(2)}`;
    }
    text += `\nFinal Subtotal: £${finalSubtotal.toFixed(2)}`;
    window.open(`mailto:sales@reta-lab.co.uk?subject=New Order Enquiry&body=${encodeURIComponent(text)}`);
  };

  return (
    <OrderContext.Provider value={{ items, addToOrder, removeItem, updateQuantity, clearOrder, totalItems, totalPrice, discountPercentage, discountAmount, finalSubtotal, discountMessage, sendWA, sendEmail, whatsappNumber }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
