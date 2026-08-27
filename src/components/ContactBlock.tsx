"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import { ContactForm } from "./ContactForm";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import type { Locale } from "@/sanity/paths";
import styles from "./contactBlock.module.scss";

// Light-surface pass — reversed off tone-deep (dark) onto tone.light-
// island-surface (.contactLightWrap, contactBlock.module.scss), the last
// dark section on the page per this pass's own brief. Renders the shared
// ContactForm.tsx (validation, GDPR consent, submit mechanics) — also used
// by ContactFormDialog.tsx's homepage modal, one implementation since the
// step-6/7 merge (see ContactForm.tsx's own top comment). contactLab
// (Sanity) is this block's own independent kicker/heading/caption field
// group, separate from the shared finalCta above it in the schema;
// googleProfileLabel is the one exception, still read from finalCta since
// this pass never touched that field or its copy.
//
// No border at either the Spazi->Contact or Contact->"Lo spazio" junction
// (explicit correction this pass — every other tonal change on this page
// is a flat, undivided cut; a rule here would be the odd one out, and was
// also the leading suspect for an earlier, since-fixed dark-seam artefact
// elsewhere on this page).
export function ContactBlock({
  kicker,
  heading,
  headingEmphasisWord,
  photoCaption,
  googleProfileLabel,
  googleProfileUrl,
  locale,
  photoUrl,
  photoAlt,
}: {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  photoCaption: string;
  googleProfileLabel: string;
  googleProfileUrl?: string;
  locale: string;
  photoUrl: string;
  photoAlt: string;
}) {
  // Vertical-centering pass — the form column's midpoint has to match the
  // photo column's midpoint specifically, not the grid row's own auto-
  // height. Those aren't the same thing whenever the form (not the photo)
  // ends up being the taller of the two — confirmed live at 1024, where
  // the form's own content pushes it past the (now 15%-smaller) photo's
  // height: plain align-self:center degenerates to a no-op there, since a
  // grid row auto-sizes to its TALLEST item's own margin-box, and
  // centering an item within a space exactly equal to its own height has
  // no slack to move into. A pure-CSS calc() can't stand in for this
  // either — both heights are independently responsive (frame width is a
  // fraction of an fr-unit track; the heading wraps differently per
  // breakpoint), so there's no fixed relationship to hardcode. Measuring
  // both columns' actual rendered midpoints and translateY-ing the text
  // column to match is the same "can't be done in CSS alone, so measure
  // and drive a style value" idiom ChiSonoGlassCard.tsx's own seam-
  // detection effect already uses on this codebase — transform, not
  // margin, specifically because margin is part of the box grid auto-
  // sizing reads, which would feed back into the very row height this is
  // trying to correct against; transform never affects layout, so there's
  // no circularity.
  const photoColRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const [formOffsetPx, setFormOffsetPx] = useState(0);
  // Mirrors formOffsetPx for the effect below to read synchronously —
  // the effect only runs once (mount + resize, not on every state
  // change), so the offset captured in its own closure would otherwise
  // go stale after the first correction; a ref always reads the latest
  // value regardless of when the closure was created.
  const formOffsetRef = useRef(0);

  useEffect(() => {
    const photoEl = photoColRef.current;
    const textEl = textColRef.current;
    if (!photoEl || !textEl) return;

    let rafId: number | null = null;

    const measure = () => {
      rafId = null;
      // Below lg the columns stack (photo hidden entirely — see
      // .contactPhotoCol's own breakpoint-down(md) rule) and no offset
      // applies; reset it so a resize crossing the breakpoint downward
      // doesn't leave a stale transform behind.
      if (!window.matchMedia("(min-width: 64rem)").matches) {
        formOffsetRef.current = 0;
        setFormOffsetPx((prev) => (prev === 0 ? prev : 0));
        return;
      }
      // Read with the previous offset still applied but before any new
      // one — transform doesn't affect layout, so photoEl's own rect is
      // never influenced by textEl's transform either way; textEl's own
      // rect IS shifted by its current transform, so its un-transformed
      // midpoint is recovered by subtracting the offset already in play
      // (read from the ref, not the state closure — see that ref's own
      // comment for why).
      const photoRect = photoEl.getBoundingClientRect();
      const textRect = textEl.getBoundingClientRect();
      const photoMidpoint = (photoRect.top + photoRect.bottom) / 2;
      const textMidpointUntransformed = (textRect.top + textRect.bottom) / 2 - formOffsetRef.current;
      const nextOffset = photoMidpoint - textMidpointUntransformed;
      if (Math.abs(formOffsetRef.current - nextOffset) > 0.5) {
        formOffsetRef.current = nextOffset;
        setFormOffsetPx(nextOffset);
      }
    };

    const scheduleMeasure = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const emphasisIndex = headingEmphasisWord ? heading.indexOf(headingEmphasisWord) : -1;
  const headingNode =
    headingEmphasisWord && emphasisIndex !== -1 ? (
      <>
        {heading.slice(0, emphasisIndex)}
        <em className={styles.contactHeadingAccent}>{headingEmphasisWord}</em>
        {heading.slice(emphasisIndex + headingEmphasisWord.length)}
      </>
    ) : (
      heading
    );

  const replyLine = locale === "en" ? "I reply within 24 hours." : "Rispondo entro 24 ore.";

  return (
    <div id="contatto" className={styles.contactLightWrap}>
      <div className={styles.contactInner}>
        <RevealOnScroll className={styles.contactGrid}>
          {/* Columns swap pass: photo now first in the DOM (left column at
              lg+, matching the reference), form second — see
              contactBlock.module.scss's own comment on why this doesn't
              create a Tab-order mismatch at either breakpoint. */}
          <div className={styles.contactPhotoCol} ref={photoColRef}>
            <div className={styles.contactPhotoFrame}>
              <AnimatedDivider className={styles.contactPhotoRule} />
              <NextImage
                src={photoUrl}
                alt={photoAlt}
                fill
                sizes="(min-width: 64rem) 35vw, 100vw"
                className={styles.contactPhotoImg}
              />
            </div>
            <p className={styles.contactPhotoCaption}>{photoCaption}</p>
          </div>
          <div
            className={styles.contactTextCol}
            ref={textColRef}
            style={formOffsetPx ? { transform: `translateY(${formOffsetPx}px)` } : undefined}
          >
            {/* Correction pass: was bare text — every other kicker on this
                page (Diplomi/Sedi/Spazi/Pricing/Chi sono) precedes its
                label with the small .kickerRule dash; this one was missing
                it. Reused verbatim (same geometry AND same var(--color-
                line) treatment those instances actually use — see
                contactBlock.module.scss's own comment), not the accent/
                40%-alpha treatment this block's own full-width rule uses
                below the heading — that's a different, already-justified
                exception for that ONE rule, not the norm for kicker
                dashes. */}
            <p className={styles.contactKicker}>
              <span className={styles.contactKickerRule} aria-hidden="true" />
              {kicker}
            </p>
            <h2 className={styles.contactHeading} style={{ fontWeight: 400, fontSynthesis: "none" }}>
              {headingNode}
            </h2>
            {/* Correction pass: was a plain static <span> — now the
                project's own real animated rule component (src/components/
                AnimatedDivider.tsx, .divider class), reused rather than
                rebuilt. It already handles prefers-reduced-motion itself
                (skips attaching its observer, and its own CSS forces
                display:none on the sweep) — nothing extra needed here. */}
            <AnimatedDivider className={styles.contactRule} />
            <div className={styles.contactForm}>
              <ContactForm locale={locale as Locale} replyLine={replyLine} />
            </div>
            {googleProfileUrl ? (
              <a
                href={googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactGoogle}
              >
                {googleProfileLabel}
              </a>
            ) : null}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
