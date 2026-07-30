import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import NextImage from "next/image";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import { AreeSection } from "@/components/AreeSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroOverlap } from "@/components/HeroOverlap";
import heroOverlapStyles from "@/components/HeroOverlap.module.scss";
import { HopeSection } from "@/components/HopeSection";
import { SignatureMark } from "@/components/Logo";
import { LenisProvider } from "@/components/LenisProvider";
import { LocationsSection, type SedeData } from "@/components/LocationsSection";
import { RecognitionSection } from "@/components/RecognitionSection";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import {
  type RealArticle,
  ResourcesSection,
} from "@/components/ResourcesSection";
import { sanityFetch } from "@/sanity/client";
import { resolveRobots } from "@/sanity/metadata";
import type { Locale } from "@/sanity/paths";
import {
  areasQuery,
  areeSectionQuery,
  ctaBridgeSectionQuery,
  homePageQuery,
  latestArticlesQuery,
  sedesQuery,
} from "@/sanity/queries";
import { getSiteSettings } from "@/sanity/seo";
import type { ResolvedQualification } from "@/components/DiplomiCardRow";
import { imageDimensions, urlFor } from "@/sanity/image";
import { ContactBlock } from "./density/ContactBlock";
import { CtaBridgeBlock } from "./CtaBridgeBlock";
import { DiplomiSlider } from "./density/DiplomiSlider";
import { HeroBackgroundVideo } from "./HeroBackgroundVideo";
import { HeroVideoActions } from "./HeroVideoActions";
import {
  CHI_SONO,
  METODO,
  THE_SPACE,
} from "./density/content";
import densityStyles from "./density/density.module.scss";
import metodoStyles from "./density/metodo.module.scss";
import { LocationsMarquee, type LocationsMarqueeItem } from "./density/LocationsMarquee";
import { MetodoInteractive } from "./density/MetodoInteractive";
import { ParallaxFrame } from "./density/ParallaxFrame";
import { ScrambleValue } from "./density/ScrambleValue";
import { SignatureBandTuned } from "./SignatureBandTuned";
import { VideoBlock } from "./VideoBlock";
import { ViewportWidthFix } from "./ViewportWidthFix";
import { WelcomeBlock } from "./density/WelcomeBlock";

const LOCALE: Locale = "it";

type DesignLabVariant = "light" | "dark";

interface QualificationItemData {
  _key: string;
  year: string;
  title: string;
  institution: string;
  tier: "titolo" | "formazione_continua";
  document?: SanityImage;
  documentLqip?: string;
}

interface AreeSectionData {
  kicker?: string;
  title?: string;
  intro?: string;
  // Card-grid rebuild pass: still fetched (areeSectionQuery), still a real
  // Sanity field — but no longer read here. AreeSection.tsx's own
  // "previewHover" prop was removed; see that file's own comment for why
  // (it faked clickability on non-interactive cards, which this pass's
  // brief explicitly forbids).
  previewHover?: boolean;
}

interface CtaBridgeSectionData {
  title?: string;
  titleEmphasis?: string;
  body?: string;
  linkLabel?: string;
}

interface AreaData {
  _id: string;
  title: string;
  descriptor: string;
  slug?: string;
}

interface HomePageData {
  hero?: {
    headline?: string;
    headlineEmphasisWord?: string;
    positioningStatement?: string;
    ctaLabel?: string;
    photo?: SanityImage;
    youtubeId?: string;
  };
  hope?: { eyebrow?: string; heading?: string; headingEmphasisWord?: string };
  // Copy pass: was hardcoded (content.ts's WELCOME constant) — now sourced
  // from Sanity like every other section, see homePage.ts's own "welcome"
  // field group.
  welcome?: {
    kicker?: string;
    title?: string;
    titleEmphasis?: string;
    paragraph?: string;
  };
  // Rebuild pass: was entirely hardcoded (content.ts's CREDENTIALS
  // constant) — now sourced from Sanity, see homePage.ts's own
  // "credentialsBand" field group.
  credentialsBand?: {
    eyebrow?: string;
    heading?: string;
    clinicalPracticeYears?: number;
    clinicalPracticeCaption?: string;
    clinicalPracticeDescription?: string;
    trainingYears?: number;
    trainingCaption?: string;
    trainingDescription?: string;
    locationsCount?: number;
    locationsCaption?: string;
    locationsDescription?: string;
    languagesValue?: string;
    languagesCaption?: string;
    languagesDescription?: string;
  };
  diplomi?: {
    kicker?: string;
    heading?: string;
    alboLine?: string;
    items?: QualificationItemData[];
  };
  recognition?: {
    kicker?: string;
    heading?: string;
    bridgeLine?: string;
    fragments?: {
      label: string;
      text: string;
      emphasisWord?: string;
      // Copy pass: was missing "anchor" — a real gap (the live dataset's
      // own anchor-tier fragment already existed before this pass), not
      // introduced by it. RecognitionSection's real prop type already
      // includes it; this local interface just hadn't caught up.
      tier: "anchor" | "dominant" | "peripheral";
    }[];
  };
  sedi?: { kicker?: string; heading?: string; paragraph?: string };
  risorse?: { kicker?: string; heading?: string; allArticlesLabel?: string };
  video?: {
    kicker?: string;
    heading?: string;
    lead?: string;
    videoUrl?: string;
    poster?: SanityImage;
    captionsUrl?: string;
  };
  finalCta?: {
    kicker?: string;
    heading?: string;
    body?: string;
    ctaLabel?: string;
    privacyNote?: string;
    responseNote?: string;
    googleProfileLabel?: string;
    photo?: SanityImage;
  };
  faq?: {
    kicker?: string;
    heading?: string;
    linkLabel?: string;
    items?: { _id: string; question: string; answer: unknown }[];
  };
}

// Same small substring-split-and-wrap helper CtaBridgeBlock.tsx already
// has (not exported there, so duplicated here rather than coupling the
// two files over one function) — used for Metodo's own heading <em>.
function renderHeadingEmphasis(text: string, emphasisWord: string, emphasisClassName: string) {
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

export function buildDesignLabMetadata(title: string): Metadata {
  return {
    title,
    robots: resolveRobots(true),
  };
}

// Interim stock fallback for the Locations marquee (structure pass) — see
// LocationsMarquee usage below for the full reasoning. Reserved/unused:
// public/interiors/interior-5.jpg (5 stock photos supplied, only 4
// physical locations to fill).
const INTERIOR_STOCK_FALLBACK: Record<string, string> = {
  "addr-1_sede-milano": "/interiors/interior-1.jpg", // Milano · Citylife
  "addr-2_sede-milano": "/interiors/interior-2.jpg", // Milano · Bicocca
  "addr-1_sede-monza": "/interiors/interior-3.jpg", // Monza
  "addr-2_sede-cernusco": "/interiors/interior-4.jpg", // Cernusco sul Naviglio
};

// Cyprus-style rebuild, shared between /design-lab (dark, primary since
// the Phase 2 default-theme switch) and /design-lab/light-mode (light,
// parked) — same structure, same components, same data fetching; only the
// token set differs (see _tokens.scss's own .themeDark block for the full
// reasoning). variant is threaded through to the handful of components
// whose STRUCTURE (not just color) changes between a light-page-with-
// dark-bands and an already-dark page: Contact (see its own top comment
// for why). Welcome no longer branches on variant at all — its A/B
// comparison was resolved and removed (see WelcomeBlock.tsx's own
// comment); it's colour/theme-only now, like every other block.
export async function DesignLabHomepage({
  variant,
}: {
  variant: DesignLabVariant;
}) {
  const [homePage, aree, areas, ctaBridge, siteSettings, realArticles, sedes] =
    await Promise.all([
      sanityFetch<HomePageData | null>(homePageQuery, { locale: LOCALE }, [
        "homePage",
      ]),
      sanityFetch<AreeSectionData | null>(
        areeSectionQuery,
        { locale: LOCALE },
        ["areeSection"],
      ),
      sanityFetch<AreaData[]>(areasQuery, { locale: LOCALE }, ["area"]),
      sanityFetch<CtaBridgeSectionData | null>(
        ctaBridgeSectionQuery,
        { locale: LOCALE },
        ["ctaBridgeSection"],
      ),
      getSiteSettings(LOCALE),
      sanityFetch<RealArticle[]>(latestArticlesQuery, { locale: LOCALE }, [
        "article",
      ]),
      sanityFetch<SedeData[]>(sedesQuery, { locale: LOCALE }, ["sede"]),
    ]);

  const metodo = METODO.it;
  const theSpace = THE_SPACE.it;
  const chiSonoText = CHI_SONO.it;

  const portraitUrl = "/design-lab/photos/01.webp";
  const portraitAlt = "Giuseppe Iannone, psicoterapeuta — ritratto";

  const roomPhotoUrl = "/design-lab/photos/11.webp";
  const roomPhotoAlt =
    "Lo studio: la finestra con vista sul verde, la scrivania con l'orchidea, durante una seduta.";

  // Diplomi rebuild — same resolution DiplomiSection.tsx already does
  // server-side for the real homepage (urlFor/imageDimensions), mirrored
  // here rather than reinvented: DiplomiSlider (client) never touches
  // Sanity image objects directly, same boundary the real component keeps.
  const resolvedQualifications: ResolvedQualification[] = (homePage?.diplomi?.items ?? []).map(
    (item) => {
      const dims = item.document ? imageDimensions(item.document) : null;
      return {
        id: item._key,
        year: item.year,
        title: item.title,
        institution: item.institution,
        thumbnailUrl: item.document ? urlFor(item.document).width(440).format("webp").url() : undefined,
        lightboxUrl: item.document ? urlFor(item.document).width(1400).format("webp").url() : undefined,
        lightboxLqip: item.documentLqip,
        width: dims?.width ?? 1400,
        height: dims?.height ?? 1980,
      };
    },
  );

  // Photo-swap pass: light-background portrait (03, gallery wall) replaces
  // the old dark-background one (04) — Welcome's photo panel only, per
  // this pass's own scope. Duplication checked first (not assumed): Hero
  // and Chi sono (01.webp) both already use an arms-crossed pose from the
  // same stock set as this one — flagged to the client, who chose to
  // proceed anyway. Note this file lives directly under public/design-lab
  // (not the photos/ subfolder the other Welcome-adjacent assets use).
  const welcomePhotoUrl = "/design-lab/03.webp";
  const welcomePhotoAlt = "Giuseppe Iannone, ritratto in una galleria, sfondo chiaro.";

  // Cyprus rebuild, item 16 — chose 09 over 12: 09 is a solo portrait,
  // direct gaze, plain background (reads cleanly next to a form on a dark
  // band); 12 is a two-person consulting-room shot — a contact-section
  // portrait should be Giuseppe alone (§10.9: one focal point per section).
  const contactPhotoUrl = "/design-lab/photos/09.webp";
  const contactPhotoAlt = "Giuseppe Iannone, ritratto.";

  // Locations marquee (structure pass, slot 13) — FALLBACK LOGIC written
  // so real photography replaces the interim stock automatically, no code
  // change: for each physical address, use addr.photo if Sanity has one
  // (none do yet — checked live, not assumed), else the assigned interim
  // stock file. §9 gate already applied to every file in public/interiors
  // before this pass (see this pass's own report) — all 5 are empty rooms,
  // no people, no staged session; none excluded.
  //
  // INTERIM MARKER: once real per-location interiors are uploaded to
  // Sanity (sede.addresses[].photo), this whole INTERIOR_STOCK_FALLBACK
  // map becomes dead weight — safe to delete then, not before. Also
  // registered in docs/pre-launch.md.
  const marqueeItems: LocationsMarqueeItem[] = [];
  for (const sede of sedes ?? []) {
    if (sede.isOnline) continue; // no physical interior to show
    for (const addr of sede.addresses ?? []) {
      const name = addr.district ? `${sede.city} · ${addr.district}` : sede.city;
      const fallbackKey = `${addr._key}_${sede._id}`;
      const photoUrl = addr.photo
        ? urlFor(addr.photo).width(640).format("webp").url()
        : INTERIOR_STOCK_FALLBACK[fallbackKey];
      if (!photoUrl) continue;
      marqueeItems.push({
        id: `${sede._id}-${addr._key}`,
        name,
        photoUrl,
        alt: `${name} — interno dello studio`,
      });
    }
  }

  return (
    <>
      {/* Dark-canvas fix: a tiny BLOCKING inline script, first thing in
          body, sets data-theme="dark" on <html> before the browser's
          first paint — synchronous inline scripts run during HTML
          parsing, before rendering proceeds, so there's no flash of the
          light background first. This one attribute is what activates
          _tokens.scss's :root[data-theme="dark"] block, which is what
          makes <body>'s own existing background-color: var(--color-bg)
          rule (design-lab-globals.scss, untouched) resolve dark — layout.tsx
          is shared with /design-lab and /design-lab/density, so it can't
          branch on the route itself; this is the one point where the
          variant IS known (DesignLabHomepage's own prop). Absent
          entirely on the light variant — light's <html> never gets this
          attribute, so :root[data-theme="dark"] never matches and
          nothing about that route changes. */}
      {variant === "dark" ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.theme="dark"`,
          }}
        />
      ) : null}
      <LenisProvider>
      <div className={variant === "dark" ? `${densityStyles.root} themeDark` : densityStyles.root}>
        <ViewportWidthFix />
        <Header
          locale={LOCALE}
          contactChannels={siteSettings?.contactChannels}
        />

        <main>
          {/* 1. Hero */}
          <HeroOverlap
            treatment="treated"
            headline={homePage?.hero?.headline ?? ""}
            headlineEmphasisWord={homePage?.hero?.headlineEmphasisWord}
            positioningStatement={homePage?.hero?.positioningStatement ?? ""}
            ctaLabel={homePage?.hero?.ctaLabel ?? ""}
            photo={homePage?.hero?.photo}
            youtubeId={homePage?.hero?.youtubeId}
            // Corrective pass: eyebrow is now the signature-only logo mark
            // (same asset Footer/Header use — components/Logo.tsx's
            // SignatureMark), not the author-credentials text line. Its
            // own built-in aria-label ("Dr. Giuseppe Iannone") is what
            // conveys meaning now that this slot no longer renders text —
            // no extra alt/aria needed, SignatureMark already sets
            // role="img" + aria-label itself. Sizing/color live in
            // HeroOverlap.module.scss's own .heroVideoEyebrow (imported
            // here since that class lives in a different component's
            // module — same cross-file className pattern already used
            // elsewhere in this codebase for CSS modules).
            eyebrow={<SignatureMark className={heroOverlapStyles.heroVideoEyebrow} />}
            backgroundMedia={
              <HeroBackgroundVideo
                // Real file, per this pass's own instruction — but NOT
                // verified end-to-end: 792MB, and Chromium never fired
                // loadedmetadata even after a 3-minute wait (no error
                // either) — almost certainly an unoptimized export (moov
                // atom not at the front, so the whole file must be
                // scanned before metadata is available) on top of being
                // wildly oversized for a web hero background regardless.
                // Needs re-encoding (H.264/H.265 MP4, faststart, a few MB
                // not hundreds) before this is actually usable — see this
                // pass's own report. Wired to the real path anyway, per
                // instruction, so swapping in a fixed export needs no
                // further code change.
                srcMp4="/video-placeholder.mov"
                // Poster: still the temporary interior-photo stand-in —
                // couldn't extract a real frame from the file above for
                // the same reason (browser couldn't decode/seek it).
                // Replace once a web-ready export exists.
                poster="/interiors/interior-3.jpg"
                posterAlt=""
              />
            }
            actions={
              <HeroVideoActions
                areeHref="#aree"
                areeLabel="Perché rivolgersi"
                contactLabel="Scrivimi"
                locale={LOCALE}
              />
            }
          />

          {/* 2. Ti riconosci (Recognition) — tone-mid. Was tone-base
              (unwrapped, same tone as Hero directly above it — one of the
              two same-tone adjacencies flagged in the Phase 2 tone-map
              report). toneMidWrap reassigns --color-bg/-text/-muted/
              -hairline/-line/-accent/-accent-hover locally
              (tone.tone-mid-surface), so RecognitionSection.tsx/.module.scss
              re-tone with zero edits to that file — same pattern already
              used for AreeSection/FaqSection/DiplomiSlider. Layout/copy/
              spacing untouched; only the wrapper is new. */}
          <div style={{ marginTop: "-1rem" }} className={densityStyles.toneMidWrap}>
            <RevealOnScroll>
              <RecognitionSection
                kicker={homePage?.recognition?.kicker ?? ""}
                heading={homePage?.recognition?.heading ?? ""}
                bridgeLine={homePage?.recognition?.bridgeLine ?? ""}
                fragments={homePage?.recognition?.fragments}
              />
            </RevealOnScroll>
          </div>

          {/* 3. Hope — light island (deliberate light interlude inside the
              otherwise-dark page, mirroring Cyprus's own reference — see
              this pass's own report). Was tone-deep/richDarkWrap; no grain/
              content sub-wrappers needed since a flat light surface has no
              vignette to stack above. */}
          <div className={densityStyles.hopeLightWrap}>
            <RevealOnScroll>
              <HopeSection
                eyebrow={homePage?.hope?.eyebrow ?? ""}
                heading={homePage?.hope?.heading ?? ""}
                headingEmphasisWord={homePage?.hope?.headingEmphasisWord}
                dividers
              />
            </RevealOnScroll>
          </div>

          {/* 4. Welcome — tone-base. Copy from Sanity (homePage.welcome),
              not the WELCOME.it constant anymore — see this pass's own
              report. */}
          <WelcomeBlock
            kicker={homePage?.welcome?.kicker ?? ""}
            title={homePage?.welcome?.title ?? ""}
            titleEmphasis={homePage?.welcome?.titleEmphasis ?? ""}
            paragraph={homePage?.welcome?.paragraph ?? ""}
            photoUrl={welcomePhotoUrl}
            photoAlt={welcomePhotoAlt}
            authorName={siteSettings?.author?.name ?? ""}
            authorCredentials={siteSettings?.author?.credentials}
            authorRegistrationNumber={siteSettings?.author?.registrationNumber}
            areas={areas}
            locale={LOCALE}
          />

          {/* 5. Credentials — light island (same mechanism as Hope, see
              tone.light-island-surface's own comment). Rebuild pass: real
              Sanity data (homePage.credentialsBand) replaces the old
              hardcoded CREDENTIALS constant; the "titoli e specializzazioni"
              qualifications list is gone entirely (it made this cell
              stretch, and duplicated Diplomi below, which is the real home
              for that content — see this pass's own report). No grain
              layer, same reasoning as Hope: a flat light surface has
              nothing to layer above. */}
          <section
            className={densityStyles.credentialsBandLight}
            aria-label="Credenziali"
          >
            <div className={densityStyles.credentialsInner}>
              <RevealOnScroll>
                <p className={densityStyles.credentialsKicker}>
                  <span className={densityStyles.credentialsKickerRule} aria-hidden="true" />
                  {homePage?.credentialsBand?.eyebrow ?? ""}
                </p>
                <h2 className={densityStyles.credentialsHeading}>
                  {homePage?.credentialsBand?.heading ?? ""}
                </h2>
                <AnimatedDivider className={densityStyles.credentialsRule} />
                {/* Three-level pass: .credentialsItem/-Value/-Caption are
                    SHARED with DensityPage.tsx's own (2-level, left-aligned,
                    dark, divided) Credentials render — confirmed via grep,
                    same cross-route sharing already found and split last
                    pass for .credentialsBand. Rather than mutate those
                    shared classes for a 3-level/centred/gold/dividerless
                    treatment DensityPage.tsx never asked for, this pass adds
                    parallel *Light-suffixed classes (credentialsListLight/
                    -ItemLight/-ValueLight/-CaptionLight) plus the wholly new
                    credentialsDescription — DensityPage.tsx's own render is
                    untouched, verified live (see this pass's own report). */}
                <ul className={densityStyles.credentialsListLight}>
                  <li className={densityStyles.credentialsItemLight}>
                    <p className={densityStyles.credentialsValueLight}>
                      <ScrambleValue value={String(homePage?.credentialsBand?.clinicalPracticeYears ?? "")} />
                    </p>
                    <p className={densityStyles.credentialsCaptionLight}>
                      {homePage?.credentialsBand?.clinicalPracticeCaption ?? ""}
                    </p>
                    <p className={densityStyles.credentialsDescription}>
                      {homePage?.credentialsBand?.clinicalPracticeDescription ?? ""}
                    </p>
                  </li>
                  <li className={densityStyles.credentialsItemLight}>
                    <p className={densityStyles.credentialsValueLight}>
                      <ScrambleValue value={String(homePage?.credentialsBand?.trainingYears ?? "")} />
                    </p>
                    <p className={densityStyles.credentialsCaptionLight}>
                      {homePage?.credentialsBand?.trainingCaption ?? ""}
                    </p>
                    <p className={densityStyles.credentialsDescription}>
                      {homePage?.credentialsBand?.trainingDescription ?? ""}
                    </p>
                  </li>
                  <li className={densityStyles.credentialsItemLight}>
                    <p className={densityStyles.credentialsValueLight}>
                      <ScrambleValue value={String(homePage?.credentialsBand?.locationsCount ?? "")} />
                    </p>
                    <p className={densityStyles.credentialsCaptionLight}>
                      {homePage?.credentialsBand?.locationsCaption ?? ""}
                    </p>
                    <p className={densityStyles.credentialsDescription}>
                      {homePage?.credentialsBand?.locationsDescription ?? ""}
                    </p>
                  </li>
                  <li className={densityStyles.credentialsItemLight}>
                    <p className={densityStyles.credentialsValueLight}>
                      <ScrambleValue value={homePage?.credentialsBand?.languagesValue ?? ""} />
                    </p>
                    <p className={densityStyles.credentialsCaptionLight}>
                      {homePage?.credentialsBand?.languagesCaption ?? ""}
                    </p>
                    <p className={densityStyles.credentialsDescription}>
                      {homePage?.credentialsBand?.languagesDescription ?? ""}
                    </p>
                  </li>
                </ul>
              </RevealOnScroll>
            </div>
          </section>

          {/* 6. Aree — tone-mid. AreeSection is a REAL shared component;
            the wrapper reassigns --color-text/-muted/-hairline/-accent
            locally (tone.tone-mid-surface), so its own row hairlines and
            numeral color re-tone with zero edits to that file.
            id="aree": Hero's video-hero "Perché rivolgersi" button scrolls
            here — added on this design-lab-owned wrapper, not on
            AreeSection.tsx itself (which only has id="aree-heading" on
            its own <h2>), so the real site's markup is untouched. */}
          <div id="aree" className={densityStyles.toneMidWrap}>
            <RevealOnScroll>
              <AreeSection
                kicker={aree?.kicker ?? ""}
                title={aree?.title ?? ""}
                intro={aree?.intro}
                areas={areas}
                locale={LOCALE}
              />
            </RevealOnScroll>
          </div>

          {/* 7. Method (Come si svolge) — light island, same mechanism as
            Hope/Credentials (tone.light-island-surface, _tone.scss). The
            existing .section stays untouched (shared with Chi Sono/Lo
            Spazio) — .metodoLightWrap is a new outer wrapper supplying the
            full-bleed ivory band + retoned tokens only. */}
          <div className={densityStyles.metodoLightWrap}>
            <section
              className={densityStyles.section}
              aria-labelledby="metodo-heading"
            >
              <p className={metodoStyles.eyebrow}>
                <span className={metodoStyles.eyebrowRule} aria-hidden="true" />
                Il percorso
              </p>
              <h2 id="metodo-heading" className={metodoStyles.heading}>
                {renderHeadingEmphasis(metodo.heading, metodo.headingEmphasis, metodoStyles.headingEmphasis!)}
              </h2>

              <MetodoInteractive steps={metodo.steps} />
            </section>
          </div>

          {/* 8. CTA bridge */}
          <RevealOnScroll>
            <CtaBridgeBlock
              title={ctaBridge?.title ?? ""}
              titleEmphasis={ctaBridge?.titleEmphasis}
              body={ctaBridge?.body ?? ""}
              linkLabel={ctaBridge?.linkLabel ?? ""}
            />
          </RevealOnScroll>

          {/* 9. Chi sono */}
          <section
            className={densityStyles.section}
            aria-labelledby="chi-sono-heading"
          >
            <RevealOnScroll>
              <h2 id="chi-sono-heading" className={densityStyles.heading}>
                {chiSonoText.title}{" "}
                <em className={densityStyles.emphasis}>{chiSonoText.emphasis}</em>
                {chiSonoText.titleEnd}
              </h2>

              <div className={densityStyles.chiSonoColumns}>
                <div className={densityStyles.chiSonoColumn}>
                  {chiSonoText.paragraphsBeforePhoto.map((p) => (
                    <p key={p} className={densityStyles.paragraph}>
                      {p}
                    </p>
                  ))}
                </div>
                <div className={densityStyles.chiSonoColumn}>
                  {chiSonoText.paragraphsAfterPhoto.map((p) => (
                    <p key={p} className={densityStyles.paragraph}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              <figure className={densityStyles.photoBreak}>
                <div className={densityStyles.photoFrame}>
                  <NextImage
                    src={portraitUrl}
                    alt={portraitAlt}
                    fill
                    sizes="(min-width: 82.5rem) 1224px, 100vw"
                    className={densityStyles.photoFrameImg}
                  />
                </div>
              </figure>
            </RevealOnScroll>
          </section>

          {/* 10. Diplomi (slider) — tone-mid. Full-bleed outer (background)
            + container-width inner (content), same split Hope/Credentials/
            Aree/FAQ all use — NOT .toneMidWrap directly on the .section
            element itself, which would only tint the container's own
            centered box (mixins.container's max-width), not the viewport
            edges, since .section already includes that constraint.
            Per-tone watermark/frame alpha handled inside
            diplomiSlider.module.scss itself via [data-tone] scoping. */}
          <div className={densityStyles.toneMidWrap} data-tone="mid">
            <section className={densityStyles.section} aria-labelledby="diplomi-block-heading">
              <DiplomiSlider
                headingId="diplomi-block-heading"
                alboLine={homePage?.diplomi?.alboLine}
                qualifications={resolvedQualifications}
              />
            </section>
          </div>

          {/* 11. Video */}
          <RevealOnScroll>
            <VideoBlock
              kicker={homePage?.video?.kicker}
              heading={homePage?.video?.heading}
              lead={homePage?.video?.lead}
              videoUrl={homePage?.video?.videoUrl}
              poster={homePage?.video?.poster}
              captionsUrl={homePage?.video?.captionsUrl}
              locale={LOCALE}
            />
          </RevealOnScroll>

          {/* 12. Locations (map) */}
          <RevealOnScroll>
            <LocationsSection
              kicker={homePage?.sedi?.kicker ?? ""}
              heading={homePage?.sedi?.heading ?? ""}
              paragraph={homePage?.sedi?.paragraph}
              sedes={sedes}
              locale={LOCALE}
            />
          </RevealOnScroll>

          {/* 13. Locations marquee (NEW) — tone-mid. Caption color comes
            from --color-accent-hover already (locationsMarquee.module.scss),
            which the tone-mid wrapper reassigns to --tone-mid-accent-small
            automatically — no edit needed in that file. */}
          <div className={densityStyles.toneMidWrap}>
            <section className={densityStyles.section} aria-label="Le sedi in fotografia">
              <LocationsMarquee items={marqueeItems} />
            </section>
          </div>

          {/* 14. Contact final — tone-deep */}
          <ContactBlock
            kicker={homePage?.finalCta?.kicker ?? ""}
            heading={homePage?.finalCta?.heading ?? ""}
            body={homePage?.finalCta?.body ?? ""}
            googleProfileLabel={homePage?.finalCta?.googleProfileLabel ?? ""}
            googleProfileUrl={siteSettings?.googleProfileUrl}
            locale={LOCALE}
            photoUrl={contactPhotoUrl}
            photoAlt={contactPhotoAlt}
          />

          {/* 15. Parallax (Lo spazio) — full-bleed frame keeps its own
            scroll mechanic untouched; heading/text above it gets the
            shared reveal. */}
          <section
            className={densityStyles.section}
            aria-labelledby="lo-spazio-heading"
          >
            <RevealOnScroll>
              <p className={densityStyles.metodoKicker} id="lo-spazio-heading">
                {theSpace.kicker}
              </p>

              <div className={densityStyles.spaceBlock}>
                <div className={densityStyles.spaceText}>
                  <h3 className={densityStyles.spaceHeading}>
                    {theSpace.blocks[0]?.heading}
                  </h3>
                  <p className={densityStyles.spaceParagraph}>
                    {theSpace.blocks[0]?.paragraph}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
            <figure className={densityStyles.fullBleedFrame}>
              <ParallaxFrame
                aspect={theSpace.blocks[0]?.aspect}
                label={`Frame A — ${theSpace.blocks[0]?.aspect}`}
                imageUrl={roomPhotoUrl}
                imageAlt={roomPhotoAlt}
              />
            </figure>
            <p className={densityStyles.photoCaption}>
              Lo studio: la finestra, la scrivania, l&apos;orchidea.
            </p>
          </section>

          {/* 16. Blog / Risorse */}
          <RevealOnScroll>
            <ResourcesSection
              kicker={homePage?.risorse?.kicker ?? ""}
              heading={homePage?.risorse?.heading ?? ""}
              locale={LOCALE}
              realArticles={realArticles}
              allArticlesLabel={homePage?.risorse?.allArticlesLabel ?? ""}
            />
          </RevealOnScroll>

          {/* 17. FAQ — tone-mid. Same wrapper mechanism as Aree: FaqSection's
            own accordion dividers/expand icons read --color-line/-hairline/
            -accent generically, so they re-tone with zero edits there. */}
          <div className={densityStyles.toneMidWrap}>
            <RevealOnScroll>
              <FaqSection
                kicker={homePage?.faq?.kicker ?? ""}
                heading={homePage?.faq?.heading ?? ""}
                linkLabel={homePage?.faq?.linkLabel ?? ""}
                locale={LOCALE}
                items={homePage?.faq?.items}
              />
            </RevealOnScroll>
          </div>

          {/* 18. Signature */}
          <RevealOnScroll>
            <SignatureBandTuned />
          </RevealOnScroll>
        </main>

        {/* 19. Footer */}
        <div className={densityStyles.richDarkWrap}>
          <div className={densityStyles.richDarkGrain} aria-hidden="true" />
          <div className={densityStyles.richDarkContent}>
            <Footer
              locale={LOCALE}
              authorName={siteSettings?.author?.name ?? ""}
              authorCredentials={siteSettings?.author?.credentials}
              authorRegistrationNumber={
                siteSettings?.author?.registrationNumber
              }
              contactChannels={siteSettings?.contactChannels}
              piva={siteSettings?.piva}
              sedes={sedes}
              crisisSupportText={siteSettings?.crisisSupportText}
              googleProfileUrl={siteSettings?.googleProfileUrl}
              socialLinks={siteSettings?.socialLinks}
            />
          </div>
        </div>
      </div>
    </LenisProvider>
    </>
  );
}
