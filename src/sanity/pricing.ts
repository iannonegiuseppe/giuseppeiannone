import type { PricingFields } from "./seo";
import type { Locale } from "./paths";

// /prezzi port pass — the real, production counterpart to the design-lab
// proposal's own scratch-scoped shared.ts formatters (that file stays
// design-lab-only; A/B still use it). Every fee/duration figure on the
// real /prezzi page goes through this, never a typed literal.
export function formatFee(amount: number | undefined, currency: string | undefined): string {
  if (typeof amount !== "number") return "[tariffa]";
  const symbol = currency === "EUR" || !currency ? "€" : currency;
  return `${amount} ${symbol}`;
}

export function formatDuration(minutes: number | undefined, locale: Locale): string {
  if (typeof minutes !== "number") return locale === "en" ? "[duration]" : "[durata]";
  return locale === "en" ? `${minutes} minutes` : `${minutes} minuti`;
}

export function pricingOrPlaceholder(pricing: PricingFields | undefined, locale: Locale) {
  return {
    individualFee: formatFee(pricing?.individualFee, pricing?.currency),
    individualDuration: formatDuration(pricing?.individualDurationMin, locale),
    coupleFee: formatFee(pricing?.coupleFee, pricing?.currency),
    coupleDuration: formatDuration(pricing?.coupleDurationMin, locale),
  };
}
