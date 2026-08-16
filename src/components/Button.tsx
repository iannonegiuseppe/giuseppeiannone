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

// Exported alongside ButtonContent so callers that render their own root
// element (HeroCta.tsx's <a>, which also owns non-navigational onClick
// behavior Button/ButtonLink don't model) can opt into the exact same
// class list and label/arrow/glint markup instead of a second, forked
// copy of either.
export function buttonClassName(
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
//
// showArrow (gold-button unification pass): the header CTA is the one
// caller of variant="primary" that must NOT show the arrow (a deliberate,
// explicit exception — every other primary/text/glass consumer keeps it,
// so the default stays true). Kept as a prop on ButtonContent itself
// rather than a second content component, so both Button and ButtonLink
// share the one branch instead of forking per-caller.
export function ButtonContent({
  variant,
  showArrow = true,
  children,
}: {
  variant: ButtonVariant;
  showArrow?: boolean;
  children: ReactNode;
}) {
  if (!NEW_VARIANTS.has(variant)) return <>{children}</>;
  return (
    <>
      <span className={styles.label}>{children}</span>
      {showArrow ? (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      ) : null}
      {/* Glint: PRIMARY only, per spec ("one-shot glint on hover for
          PRIMARY only"). Pure CSS, hover-triggered, not ambient/looping —
          see Button.module.scss's own comment on the mechanism. Independent
          of showArrow — dropping the arrow doesn't drop the glint. */}
      {variant === "primary" ? <span className={styles.glint} aria-hidden="true" /> : null}
    </>
  );
}

interface ButtonLinkProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  showArrow?: boolean;
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
  showArrow = true,
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
      <ButtonContent variant={variant} showArrow={showArrow}>
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
  showArrow?: boolean;
  className?: string;
  children: ReactNode;
}

// A real <button> for in-page actions (form submit, dialog triggers, etc.).
export function Button({
  variant = "solid",
  size = "default",
  tone = "base",
  pending = false,
  showArrow = true,
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
      <ButtonContent variant={variant} showArrow={showArrow}>
        {children}
      </ButtonContent>
    </button>
  );
}
