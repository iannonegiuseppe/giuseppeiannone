import Image from "next/image";
import type { Image as SanityImage } from "sanity";
import { getTranslations } from "next-intl/server";
import { SignatureMark } from "./Logo";
import { urlFor } from "@/sanity/image";
import { aboutPath, type Locale } from "@/sanity/paths";
import styles from "./ChiSonoSection.module.scss";
import sharedStyles from "./sharedSections.module.scss";

// Same duplicated-per-file convention as RecognitionSection/HopeSection/
// JourneySection's own renderEmphasis — deliberately not shared, see this
// codebase's established habit of small single-purpose helpers over a
// premature shared abstraction.
function renderEmphasis(text: string, emphasisWord: string | undefined, emphasisClassName: string) {
  if (!emphasisWord) return text;
  const index = text.indexOf(emphasisWord);
  if (index === -1) return text;
  const before = text.slice(0, index);
  const after = text.slice(index + emphasisWord.length);
  return (
    <>
      {before}
      <em className={emphasisClassName}>{emphasisWord}</em>
      {after}
    </>
  );
}

// Chi sono section — homepage teaser between Diplomi and Areas, id
// "chi-sono" (the header's "Chi sono" nav link anchor-scrolls here for
// now — see headerNavItems.ts's PREVIEW_GATE_ANCHOR_OVERRIDES comment;
// the future full /chi-sono page this section's own optional storyLink
// points to is out of scope this pass, per chiSonoSection.ts's comment).
// Server component: resolves the portrait into a URL + lqip (same
// pattern as DiplomiSection's document images), and the "Leggi la mia
// storia" chrome string via getTranslations — server-side resolve +
// prop-pass, matching this codebase's established pattern (no component
// here calls next-intl's client-side useTranslations()).
export async function ChiSonoSection({
  kicker,
  title,
  titleEmphasisWord,
  paragraphs,
  pullQuote,
  portrait,
  portraitLqip,
  storyLink,
  signatureEnabled,
  locale,
}: {
  kicker: string;
  title: string;
  titleEmphasisWord?: string;
  paragraphs?: string[];
  pullQuote?: string;
  portrait?: (SanityImage & { alt?: string }) | undefined;
  portraitLqip?: string;
  storyLink?: { current?: string };
  signatureEnabled?: boolean;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "ChiSono" });

  // Image-resolution fix: the previous width(760) master was already
  // near/below the rendered CSS column's own 2x pixel need (a ~360-440px
  // column at device pixel ratio 2 needs ~720-880px of real source
  // data) — next/image can only ever DOWNSCALE from its src, so a master
  // this small produced a soft/blurry result at 2x no matter what `sizes`
  // said. 1600 comfortably covers 2x for the widest rendered column
  // (~430px desktop, per --chisono-portrait-width) with room to spare;
  // next/image's own responsive-source generation (same mechanism every
  // other Sanity image in this codebase already relies on, e.g.
  // DiplomiCardRow's thumbnails) still downsamples from this one master
  // per the `sizes` hint below, it just no longer runs out of real pixels
  // to downsample FROM at the top end.
  const portraitUrl = portrait
    ? urlFor(portrait).width(1600).format("webp").quality(80).url()
    : undefined;
  const hasStoryLink = Boolean(storyLink?.current);
  const showSignature = signatureEnabled ?? true;

  return (
    <section
      id="chi-sono"
      className={styles.chiSonoSection}
      data-lab-section="chi-sono"
      aria-labelledby="chi-sono-heading"
    >
      <div className={styles.chiSonoLayout}>
        <div className={styles.chiSonoPortraitCol}>
          <div className={styles.chiSonoPortraitFrame}>
            {portraitUrl ? (
              <Image
                src={portraitUrl}
                alt={portrait?.alt ?? ""}
                fill
                // Large-portrait pass: rendered width tracks the grid's
                // 1.1fr share of the row, not a fixed token — approximated
                // at the two breakpoints this pass's own QA measures
                // directly (~591px at 1440, ~436px at 1024) rather than a
                // vw-formula guess; re-measure via currentSrc if the grid
                // fractions ever change.
                sizes="(min-width: 90rem) 591px, (min-width: 64rem) 436px, 90vw"
                className={`${styles.chiSonoPortraitImg} ${sharedStyles.heroOverlapPhotoTreated}`}
                {...(portraitLqip
                  ? { placeholder: "blur" as const, blurDataURL: portraitLqip }
                  : {})}
              />
            ) : null}
          </div>
        </div>

        <div className={styles.chiSonoTextCol}>
          <p className={styles.chiSonoKicker}>
            <span className={styles.chiSonoKickerRule} aria-hidden="true" />
            {kicker}
          </p>
          <h2 id="chi-sono-heading" className={styles.chiSonoTitle}>
            {renderEmphasis(title, titleEmphasisWord, styles.chiSonoEmphasis!)}
          </h2>

          {paragraphs?.map((paragraph, i) => (
            <p key={i} className={styles.chiSonoParagraph}>
              {paragraph}
            </p>
          ))}

          {pullQuote ? <p className={styles.chiSonoPullQuote}>{pullQuote}</p> : null}

          <div className={styles.chiSonoFooter}>
            {hasStoryLink ? (
              <a href={aboutPath(locale)} className={styles.chiSonoStoryLink}>
                {t("storyLinkLabel")}
                <span aria-hidden="true"> →</span>
              </a>
            ) : null}
            {showSignature ? (
              // SignatureMark sets its own role="img"/aria-label (correct
              // in the header, where it's the only wordmark) — wrapped
              // aria-hidden here instead, since the name is already in
              // this section's own text content. margin-left: auto lives
              // on this wrapper (the actual flex child), not the svg
              // class itself, so the signature hugs the row's right edge
              // whether or not the story link renders before it.
              <span aria-hidden="true" className={styles.chiSonoSignatureWrap}>
                <SignatureMark className={styles.chiSonoSignature} />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
