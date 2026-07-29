export interface AccessoryCosts {
  candle: boolean;
  knife: boolean;
  greetingCard: boolean;
  giftWrap: boolean;
}

export const ACCESSORY_PRICES = {
  candle: 50,
  knife: 50,
  greetingCard: 150,
  giftWrap: 200,
} as const;

export const DELIVERY_FEES = {
  STANDARD: 199,
  SAME_DAY: 499,
  MIDNIGHT: 699,
  SCHEDULED: 299,
} as const;

export const TAX_RATE = 0.1;

export interface CartItemPrice {
  basePrice: number;
  discountPrice?: number | null;
  variantPriceModifier: number;
  accessories: AccessoryCosts;
  quantity: number;
}

export function calculateAccessoriesCost(accessories: AccessoryCosts): number {
  let cost = 0;
  if (accessories.candle) cost += ACCESSORY_PRICES.candle;
  if (accessories.knife) cost += ACCESSORY_PRICES.knife;
  if (accessories.greetingCard) cost += ACCESSORY_PRICES.greetingCard;
  if (accessories.giftWrap) cost += ACCESSORY_PRICES.giftWrap;
  return cost;
}

export function calculateSingleItemPrice({
  basePrice,
  discountPrice,
  variantPriceModifier,
  accessories,
}: CartItemPrice): number {
  const effectiveBase = discountPrice ?? basePrice;
  const accessoriesCost = calculateAccessoriesCost(accessories);
  return effectiveBase + variantPriceModifier + accessoriesCost;
}

export function calculateCartSubtotal(
  items: Array<{
    cake?: { price?: number; discountPrice?: number | null } | null;
    variants?: Array<{ weight: number; flavor: string; priceModifier: number }> | null;
    weight: number;
    flavor: string;
    quantity: number;
    candle?: boolean;
    knife?: boolean;
    greetingCard?: boolean;
    giftWrap?: boolean;
  }>
): number {
  return items.reduce((sum, item) => {
    const basePrice = item.cake?.discountPrice || item.cake?.price || 0;
    const matchingVariant = item.variants?.find(
      (v) => v.weight === item.weight && v.flavor.toLowerCase() === v.flavor.toLowerCase()
    );
    const modifier = matchingVariant ? matchingVariant.priceModifier : 0;
    const accessoriesCost = calculateAccessoriesCost({
      candle: item.candle || false,
      knife: item.knife || false,
      greetingCard: item.greetingCard || false,
      giftWrap: item.giftWrap || false,
    });
    return sum + (basePrice + modifier + accessoriesCost) * item.quantity;
  }, 0);
}

export function calculateOrderTotal({
  subtotal,
  discount = 0,
  deliveryOption = 'STANDARD',
}: {
  subtotal: number;
  discount?: number;
  deliveryOption?: keyof typeof DELIVERY_FEES;
}): { deliveryFee: number; tax: number; total: number } {
  const deliveryFee = DELIVERY_FEES[deliveryOption] || DELIVERY_FEES.STANDARD;
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const total = subtotal + deliveryFee + tax - discount;
  return {
    deliveryFee,
    tax,
    total: Math.round(total * 100) / 100,
  };
}
