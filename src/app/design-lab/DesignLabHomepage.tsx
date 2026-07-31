import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AreeSection } from "@/components/AreeSection";
import { FaqSection } from "@/components/FaqSection";
import { Header } from "@/components/Header";
import { HeroOverlap } from "@/components/HeroOverlap";
import heroOverlapStyles from "@/components/HeroOverlap.module.scss";
import { HopeSection } from "@/components/HopeSection";
import { SignatureMark } from "@/components/Logo";
import { LenisProvider } from "@/components/LenisProvider";
import type { SedeData } from "@/components/LocationsSection";
import { SediBlock } from "@/components/SediBlock";
import { SediMapProvider } from "@/components/SediMapContext";
import { RecognitionSection } from "@/components/RecognitionSection";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { sanityFetch } from "@/sanity/client";
import { resolveRobots } from "@/sanity/metadata";
import type { Locale } from "@/sanity/paths";
import {
  areasQuery,
  areeSectionQuery,
  ctaBridgeSectionQuery,
  homePageQuery,
  latestArticlesLabQuery,
  sedesQuery,
} from "@/sanity/queries";
import { getSiteSettings } from "@/sanity/seo";
import { imageDimensions, urlFor } from "@/sanity/image";
import { ChiSonoBlock } from "@/components/ChiSonoBlock";
import { ContactBlock } from "@/components/ContactBlock";
import { CredentialsBand } from "@/components/CredentialsBand";
import { CtaBridgeBlock } from "@/components/CtaBridgeBlock";
import { DiplomiSlider, type DiplomiLabItem } from "@/components/DiplomiSlider";
import { FooterLab } from "@/components/FooterLab";
import { HeroBackgroundVideo } from "@/components/HeroBackgroundVideo";
import { HeroVideoActions } from "@/components/HeroVideoActions";
import {
  THE_SPACE,
} from "./density/content";
import densityStyles from "./density/density.module.scss";
import wrapperStyles from "@/components/sectionWrappers.module.scss";
import metodoStyles from "@/components/metodo.module.scss";
import { LocationsMarquee, type LocationsMarqueeItem } from "@/components/LocationsMarquee";
import marqueeStyles from "@/components/locationsMarquee.module.scss";
import { MetodoInteractive } from "@/components/MetodoInteractive";
import { ParallaxFrameStatic } from "@/components/ParallaxFrameStatic";
import { PricingBlock } from "@/components/PricingBlock";
import { ResourcesLab, type RealArticleLab } from "@/components/ResourcesLab";
import { SignatureBandTuned } from "@/components/SignatureBandTuned";
import { VideoBlock } from "@/components/VideoBlock";
import { ViewportWidthFix } from "./ViewportWidthFix";
import { WelcomeBlock } from "@/components/WelcomeBlock";

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
  // Privacy-gate pair (see homePage.ts's own comment on these two fields).
  // `document` above is untouched/unused by the new interactive-card
  // logic — that logic reads scan/scanRedacted exclusively.
  scan?: SanityImage;
  scanRedacted?: boolean;
  scanLqip?: string;
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
    // Stage 2c — ambient background-video variant (HeroBackgroundVideo/
    // HeroVideoActions), separate from youtubeId's click-to-play overlay
    // above. All three optional/independent — see homePage.ts's own
    // schema comment.
    backgroundVideoDesktopUrl?: string;
    backgroundVideoMobileUrl?: string;
    backgroundVideoPoster?: SanityImage;
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
    headingEmphasisWord?: string;
    intro?: string;
    alboLine?: string;
    items?: QualificationItemData[];
  };
  // Copy pass: was hardcoded (content.ts's METODO constant) — now sourced
  // from Sanity's own "metodo" field group, deliberately separate from
  // "percorso" (which feeds the real, live JourneySection) — see
  // homePage.ts's own comment on that field group for why.
  metodo?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    paragraph?: string;
    steps?: { title: string; shortLine: string }[];
  };
  // New pricing section (design-lab rebuild pass) — deliberately separate
  // from "prezzi" (the real, still-gated PricingSection's own field group,
  // whose layout is explicitly an open decision) — see homePage.ts's own
  // "tariffe" field group comment for the full reasoning.
  tariffe?: {
    eyebrow?: string;
    heading?: string;
    headingEmphasisWord?: string;
    rows?: { mode: string; subline: string; price: string }[];
    detailsItems?: string[];
    detrazioneFootnote?: string;
  };
  // Full-bleed rebuild pass — was hardcoded (content.ts's CHI_SONO
  // constant) — now sourced from Sanity's own "profilo" field group,
  // deliberately separate from "chiSonoSection" (the real, live
  // production singleton) — see homePage.ts's own comment on that field
  // group for why.
  profilo?: {
    eyebrow?: string;
    heading?: string;
    headingEmphasisWord?: string;
    paragraphs?: string[];
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
  locations?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    intro?: string;
    onlineSubLine?: string;
  };
  spaces?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    introLine?: string;
  };
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
  contactSection?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    photoCaption?: string;
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
  "addr-1_sede-milano": "/interiors/interior-1.jpg", // Milano · Via Buonarroti
  "addr-2_sede-milano": "/interiors/interior-2.jpg", // Milano · Via Trivulziana
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
      sanityFetch<RealArticleLab[]>(latestArticlesLabQuery, { locale: LOCALE }, [
        "article",
      ]),
      sanityFetch<SedeData[]>(sedesQuery, { locale: LOCALE }, ["sede"]),
    ]);

  // messages/{it,en}.json's Diplomi.closeLabel — resolved server-side and
  // passed down as a prop to every "use client" component that needs it
  // (DiplomiSlider, CtaBridgeBlock, WelcomeBlock — each wraps a dialog/
  // lightbox close button), matching this codebase's established
  // "server-resolved i18n string as a plain prop" convention (Footer.tsx
  // does the same). Design-lab-to-production migration pass: these three
  // used to hardcode the Italian literal "Chiudi" directly.
  const tDiplomi = await getTranslations({ locale: LOCALE, namespace: "Diplomi" });
  const closeLabel = tDiplomi("closeLabel");

  const theSpace = THE_SPACE.it;

  // Stage 2c — hero background-video poster, same fallback chain as
  // production: homePage.hero.backgroundVideoPoster if set, else the
  // same hardcoded placeholder interior photo this slot has always used.
  const heroPosterUrl = homePage?.hero?.backgroundVideoPoster
    ? urlFor(homePage.hero.backgroundVideoPoster).url()
    : "/interiors/interior-3.jpg";

  const portraitUrl = "/design-lab/photos/01.webp";
  const portraitAlt = "Giuseppe Iannone, psicoterapeuta — ritratto";

  const roomPhotoUrl = "/design-lab/photos/11.webp";
  const roomPhotoAlt =
    "Lo studio: la finestra con vista sul verde, la scrivania con l'orchidea, durante una seduta.";

  // Privacy-gate pass: interactivity is computed HERE, server-side, from
  // scan + scanRedacted — never left to the client to infer, and never
  // read from `document` (the older, separate field this array item type
  // also carries — untouched, unused by this logic; see homePage.ts's own
  // comment). lightboxUrl is a URL STRING built with urlFor, which is a
  // free string construction, not a network request — the actual fetch
  // only happens once an <Image>/<img> element pointing at it is mounted,
  // which DiplomiSlider's own lightbox only does after first open (see
  // that file's own comment) — this is what keeps "not on page load, not
  // on hover" true despite computing the URL for every interactive item
  // eagerly here. Capped at 2000px per this pass's own spec (was 1400px
  // under the old `document`-based resolution) — the source scans run
  // ~5000px wide, so this is still a real reduction, not just a
  // width-router formality. scanLqip (a tiny inline base64 data URI from
  // Sanity's own asset metadata, already present in the page's own JSON
  // payload — not a discrete network request) is what the hover-crop
  // reads instead of a real image fetch, satisfying "no scan image
  // requested … on hover" literally: the browser's network panel shows
  // nothing for it, because there's nothing to show.
  const diplomiLabItems: DiplomiLabItem[] = (homePage?.diplomi?.items ?? []).map((item) => {
    const interactive = Boolean(item.scan) && item.scanRedacted === true;
    const dims = item.scan ? imageDimensions(item.scan) : null;
    return {
      id: item._key,
      year: item.year,
      title: item.title,
      institution: item.institution,
      interactive,
      scanLqip: interactive ? item.scanLqip : undefined,
      lightboxUrl:
        interactive && item.scan
          ? urlFor(item.scan).width(2000).quality(82).format("webp").url()
          : undefined,
      width: dims?.width ?? 1400,
      height: dims?.height ?? 1980,
    };
  });

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
  // Photo-strip intro-line gate (this pass): true only once EVERY item
  // pushed below came from a real addr.photo, not the interim stock
  // fallback — see LocationsMarquee.tsx's own comment for why. Starts
  // true, flips to false the first time a stock fallback is actually used;
  // also forced false below if the strip ends up empty.
  let allPhotosReal = true;
  // Correction pass: addr.district on the two Milano addresses holds the
  // name of the third-party medical centre hosting each studio — dropped
  // from this caption entirely (matches SediBlock.tsx's own fix to the
  // list/popup side of the same data). The two Milano captions are given
  // verbatim by this pass's own brief (street-based, not derived from the
  // address string — "Piazza della Trivulziana 4/A" reads as "VIA
  // TRIVULZIANA" in the caption, which a mechanical derivation would get
  // wrong), so they're a small, explicit lookup rather than a district
  // fallback. Monza/Cernusco keep their existing city-only caption (no
  // district either way).
  const MILANO_STREET_CAPTION: Record<string, string> = {
    "Via Michelangelo Buonarroti 41": "Milano · Via Buonarroti",
    "Piazza della Trivulziana 4/A": "Milano · Via Trivulziana",
  };
  for (const sede of sedes ?? []) {
    if (sede.isOnline) continue; // no physical interior to show
    for (const addr of sede.addresses ?? []) {
      const name = MILANO_STREET_CAPTION[addr.address] ?? sede.city;
      const fallbackKey = `${addr._key}_${sede._id}`;
      const photoUrl = addr.photo
        ? urlFor(addr.photo).width(640).format("webp").url()
        : INTERIOR_STOCK_FALLBACK[fallbackKey];
      if (!photoUrl) continue;
      if (!addr.photo) allPhotosReal = false;
      marqueeItems.push({
        id: `${sede._id}-${addr._key}`,
        name,
        photoUrl,
        alt: `${name} — interno dello studio`,
      });
    }
  }
  if (marqueeItems.length === 0) allPhotosReal = false;

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
                // Stage 2c — Sanity-driven, same fields and fallback
                // chain as production (see homePage.ts's own schema
                // comment). Neither set -> no <video> mounts, poster
                // above (heroPosterUrl) is the whole hero.
                srcDesktop={homePage?.hero?.backgroundVideoDesktopUrl}
                srcMobile={homePage?.hero?.backgroundVideoMobileUrl}
                poster={heroPosterUrl}
                posterAlt=""
              />
            }
            actions={
              <HeroVideoActions
                areeHref="#aree"
                areeLabel="Perché rivolgersi"
                contactLabel="Scrivimi"
                locale={LOCALE}
                closeLabel={closeLabel}
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
            closeLabel={closeLabel}
          />

          {/* 5. Credentials — extracted to its own component
              (design-lab-to-production migration), see CredentialsBand.tsx's
              own comment. The "titoli e specializzazioni" qualifications
              list stays gone entirely (it made this cell stretch, and
              duplicated Diplomi below, which is the real home for that
              content — see the earlier §9-compliance pass's own report). */}
          <CredentialsBand
            eyebrow={homePage?.credentialsBand?.eyebrow ?? ""}
            heading={homePage?.credentialsBand?.heading ?? ""}
            items={[
              {
                value: String(homePage?.credentialsBand?.clinicalPracticeYears ?? ""),
                caption: homePage?.credentialsBand?.clinicalPracticeCaption ?? "",
                description: homePage?.credentialsBand?.clinicalPracticeDescription ?? "",
              },
              {
                value: String(homePage?.credentialsBand?.trainingYears ?? ""),
                caption: homePage?.credentialsBand?.trainingCaption ?? "",
                description: homePage?.credentialsBand?.trainingDescription ?? "",
              },
              {
                value: String(homePage?.credentialsBand?.locationsCount ?? ""),
                caption: homePage?.credentialsBand?.locationsCaption ?? "",
                description: homePage?.credentialsBand?.locationsDescription ?? "",
              },
              {
                value: homePage?.credentialsBand?.languagesValue ?? "",
                caption: homePage?.credentialsBand?.languagesCaption ?? "",
                description: homePage?.credentialsBand?.languagesDescription ?? "",
              },
            ]}
          />

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
                {homePage?.metodo?.kicker ?? ""}
              </p>
              <h2 id="metodo-heading" className={metodoStyles.heading}>
                {renderHeadingEmphasis(
                  homePage?.metodo?.heading ?? "",
                  homePage?.metodo?.headingEmphasisWord ?? "",
                  metodoStyles.headingEmphasis!,
                )}
              </h2>

              <MetodoInteractive steps={homePage?.metodo?.steps ?? []} />
            </section>
          </div>

          {/* 7b. Tariffe — tone-mid, the SAME mechanism Aree already uses
            (tone.tone-mid-surface via .toneMidWrap), reused rather than a
            new one. Sits between Metodo (light) and CTA bridge (deep) so
            no two adjacent sections share a tone — see this pass's own
            report for the full alternation table. PricingBlock is a new,
            self-painted full-width component (AreeSection's own
            structural pattern), so — unlike Metodo — needs no extra
            full-bleed wrapper beyond .toneMidWrap itself. */}
          <div className={densityStyles.toneMidWrap}>
            <RevealOnScroll>
              <PricingBlock
                eyebrow={homePage?.tariffe?.eyebrow ?? ""}
                heading={homePage?.tariffe?.heading ?? ""}
                headingEmphasisWord={homePage?.tariffe?.headingEmphasisWord}
                rows={homePage?.tariffe?.rows ?? []}
                detailsItems={homePage?.tariffe?.detailsItems ?? []}
                detrazioneFootnote={homePage?.tariffe?.detrazioneFootnote ?? ""}
              />
            </RevealOnScroll>
          </div>

          {/* 8. CTA bridge */}
          <RevealOnScroll>
            <CtaBridgeBlock
              title={ctaBridge?.title ?? ""}
              titleEmphasis={ctaBridge?.titleEmphasis}
              body={ctaBridge?.body ?? ""}
              linkLabel={ctaBridge?.linkLabel ?? ""}
              locale={LOCALE}
              closeLabel={closeLabel}
            />
          </RevealOnScroll>

          {/* 9. Chi sono (Profilo) — full-bleed rebuild, own component:
            background photo + scrim + mirrored reveal, no tone wrapper
            (stays on the page's own ambient dark theme). See
            ChiSonoBlock.tsx's own comment for the reuse-vs-new call and
            the reveal mechanism. */}
          <ChiSonoBlock
            eyebrow={homePage?.profilo?.eyebrow ?? ""}
            heading={homePage?.profilo?.heading ?? ""}
            headingEmphasisWord={homePage?.profilo?.headingEmphasisWord}
            paragraphs={homePage?.profilo?.paragraphs ?? []}
            photoUrl={portraitUrl}
            photoAlt={portraitAlt}
          />

          {/* 10. Diplomi (slider) — light-island pass: was tone-mid (a dark-
            on-dark card row that read as near-invisible against its own
            surround), now ivory via .diplomiLightWrap (density.module.scss,
            tone.light-island-surface — same mechanism Hope/Metodo/CTA
            bridge already use). data-tone="mid" removed — that attribute
            drove diplomiSlider.module.scss's own [data-tone="mid"]
            overrides for .frame/.yearWatermark alpha, tuned specifically
            for tone-mid's warm-tan background; without it, both fall back
            to their own base values, which were already commented "tuned
            against tone-base (ivory)" — exactly this surface.

            Heading-zone pass: design-lab-to-production migration — the
            copy that used to be DRAFT/hardcoded inside DiplomiSlider.tsx
            now lives in homePage.diplomi.kicker/.heading/
            .headingEmphasisWord/.intro/.alboLine, the SAME fields the
            now-retired production DiplomiSection route used to read
            (src/app/[locale]/page.tsx swaps to this same DiplomiSlider —
            both consumers read the identical shared data now, by design). */}
          <div className={densityStyles.diplomiLightWrap}>
            <section className={densityStyles.section} aria-labelledby="diplomi-block-heading">
              <DiplomiSlider
                headingId="diplomi-block-heading"
                kicker={homePage?.diplomi?.kicker ?? ""}
                heading={homePage?.diplomi?.heading ?? ""}
                headingEmphasisWord={homePage?.diplomi?.headingEmphasisWord}
                intro={homePage?.diplomi?.intro}
                alboLine={homePage?.diplomi?.alboLine}
                closeLabel={closeLabel}
                items={diplomiLabItems}
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

          {/* 12. Sedi (map) — light-surface pass: mid-tone green
            (.sediWrap, sediSection.module.scss, tone.tone-mid-surface —
            the SAME token/mixin the strip already used before this pass).
            Forked from the shared LocationsSection (SediBlock/
            SediInteractive/SediMap/SediPopupContent) — see SediBlock.tsx's
            own comment for why: homePage.sedi/sede documents are read by
            the real production route too, and this pass's changes (new
            copy, popup weighting, address-list affordance, restored
            attribution) would otherwise leak there. SediMapProvider is
            the shared activeId source for both this block and the photo
            strip below (part (d) of this pass's own proposal — a strip
            photo click flies the map to that location, same as clicking
            its address). */}
          <SediMapProvider>
            <RevealOnScroll>
              <SediBlock
                kicker={homePage?.locations?.kicker ?? ""}
                heading={homePage?.locations?.heading ?? ""}
                headingEmphasisWord={homePage?.locations?.headingEmphasisWord}
                intro={homePage?.locations?.intro}
                onlineSubLine={homePage?.locations?.onlineSubLine}
                sedes={sedes}
                locale={LOCALE}
              />
            </RevealOnScroll>

            {/* 13. Photo strip — correction pass: reversed off ivory back
              onto Sedi's own mid-tone surface (.toneMidWrap, the same
              shared class/token every other tone-mid consumer on this
              page uses) — the strip is semantically part of the map
              block, not its own tonal moment; see LocationsMarquee's own
              top comment. Wrapping <section> uses the new .stripSection
              (locationsMarquee.module.scss) instead of the shared
              .section, so no top padding re-introduces the gap this pass
              cuts. */}
            <div className={densityStyles.toneMidWrap}>
              <section className={marqueeStyles.stripSection} aria-label="Gli spazi in fotografia">
                <LocationsMarquee
                  kicker={homePage?.spaces?.kicker ?? ""}
                  heading={homePage?.spaces?.heading ?? ""}
                  headingEmphasisWord={homePage?.spaces?.headingEmphasisWord}
                  introLine={homePage?.spaces?.introLine}
                  allPhotosReal={allPhotosReal}
                  items={marqueeItems}
                />
              </section>
            </div>
          </SediMapProvider>

          {/* 14. Contact final — light-surface pass: reversed off tone-deep
            onto light-island (.contactLightWrap, contactBlock.module.scss),
            the last dark section on this page per that pass's own brief.
            contactSection is this block's own independent kicker/heading/
            caption field group (separate from the shared finalCta above,
            same reasoning as locations/spaces) — googleProfileLabel is the
            one field still read from finalCta, untouched by this pass. */}
          <ContactBlock
            kicker={homePage?.contactSection?.kicker ?? ""}
            heading={homePage?.contactSection?.heading ?? ""}
            headingEmphasisWord={homePage?.contactSection?.headingEmphasisWord}
            photoCaption={homePage?.contactSection?.photoCaption ?? ""}
            googleProfileLabel={homePage?.finalCta?.googleProfileLabel ?? ""}
            googleProfileUrl={siteSettings?.googleProfileUrl}
            locale={LOCALE}
            photoUrl={contactPhotoUrl}
            photoAlt={contactPhotoAlt}
          />

          {/* 15. "Lo spazio" — CSS-only reveal pass. Image only, per this
            pass's own brief: the kicker/heading/paragraph and the photo
            caption are no longer rendered here. THE_SPACE's own data
            (content.ts) and roomPhotoUrl/roomPhotoAlt above are untouched —
            still hardcoded, not CMS, exactly as they were before this
            pass (see this pass's own report on where they live); this is
            a presentation-only change, nothing deleted.
            aria-labelledby dropped along with the heading it pointed
            to — pointing it at a removed id would be a dangling
            reference, not a preserved one.
            Height/edges correction pass: was the shared .section (its own
            padding-block + .fullBleedFrame's own margin-top were what let
            the raw root show through above/below — see density.module.
            scss's own comment). Now .spaceSection (no padding, no
            border) + .fullBleedFrame with the .spaceFrameFlush modifier
            (zero margin) — .section and .fullBleedFrame themselves stay
            exactly as they are for every other consumer. */}
          <section className={wrapperStyles.spaceSection}>
            <figure className={`${wrapperStyles.fullBleedFrame} ${wrapperStyles.spaceFrameFlush}`}>
              <ParallaxFrameStatic
                aspect={theSpace.blocks[0]?.aspect}
                imageUrl={roomPhotoUrl}
                imageAlt={roomPhotoAlt}
              />
            </figure>
          </section>

          {/* 16. Blog / Risorse — overlay-hero pass: light-green surface
            (tone-mid, the same .toneMidWrap mechanism Aree/FAQ/Sedi use),
            ResourcesLab is an independent fork (see that file's own top
            comment) — the real, shared ResourcesSection/ResourceColumn/
            FeaturedResource are all untouched. */}
          <div className={densityStyles.toneMidWrap}>
            <RevealOnScroll>
              <ResourcesLab
                kicker={homePage?.risorse?.kicker ?? ""}
                heading={homePage?.risorse?.heading ?? ""}
                locale={LOCALE}
                realArticles={realArticles}
                allArticlesLabel={homePage?.risorse?.allArticlesLabel ?? ""}
              />
            </RevealOnScroll>
          </div>

          {/* 17. FAQ — light-island pass: was .toneMidWrap, now
            .faqLightWrap (see density.module.scss's own comment). Wrapper
            swap only — FaqSection.tsx/.module.scss/FaqAccordion.tsx are
            all untouched, every colour they read is generic and already
            covered by light-island-surface's reassignment list. */}
          <div className={densityStyles.faqLightWrap}>
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

          {/* 18. Signature — light-island pass: previously unwrapped (raw
            root). SignatureBandTuned now reads its own fork
            (signatureBandTuned.module.scss) whose .signature colour
            depends on this wrapper's retoning. Reveal mechanism itself
            (the --reveal listener, rAF throttle, ResizeObserver,
            fallback timeouts) is untouched. */}
          <div className={densityStyles.signatureLightWrap}>
            <RevealOnScroll>
              <SignatureBandTuned />
            </RevealOnScroll>
          </div>
        </main>

        {/* 19. Footer — tone-mid pass: dark, on the lighter green
          (--color-surface via .toneMidWrap, same mechanism Sedi/Spazi/
          Risorse already use), replacing the old richDarkWrap/
          richDarkGrain/richDarkContent triad (rich-dark-surface gradient +
          grain + tone-deep-foreground). FooterLab is an independent fork
          (see that file's own top comment) — the real, shared Footer.tsx/
          Footer.module.scss are untouched. */}
        <div className={densityStyles.toneMidWrap}>
          <FooterLab
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
            emergencyContacts={siteSettings?.emergencyContacts}
            googleProfileUrl={siteSettings?.googleProfileUrl}
            socialLinks={siteSettings?.socialLinks}
          />
        </div>
      </div>
    </LenisProvider>
    </>
  );
}
