export const DISCOUNT_TIERS = [
  { minQuantity: 50, discountPercentage: 25 },
  { minQuantity: 20, discountPercentage: 20 },
  { minQuantity: 10, discountPercentage: 15 },
  { minQuantity: 5, discountPercentage: 10 },
  { minQuantity: 2, discountPercentage: 5 },
  { minQuantity: 0, discountPercentage: 0 },
];

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  description: string;
}

export const VALID_COUPONS: Record<string, Coupon> = {
  RETA10: { code: "RETA10", type: "percent", value: 10, description: "10% OFF Special Discount" },
  SAVE10: { code: "SAVE10", type: "percent", value: 10, description: "10% OFF Savings Code" },
  WELCOME10: { code: "WELCOME10", type: "percent", value: 10, description: "10% OFF Welcome Bonus" },
  RESEARCH15: { code: "RESEARCH15", type: "percent", value: 15, description: "15% OFF Research Special" },
  VIP20: { code: "VIP20", type: "percent", value: 20, description: "20% OFF VIP Partner Code" },
  RETA5: { code: "RETA5", type: "fixed", value: 5, description: "£5 OFF Instant Discount" },
};

export function validateCoupon(inputCode: string): { valid: boolean; coupon?: Coupon; error?: string } {
  const cleanCode = inputCode.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: "Please enter a coupon code." };
  }
  if (VALID_COUPONS[cleanCode]) {
    return { valid: true, coupon: VALID_COUPONS[cleanCode] };
  }
  return { 
    valid: false, 
    error: "Invalid coupon code. Try using RETA10 or WELCOME10" 
  };
}

export function calculateDiscount(totalQuantity: number) {
  const tier = DISCOUNT_TIERS.find(t => totalQuantity >= t.minQuantity);
  return tier ? tier.discountPercentage : 0;
}

export function getNextDiscountTier(totalQuantity: number) {
  const sortedTiers = [...DISCOUNT_TIERS].sort((a, b) => a.minQuantity - b.minQuantity);
  return sortedTiers.find(t => t.minQuantity > totalQuantity);
}

export function getDiscountMessage(totalQuantity: number, discountAmount: number) {
  const discountPercentage = calculateDiscount(totalQuantity);
  const nextTier = getNextDiscountTier(totalQuantity);

  if (!nextTier) {
     return `Congratulations! You saved £${discountAmount.toFixed(2)} with your ${discountPercentage}% volume discount.`;
  }

  if (totalQuantity === 0) {
    return `Buy ${nextTier.minQuantity} items and save ${nextTier.discountPercentage}%.`;
  }

  const itemsNeeded = nextTier.minQuantity - totalQuantity;
  if (discountPercentage > 0) {
     return `You're getting ${discountPercentage}% OFF! Add ${itemsNeeded} more item${itemsNeeded > 1 ? 's' : ''} to unlock ${nextTier.discountPercentage}% OFF.`;
  } else {
     return `You're only ${itemsNeeded} more item${itemsNeeded > 1 ? 's' : ''} away from unlocking ${nextTier.discountPercentage}% OFF!`;
  }
}

