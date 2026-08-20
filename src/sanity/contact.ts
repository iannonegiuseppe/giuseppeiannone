import type { Locale } from "./paths";

// Floating-WhatsApp-button pass — the prefilled opening message lives HERE,
// not in messages/it.json or repeated per call site, for the same reason
// the number itself isn't typed a second time anywhere: whatsappUrl() is
// already the one place every wa.me link on the site is built, so folding
// the message into its own signature (rather than having six call sites
// each import a message-catalog key and remember to pass it) makes it
// structurally impossible for a future WhatsApp link to be added without
// the prefill, not just conventionally consistent today.
const WHATSAPP_PREFILLED_MESSAGE: Record<Locale, string> = {
  it: "Buongiorno, vorrei chiedere un'informazione.",
  en: "Hello, I would like to ask a question.",
};

// Derives a wa.me link from a stored phone number rather than trusting an
// editor to construct/paste one correctly — wa.me requires the number as
// digits only (country code, no "+", no spaces/punctuation). Always
// carries the locale-appropriate prefilled message, URL-encoded.
export function whatsappUrl(rawNumber: string, locale: Locale): string {
  const digitsOnly = rawNumber.replace(/\D/g, "");
  const text = encodeURIComponent(WHATSAPP_PREFILLED_MESSAGE[locale]);
  return `https://wa.me/${digitsOnly}?text=${text}`;
}
