// Currency formatting for BakeryHub (Nepali Rupees).
//
// All backend prices are stored in NPR. This helper renders them with the
// "Rs" symbol and Nepali/Indian digit grouping (1,234 / 12,34,567) using the
// en-IN locale, which matches how NPR amounts are conventionally displayed.
import { CURRENCY } from '@/lib/currency';

/**
 * Format a numeric NPR amount as a localized price string, e.g. 750 -> "Rs 750".
 * Larger amounts use lakh/crore style grouping for readability.
 */
export function formatPrice(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const grouped = value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY.symbol} ${grouped}`;
}
