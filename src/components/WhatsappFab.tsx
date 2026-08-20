import { FaWhatsapp } from "react-icons/fa";
import { whatsappUrl } from "@/sanity/contact";
import type { Locale } from "@/sanity/paths";
import type { ContactChannel } from "@/sanity/seo";
import styles from "./WhatsappFab.module.scss";

// Floating WhatsApp button pass — sitewide, every page, both locales.
// Mounted once in layout.tsx as a sibling of CookieConsentBanner (the
// only other fixed-position element at that level), not per-page — same
// "render once, everywhere" precedent as the cookie banner and footer.
//
// A real <a>, not a <button onClick>: it navigates (opens WhatsApp), so
// it's a link semantically as well as visually — no JS is needed or used
// to make it work, and it degrades to a plain link with JS disabled.
//
// The accessible name reuses contactChannels' own WhatsApp label
// ("Scrivimi su WhatsApp" / "Message me on WhatsApp") rather than
// inventing new copy or just labelling the icon "WhatsApp" — the label
// already says both the action and the destination, and reusing it means
// the number/label are never typed a second time here either. Falls back
// to an equivalent hardcoded phrase only if contactChannels has no
// WhatsApp entry (shouldn't happen in practice, but the button must still
// have a real accessible name if it does).
//
// bottom offset reads --consent-banner-offset, the same CSS custom
// property CookieConsentBanner.tsx already live-measures and writes to
// <html> — at the mobile breakpoint the banner is a full-width bottom
// sheet, so without this the FAB would sit underneath it; with it, the
// FAB rises to sit just above the banner while it's showing and settles
// back down the instant it's dismissed, with no separate coordination
// logic of its own.
export function WhatsappFab({
  locale,
  contactChannels,
}: {
  locale: Locale;
  contactChannels?: ContactChannel[];
}) {
  const whatsappChannel = contactChannels?.find((channel) => channel.type === "whatsapp");
  if (!whatsappChannel) return null;

  const href = whatsappUrl(whatsappChannel.value, locale);
  const label =
    whatsappChannel.label || (locale === "en" ? "Message me on WhatsApp" : "Scrivimi su WhatsApp");

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.fab} aria-label={label}>
      <FaWhatsapp className={styles.icon} aria-hidden="true" />
    </a>
  );
}
