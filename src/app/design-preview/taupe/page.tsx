import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isProductionDeployment, resolveRobots } from "@/sanity/metadata";
import { COPY } from "./copy";
import { HeroMedia } from "./HeroMedia";
import { PlayableStill } from "./PlayableStill";
import { RevealOnScroll } from "./RevealOnScroll";
import styles from "./page.module.scss";

// Design artifact for the client's video call — proves the client's own
// taupe/ivory palette in this project's established distinctive-
// composition design language (asymmetry, oversized numerals, dark
// atmospheric bands, overlapping photography), as the counter-example to
// his own templated composition (centred hero, plant-in-a-vase, icon
// rows, symmetric grids). Visual only: no Sanity, no CMS wiring, no
// working forms — see PlayableStill's own comment on why "The first
// session" is a click-to-play DEMO, not a real video.
//
// Patch pass: copy switched to English (internal-review version — see
// copy.ts, now the single place all strings live); hero portrait swapped
// for an ambient video (see HeroMedia.tsx) with a tonal-gradient
// fallback since no real asset exists yet; a hero->recognition gradient
// bridge added (the one intentional gradient on the page); three
// composition fixes (floating "05" numeral anchored to its content, the
// Chi sono/bio photo no longer overlapping any text, the hope-band photo
// swapped from a second portrait to a tonal atmospheric placeholder).
//
// Gated exactly like /styleguide and /design-lab: hard 404 in production
// (never just noindexed), noindex as a redundant second layer for the
// window while reachable on preview deployments.
export const metadata: Metadata = {
  title: "Design preview — Taupe (internal)",
  robots: resolveRobots(true),
};

const HERO_VIDEO_SRC = "/media/hero-ambient.mp4";
const HERO_POSTER_SRC = "/media/hero-ambient-poster.jpg";

// Server-side only (fs is unavailable client-side) — real existence
// check, not a guess, so the moment a developer drops the real files
// into /public/media/, this page renders the video automatically with
// no further code change.
function publicFileExists(publicPath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", publicPath));
  } catch {
    return false;
  }
}

export default function DesignPreviewTaupePage() {
  if (isProductionDeployment()) {
    notFound();
  }

  const hasHeroVideo = publicFileExists(HERO_VIDEO_SRC);

  return (
    <div className={styles.root} data-design-preview>
      {/* ================= 1. Hero — asymmetric ================= */}
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.heroEyebrow}>{COPY.hero.eyebrow}</p>
          <h1 className={styles.heroHeading}>
            {COPY.hero.headingBefore}
            <em className={styles.heroShine}>{COPY.hero.headingEmphasis}</em>
            {COPY.hero.headingAfter}
          </h1>
          <p className={styles.heroSub}>{COPY.hero.sub}</p>
          <a href="#percorso" className={styles.heroCta}>
            {COPY.hero.cta}
          </a>
        </div>
        <div className={styles.heroMedia}>
          <div className={styles.heroMediaFrame}>
            {/* Masked wrapper: only the video/placeholder + its own
                bottom-recolor overlay feather to transparent — the
                label below sits OUTSIDE this wrapper so it stays fully
                legible regardless of the bottom melt (see the SCSS
                file's own comment on why this needed splitting out). */}
            <div className={styles.heroMediaMasked}>
              <HeroMedia
                hasVideo={hasHeroVideo}
                videoSrc={HERO_VIDEO_SRC}
                posterSrc={HERO_POSTER_SRC}
              />
              <span className={styles.heroMediaBottomFade} aria-hidden="true" />
            </div>
            <span className={styles.heroMediaScrim} aria-hidden="true" />
            <span className={styles.heroMediaLabel}>{COPY.hero.videoLabel}</span>
          </div>
        </div>
      </header>

      <main>
      {/* ================= 2. Ti riconosci? — pull-quotes ================= */}
      <section className={styles.recognition} aria-labelledby="sg-recognition-heading">
        <RevealOnScroll>
          <h2 id="sg-recognition-heading" className={styles.recognitionHeading}>
            {COPY.recognition.heading}
          </h2>
        </RevealOnScroll>
        <div className={styles.recognitionList}>
          {COPY.recognition.lines.map((line, index) => (
            <RevealOnScroll key={line}>
              <p
                className={styles.recognitionLine}
                data-index={index}
              >
                {line}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ================= 3. Hope band — dark band + atmospheric placeholder ================= */}
      <section className={styles.hope} aria-labelledby="sg-hope-heading">
        <div className={styles.hopeBand}>
          <RevealOnScroll>
            <div className={styles.hopeText}>
              <p className={styles.hopeEyebrow}>{COPY.hope.eyebrow}</p>
              <h2 id="sg-hope-heading" className={styles.hopeHeading}>
                {COPY.hope.heading}
              </h2>
            </div>
          </RevealOnScroll>
        </div>
        {/* Patch pass: was a second Giuseppe portrait (near-identical to
            the Chi sono photo right after it) — replaced with a tonal
            atmospheric placeholder, per this task's own explicit
            instruction (this section is about the visitor's hope, not
            the therapist, and the repeated portrait undercut that). No
            real landscape/coastal stock asset exists in this repo, so
            this is a derived gradient block (--dp-bg-alt-2/--dp-secondary/
            --dp-accent-on-dark), not a fabricated photo reference. */}
        <div
          className={styles.hopePhotoWrap}
          aria-hidden="true"
        />
      </section>

      {/* ================= 4. How the journey works — earned numerals ================= */}
      <section id="percorso" className={styles.journey} aria-labelledby="sg-journey-heading">
        <RevealOnScroll>
          <h2 id="sg-journey-heading" className={styles.journeyHeading}>
            {COPY.journey.heading}
          </h2>
        </RevealOnScroll>
        <div className={styles.journeySteps}>
          {COPY.journey.steps.map((step, index) => (
            <RevealOnScroll key={step.numeral}>
              <div className={styles.journeyStep} data-stagger={index % 2}>
                <span className={styles.journeyNumeral} aria-hidden="true">
                  {step.numeral}
                </span>
                <div className={styles.journeyStepBody}>
                  <h3 className={styles.journeyStepTitle}>{step.title}</h3>
                  <p className={styles.journeyStepText}>{step.text}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ================= 5. Who I am — off-axis photo, numeral anchored to content ================= */}
      <section className={styles.bio} aria-labelledby="sg-bio-heading">
        <div className={styles.bioPhotoWrap}>
          <Image
            src="/design-lab/01.webp"
            alt="Giuseppe Iannone"
            fill
            sizes="(min-width: 64rem) 34vw, 80vw"
            className={styles.bioPhotoImg}
          />
        </div>
        <RevealOnScroll>
          <div className={styles.bioText}>
            {/* Patch pass: the "05" numeral used to float independently
                at top:1rem/right:4% of the whole section — detached from
                any content, reading as a stray artifact. Now positioned
                relative to THIS text block specifically (behind/above
                the eyebrow), the same "numeral marks its own content"
                relationship 01-04 already have with their steps. */}
            <span className={styles.bioNumeral} aria-hidden="true">
              05
            </span>
            <p className={styles.bioEyebrow}>{COPY.bio.eyebrow}</p>
            <h2 id="sg-bio-heading" className={styles.bioHeading}>
              {COPY.bio.heading}
            </h2>
            <p className={styles.bioBody}>{COPY.bio.body}</p>
            <p className={styles.bioCredentials}>{COPY.bio.credentials}</p>
          </div>
        </RevealOnScroll>
      </section>

      {/* ================= 6. How can I help you — typographic list ================= */}
      <section className={styles.areas} aria-labelledby="sg-areas-heading">
        <RevealOnScroll>
          <h2 id="sg-areas-heading" className={styles.areasHeading}>
            {COPY.areas.heading}
          </h2>
        </RevealOnScroll>
        <div className={styles.areasList}>
          {COPY.areas.items.map((area) => (
            <RevealOnScroll key={area.title}>
              <div className={styles.areasCard} data-size={area.size}>
                <h3 className={styles.areasCardTitle}>{area.title}</h3>
                <p className={styles.areasCardText}>{area.text}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ================= 7. The first session — click-to-play ================= */}
      <section className={styles.session} aria-labelledby="sg-session-heading">
        <RevealOnScroll>
          <div className={styles.sessionText}>
            <p className={styles.sessionEyebrow}>{COPY.session.eyebrow}</p>
            <h2 id="sg-session-heading" className={styles.sessionHeading}>
              {COPY.session.heading}
            </h2>
            <p className={styles.sessionBody}>{COPY.session.body}</p>
          </div>
        </RevealOnScroll>
        <div className={styles.sessionMedia}>
          <PlayableStill
            src="/design-lab/07.webp"
            alt=""
            label={COPY.session.label}
            activatedLabel={COPY.session.activatedLabel}
          />
        </div>
      </section>

      {/* ================= 8. Let's talk — contact ================= */}
      <section className={styles.contact} aria-labelledby="sg-contact-heading">
        <RevealOnScroll>
          <div className={styles.contactText}>
            <p className={styles.contactEyebrow}>{COPY.contact.eyebrow}</p>
            <h2 id="sg-contact-heading" className={styles.contactHeading}>
              {COPY.contact.heading}
            </h2>
            <p className={styles.contactBody}>{COPY.contact.body}</p>
            <a href="#" className={styles.contactCta}>
              {COPY.contact.cta}
            </a>
            <ul className={styles.contactList}>
              <li>
                <a href="tel:+390000000000" className={styles.contactLink}>
                  {COPY.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@example.com"
                  className={styles.contactLink}
                >
                  {COPY.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </RevealOnScroll>
        <a
          href="#"
          className={styles.contactMap}
          aria-label={COPY.contact.mapAriaLabel}
        >
          <span className={styles.contactMapPin} aria-hidden="true" />
          <span className={styles.contactMapLabel}>{COPY.contact.mapLabel}</span>
        </a>
      </section>
      </main>

      {/* ================= 9. Footer ================= */}
      <footer className={styles.footer}>
        <p className={styles.footerWordmark}>{COPY.footer.wordmark}</p>
        <p className={styles.footerCopyright}>{COPY.footer.copyright}</p>
      </footer>
    </div>
  );
}
