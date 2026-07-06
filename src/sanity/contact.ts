// Derives a wa.me link from a stored phone number rather than trusting an
// editor to construct/paste one correctly — wa.me requires the number as
// digits only (country code, no "+", no spaces/punctuation).
export function whatsappUrl(rawNumber: string): string {
  const digitsOnly = rawNumber.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}`;
}
