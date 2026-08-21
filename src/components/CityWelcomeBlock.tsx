"use client";

import NextImage from "next/image";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import { Button } from "@/components/Button";
import { ContactFormDialog, type ContactFormDialogHandle } from "@/components/ContactFormDialog";
import { ShimmerText } from "@/components/ShimmerText";
import { SectionKicker } from "@/components/ui/SectionKicker";
import type { Locale } from "@/sanity/paths";
import styles from "./CityWelcomeBlock.module.scss";

// Rebuild pass — the previous version (ClosingPortraitBlock) reused only
// Welcome's photo mechanism; everything else (kicker, heading treatment,
// lead, list, CTA, signature) was invented fresh and smaller. Rejected:
// "not the Welcome block — it reuses the photo mechanism and nothing
// else." This is the real thing: same elements, same order, same
// components (Button, ContactFormDialog, ShimmerText, AnimatedDivider,
// SectionKicker — all reused verbatim from Welcome/WelcomeBlock.tsx, not
// re-implemented), same card+photo mechanism at Welcome's own proportions
// (welcome.module.scss's exact numbers, not scaled down).
//
// List pass — removed. Welcome's own list earns its place (it's the only
// place on the homepage naming the areas Giuseppe treats); this card's
// list was repeating the addresses/online-option/single-fee facts the
// page had already stated three times above it. Card: kicker, heading,
// lead, CTA, signature, credential — nothing else.
//
// Genuinely page-local content (Milan/Monza's own kicker/heading/lead/
// credential), so this lives as its own component rather than
// generalizing WelcomeBlock itself — that component's `areas` prop reads
// Sanity's AreaRow shape (title + `_key`), a different data shape, and is
// wired specifically to the homepage's own Hero.contactLabel reuse;
// forcing both shapes through one component would mean branching
// WelcomeBlock internally for a caller that isn't the homepage, not
// simplifying anything.
function splitEmphasis(text: string, emphasis: string | undefined, render: (s: string) => ReactNode) {
  const index = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      {render(emphasis)}
      {text.slice(index + emphasis.length)}
    </>
  );
}

export function CityWelcomeBlock({
  kicker,
  heading,
  headingEmphasisWord,
  lead,
  ctaLabel,
  authorName,
  credentialLine,
  photoUrl,
  photoAlt,
  locale,
  closeLabel,
  contactDialogHeading,
}: {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  lead: string;
  ctaLabel: string;
  authorName: string;
  // Optional — the rest of the card is this section's real content and
  // always renders; the registration line is supplementary (see
  // psicologo-milano/page.tsx's own comment on why it can theoretically
  // be empty).
  credentialLine?: string;
  photoUrl: string;
  photoAlt: string;
  locale: Locale;
  closeLabel: string;
  contactDialogHeading: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const contactDialogRef = useRef<ContactFormDialogHandle>(null);

  // Same reveal mechanism as WelcomeBlock.tsx's own — one IntersectionObserver,
  // unobserves itself once triggered, skipped entirely under
  // prefers-reduced-motion (the CSS side also has its own @media guard,
  // matching that file's belt-and-suspenders approach).
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.unobserve(root);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const headingNode = splitEmphasis(heading, headingEmphasisWord, (s) => <ShimmerText>{s}</ShimmerText>);

  return (
    <div className={styles.cwOuterMid} data-sheen="upper-left">
      <div className={styles.cwInner}>
        <div ref={rootRef} className={styles.cwCard} data-revealed={revealed}>
          <div className={styles.cwContent}>
            <div className={styles.cwTopZone}>
              <p className={styles.cwKicker}>
                <SectionKicker>{kicker}</SectionKicker>
              </p>
              <h2 className={styles.cwHeading}>{headingNode}</h2>
              <p className={styles.cwLead}>{lead}</p>
            </div>

            <div className={styles.cwLowerZone}>
              <Button
                type="button"
                variant="primary"
                tone="mid"
                className={styles.cwCta}
                onClick={() => contactDialogRef.current?.open()}
              >
                {ctaLabel}
              </Button>

              <div className={styles.cwSignature}>
                <AnimatedDivider className={styles.cwSignatureRule} />
                <div className={styles.cwSignatureRow}>
                  <p className={styles.cwSignatureName}>{authorName}</p>
                  {credentialLine ? <p className={styles.cwSignatureReg}>{credentialLine}</p> : null}
                </div>
              </div>
            </div>
          </div>

          {/* Same placement rules as WelcomeBlock.tsx's own photo layer —
              outside the card's own text flow, tucked behind its right
              edge, square corners, comes AFTER the content in DOM order
              so mobile's normal flow stacks it below instead of behind. */}
          <div className={styles.cwPhotoLayer}>
            <NextImage
              src={photoUrl}
              alt={photoAlt}
              fill
              sizes="(min-width: 48rem) 36vw, 100vw"
              className={styles.cwPhotoImg}
            />
          </div>

          <div className={styles.cwSeamFade} aria-hidden="true" />
        </div>
      </div>

      <ContactFormDialog
        ref={contactDialogRef}
        locale={locale}
        closeLabel={closeLabel}
        heading={contactDialogHeading}
      />
    </div>
  );
}
