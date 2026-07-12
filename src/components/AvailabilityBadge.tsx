import type { AvailabilityStatus } from "@/sanity/seo";
import styles from "./AvailabilityBadge.module.scss";

// Availability-badge pass: a purely informational status line (dot +
// text), server-rendered from siteSettings (see src/sanity/seo.ts's
// resolveAvailabilityText, which picks the right status text and already
// returns null when that text is empty) — no client fetching, this is
// plain SSR/ISR content like everything else on the page.
//
// Renders nothing rather than a bare dot when there's no text for the
// active status — belt-and-braces with resolveAvailabilityText's own
// null-return, so a future caller that passes status/text separately
// (bypassing that helper) still can't ship an empty dot.
export function AvailabilityBadge({
  status,
  text,
  variant,
  className,
}: {
  status?: AvailabilityStatus;
  text?: string;
  variant: "onLight" | "onDark";
  // Each placement (Hero/ChannelPickerDialog/FinalContactSection) owns
  // its own margin around this component via its own CSS module — a
  // plain className string, not a cross-module selector, since CSS
  // Modules scope every bare class to the file it's written in (a
  // selector like `.availabilityBadge` written in a DIFFERENT file's
  // .module.scss would compile to an unrelated, never-matching local
  // class — the exact bug already caught once elsewhere in this project).
  className?: string;
}) {
  if (!status || !text) return null;

  const variantClass = variant === "onDark" ? styles.availabilityBadgeOnDark : styles.availabilityBadgeOnLight;

  return (
    <p className={[styles.availabilityBadge, variantClass, className].filter(Boolean).join(" ")}>
      <span className={styles.availabilityDot} data-status={status} aria-hidden="true" />
      {text}
    </p>
  );
}
