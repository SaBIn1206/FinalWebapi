// Centralized currency configuration for BakeryHub.
//
// The store targets the Nepali market, so all monetary values are denominated
// in Nepali Rupees (NPR). Prices are NOT produced by a flat USD -> NPR exchange
// rate. Instead we use a localized pricing strategy (see `toNepaliPrice`) that
// applies purchasing-power-parity style tiers plus consumer-friendly psychological
// endings so the catalog feels natural to Nepali customers.

export const CURRENCY = {
  code: 'NPR',
  symbol: 'Rs',
  locale: 'ne-NP',
  // Used only to render the currency on the server / in logs if needed.
} as const;

/**
 * Convert a USD base price into a localized NPR price.
 *
 * This deliberately avoids a single exchange rate. Lower-priced items convert
 * close to the nominal market rate, while higher-priced items use a smaller
 * multiplier so big-ticket cakes stay competitive in Nepal. The result is then
 * snapped to a psychological "x9" ending (e.g. 750 -> 749) which reads as a
 * local retail price rather than a converted foreign one.
 */
export function toNepaliPrice(usd: number): number {
  let rate: number;
  if (usd <= 20) rate = 130;       // small items (cupcakes, accessories)
  else if (usd <= 50) rate = 110;  // mid items (standard cakes)
  else if (usd <= 100) rate = 95;  // premium single cakes
  else rate = 85;                  // large / wedding tiers

  const raw = usd * rate;
  const rounded = Math.round(raw / 10) * 10 - 1; // snap to ...9 ending
  return Math.max(99, rounded);
}
