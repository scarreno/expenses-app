export const BUSINESS_TYPES = [
  "SUPERMARKET",
  "MARKET",
  "GAS",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];