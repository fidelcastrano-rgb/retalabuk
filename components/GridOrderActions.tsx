"use client";

import { useState } from "react";
import { ProductVariant, Product } from "@/lib/types";
import { useOrder } from "@/components/OrderContext";

export function GridOrderActions({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [showAdded, setShowAdded] = useState(false);
  const { addToOrder } = useOrder();

  const handleAdd = () => {
    addToOrder({
      name: product.name,
      slug: product.slug,
      variant: selectedVariant.name,
      price: selectedVariant.price,
    });
    
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex justify-between items-end">
         <div>
            <span className="text-xs text-[#475569] font-bold uppercase">Price</span>
            <div className="text-xl font-heading font-bold text-[#0F172A]">£{selectedVariant.price.toFixed(2)}</div>
         </div>
         <select 
            className="text-sm border border-[#CBD5E1] rounded py-1.5 px-2 bg-[#F8FAFC] text-[#0F172A] font-medium outline-none focus:border-[#2563EB]"
            value={selectedVariant.id}
            onChange={(e) => {
               const variant = product.variants.find(v => v.id === e.target.value);
               if (variant) setSelectedVariant(variant);
            }}
         >
            {product.variants.map(v => (
               <option key={v.id} value={v.id}>{v.name}</option>
            ))}
         </select>
      </div>
      {selectedVariant.name.toLowerCase().includes("vial") && (
        <div className="text-xs text-[#E11D48] font-bold bg-[#FFF1F2] border border-[#FECDD3] rounded p-2 text-center">
          ⚠️ MOQ: 10 Vials ({selectedVariant.name.includes("5x") ? "requires 2x packs" : "requires 10x vials"})
        </div>
      )}
      <button
        onClick={handleAdd}
        className={`w-full py-2.5 rounded font-bold text-sm flex items-center justify-center transition-all ${
          showAdded ? 'bg-[#10B981] text-white' : 'bg-[#FF6B1A] text-white hover:bg-opacity-90'
        }`}
      >
        {showAdded ? '✓ Added to Order' : 'Add to Order Builder'}
      </button>
    </div>
  );
}
