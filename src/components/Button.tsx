import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.scss";

// "solid"/"outline" are the ORIGINAL variants — unchanged, still used by
// the portable-text CTA block (src/sanity/portableTextComponents.tsx),
// the only other real consumer of this component found in the codebase
// (Hero's own CTA is a fully separate bespoke component, HeroCta.tsx,
// styled via HeroOverlap.module.scss — not this file at all; ContactForm's
// submit button is likewise its own local .submitButton class). Extending
// this component with "primary"/"text"/"glass" adds new, additive classes
// alongside solid/outline rather than changing them, so that one existing
// usage renders identically to before this pass. ("secondary" was a
// fourth additive variant here too, removed as dead code — zero callers
// ever passed it; see docs/pre-launch.md.) "glass" is for a button
// sitting over arbitrary imagery/video (currently: Hero's video
// background) rather than a flat token surface — see Button.module.scss's
// own comment for the token set and backdrop-filter fallback.
export type ButtonVariant = "solid" | "outline" | "primary" | "text" | "glass";
export type ButtonSize = "default" | "compact";
// Only meaningful for the three new variants — the button resolves its
// own colors per surface tone, the same way every other component in the
// tonal-scale system does. "base"/"mid" need no special handling (they
// already read the correctly-cascading --color-accent/--color-accent-contrast
// tokens for free); "deep" is the one that needs an explicit signal,
// since tone-deep locally repurposes --color-accent for its own gradient
// BACKGROUND (rich-dark-surface), so a button placed there can't safely
// read --color-accent as a fill/label color at all — same landmine
// CtaBridgeBlock/VideoBlock hit and fixed the same way in an earlier
// pass (an explicit override, not automatic cascade detection).
export type ButtonTone = "base" | "mid" | "deep";

const NEW_VARIANTS: ReadonlySet<ButtonVariant> = new Set(["primary", "text", "glass"]);

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  tone: ButtonTone,
  pending: boolean | undefined,
  className?: string,
): string {
  const isNew = NEW_VARIANTS.has(variant);
  return [
    styles.button,
    styles[variant],
    isNew ? styles[`size-${size}`] : null,
    pending ? styles.pending : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

// Arrow + one-shot hover glint are additive decoration for the three new
// variants only — solid/outline render exactly as before (no arrow span,
// no glint span), since adding either would visibly change the one real
// existing usage (the portable-text CTA).
function ButtonContent({
  variant,
  children,
}: {
  variant: ButtonVariant;
  children: ReactNode;
}) {
  if (!NEW_VARIANTS.has(variant)) return <>{children}</>;
  return (
    <>
      <span className={styles.label}>{children}</span>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
      {/* Glint: PRIMARY only, per spec ("one-shot glint on hover for
          PRIMARY only"). Pure CSS, hover-triggered, not ambient/looping —
          see Button.module.scss's own comment on the mechanism. */}
      {variant === "primary" ? <span className={styles.glint} aria-hidden="true" /> : null}
    </>
  );
}

interface ButtonLinkProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  className?: string;
  children: ReactNode;
}

// A navigational CTA styled as a button (e.g. the hero's "Prenota un primo
// colloquio") — a real link under the hood, not a <button>, since it
// navigates rather than performs an in-page action.
export function ButtonLink({
  variant = "solid",
  size = "default",
  tone = "base",
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName(variant, size, tone, false, className)}
      data-tone={NEW_VARIANTS.has(variant) ? tone : undefined}
      {...linkProps}
    >
      <ButtonContent variant={variant}>
        {children}
      </ButtonContent>
    </Link>
  );
}

interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  // Submit-in-flight state (this button is the Welcome CTA's form
  // submit inside the modal): forces `disabled`, suppresses the hover
  // glint, and gives assistive tech an aria-busy signal. Only meaningful
  // for the three new variants.
  pending?: boolean;
  className?: string;
  children: ReactNode;
}

// A real <button> for in-page actions (form submit, dialog triggers, etc.).
export function Button({
  variant = "solid",
  size = "default",
  tone = "base",
  pending = false,
  className,
  children,
  disabled,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      className={buttonClassName(variant, size, tone, pending, className)}
      data-tone={NEW_VARIANTS.has(variant) ? tone : undefined}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...buttonProps}
    >
      <ButtonContent variant={variant}>
        {children}
      </ButtonContent>
    </button>
  );
}
