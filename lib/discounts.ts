export const DISCOUNT_TIERS = [
  { minQuantity: 50, discountPercentage: 25 },
  { minQuantity: 20, discountPercentage: 20 },
  { minQuantity: 10, discountPercentage: 15 },
  { minQuantity: 5, discountPercentage: 10 },
  { minQuantity: 2, discountPercentage: 5 },
  { minQuantity: 0, discountPercentage: 0 },
];

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
