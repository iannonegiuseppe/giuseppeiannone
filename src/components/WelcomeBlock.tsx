"use client";

import { useLayoutEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import type { AreaRow } from "@/components/AreeSection";
import { Button } from "@/components/Button";
import { ContactFormDialog, type ContactFormDialogHandle } from "@/components/ContactFormDialog";
import { ShimmerText } from "@/components/ShimmerText";
import type { Locale } from "@/sanity/paths";
import styles from "./welcome.module.scss";

function WelcomeLeftContent({
  areas,
  contactDialogRef,
  authorName,
  authorCredentials,
  authorRegistrationNumber,
  contactLabel,
}: {
  areas?: AreaRow[];
  contactDialogRef: React.RefObject<ContactFormDialogHandle | null>;
  authorName: string;
  authorCredentials?: string;
  authorRegistrationNumber?: string;
  contactLabel: string;
}) {
  return (
    <>
      {/* §9: area names are permitted facts (what is treated), never
          outcome/duration/benefit language — no checkmarks either (a tick
          next to a disorder name reads as a promise of outcome). Area-fold
          pass: always plain text now — the conditional link branch
          (area.slug) is REMOVED, not kept dormant; `slug` no longer exists
          on this data at all (see AreaRow's own comment in
          AreeSection.tsx), and a future individual-area page will almost
          certainly be a pillarPage reference, an architecturally
          different mechanism this branch never fed anyway. */}
      {areas && areas.length > 0 ? (
        <ul className={styles.welcomeAreasList}>
          {areas.map((area) => (
            <li key={area._key} className={styles.welcomeAreaItem}>
              <span className={styles.welcomeAreaDash} aria-hidden="true" />
              <span className={styles.welcomeAreaText}>{area.title}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* §9: "Scrivimi"/"Message me" only — no free-session/urgency
          framing. Reuses Hero.contactLabel (messages/{it,en}.json) — same
          string as Hero's own trigger button, not a duplicate copy. */}
      <Button
        type="button"
        variant="primary"
        tone="mid"
        className={styles.welcomeCta}
        onClick={() => contactDialogRef.current?.open()}
      >
        {contactLabel}
      </Button>

      {/* §9: identity + registration disclosure only — no
          qualifications/years/counts, which the Credentials band already
          covers. Sourced from siteSettings.author (real CMS data, same
          fields Footer.tsx already uses), never hardcoded. */}
      <div className={styles.welcomeSignature}>
        <AnimatedDivider className={styles.welcomeSignatureRule} />
        <div className={styles.welcomeSignatureRow}>
          <p className={styles.welcomeSignatureName}>{authorName}</p>
          <p className={styles.welcomeSignatureReg}>
            {authorCredentials ?? "Psicologo Psicoterapeuta"}
            <br />
            Albo Lombardia n. {authorRegistrationNumber ?? "[segnaposto]"}
          </p>
        </div>
      </div>
    </>
  );
}

function WelcomeTopZone({
  kicker,
  title,
  titleEmphasis,
  paragraph,
}: {
  kicker: string;
  title: string;
  titleEmphasis: string;
  paragraph: string;
}) {
  return (
    <div className={styles.welcomeTopZone}>
      <p className={styles.welcomeKicker}>{kicker}</p>
      <h2 className={styles.welcomeHeading}>
        {title}{" "}
        <ShimmerText className={styles.welcomeEmphasis}>{titleEmphasis}</ShimmerText>
      </h2>
      <p className={styles.welcomeParagraph}>{paragraph}</p>
    </div>
  );
}

type WelcomeBlockProps = {
  kicker: string;
  title: string;
  titleEmphasis: string;
  paragraph: string;
  photoUrl: string;
  photoAlt: string;
  authorName: string;
  authorCredentials?: string;
  authorRegistrationNumber?: string;
  areas?: AreaRow[];
  locale: Locale;
  closeLabel: string;
  contactDialogHeading: string;
  contactLabel: string;
};

// Consolidation pass: this was a temporary A/B comparison shell (two full
// structural variants behind a photoVariant prop). Giuseppe approved
// variant B (narrow card + photo tucked to the container edge with a
// gradient seam) — that's now the only Welcome layout. The portrait-panel
// variant, the photoVariant fork, and the welcome-b comparison routes were
// all deleted in the same pass (see docs/pre-launch.md's own git history
// for what the removed variant looked like, and this pass's own report).
export function WelcomeBlock({
  kicker,
  title,
  titleEmphasis,
  paragraph,
  photoUrl,
  photoAlt,
  authorName,
  authorCredentials,
  authorRegistrationNumber,
  areas,
  locale,
  closeLabel,
  contactDialogHeading,
  contactLabel,
}: WelcomeBlockProps) {
  const [revealed, setRevealed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const contactDialogRef = useRef<ContactFormDialogHandle>(null);

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

  return (
    <div className={styles.welcomeOuterMid}>
      <div className={styles.welcomeInner}>
        <div ref={rootRef} className={styles.welcomeCard} data-revealed={revealed}>
          <div className={styles.welcomeContent}>
            <WelcomeTopZone
              kicker={kicker}
              title={title}
              titleEmphasis={titleEmphasis}
              paragraph={paragraph}
            />
            <div className={styles.welcomeLowerZone}>
              <WelcomeLeftContent
                areas={areas}
                contactDialogRef={contactDialogRef}
                authorName={authorName}
                authorCredentials={authorCredentials}
                authorRegistrationNumber={authorRegistrationNumber}
                contactLabel={contactLabel}
              />
            </div>
          </div>

          {/* Photo sits entirely outside the card (the card is narrowed to
              its own text width — see welcome.module.scss), tucked behind
              the card's right edge by a modest amount, extended to the
              container's own content edge on the right. Square corners on
              all four sides. No vertical protrusion — top/bottom flush
              with the card. Comes AFTER the content in DOM order so
              mobile's normal flow places it below the content instead of
              behind it (position:absolute only applies from md up). */}
          <div className={styles.welcomePhotoLayer}>
            <NextImage
              src={photoUrl}
              alt={photoAlt}
              fill
              sizes="(min-width: 48rem) 36vw, 100vw"
              className={styles.welcomePhotoImg}
            />
          </div>

          {/* Static seam-blend overlay — card-surface colour (the same
              token the card itself uses, so it recolours automatically
              with the active theme), fading left-to-right, spanning only
              the photo's own left portion. Never animates; only
              welcomePhotoLayer above carries the reveal mask. Hidden below
              md (mobile stacks the photo below the content, so there's no
              seam to blend there). */}
          <div className={styles.welcomeSeamFade} aria-hidden="true" />
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
