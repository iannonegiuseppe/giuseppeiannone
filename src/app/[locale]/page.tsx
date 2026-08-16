import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AreeSection, type AreaRow } from "@/components/AreeSection";
import { HeroBackgroundVideo } from "@/components/HeroBackgroundVideo";
import { HeroOverlap } from "@/components/HeroOverlap";
import heroOverlapStyles from "@/components/HeroOverlap.module.scss";
import { HeroVideoActions } from "@/components/HeroVideoActions";
import { HopeSection } from "@/components/HopeSection";
import { FaqSection } from "@/components/FaqSection";
import type { SedeData } from "@/components/LocationsSection";
import { SignatureMark } from "@/components/Logo";
import { RecognitionSection } from "@/components/RecognitionSection";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { sanityFetch } from "@/sanity/client";
import { resolveDiplomiLabItems, type QualificationItemData } from "@/sanity/diplomi";
import { urlFor } from "@/sanity/image";
import type { Locale } from "@/sanity/paths";
import {
  homePageQuery,
  latestArticlesLabQuery,
  sedesQuery,
} from "@/sanity/queries";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";
// Design-lab-to-production migration — these now render in place of
// JourneySection/ChiSonoSection/DiplomiSection (all three still real
// files, just no longer imported here — see this file's own comments at
// each render site for why). ChiSonoBlock/DiplomiSlider/WelcomeBlock/
// MetodoInteractive and their SCSS modules (plus QualificationLightboxLab,
// pulled in by DiplomiSlider) were moved from src/app/design-lab/density/
// into src/components/ — that directory belongs to the separate, out-of-
// scope /design-lab/density route and is slated for removal/re-gating; a
// production page can't depend on it. These are no longer forks, they're
// the real shared implementation now. sectionWrappers.module.scss is a
// NEW file, split out of density.module.scss (which stays in design-lab,
// still backing dozens of sections this page never renders) — it holds
// only the wrapper classes this page actually uses, as mixins
// density.module.scss's own same-named classes now @include too, so
// there's one source of truth, not two copies that can drift.
import { ChiSonoBlock } from "@/components/ChiSonoBlock";
import { DiplomiSlider, type DiplomiLabItem } from "@/components/DiplomiSlider";
import { MetodoInteractive } from "@/components/MetodoInteractive";
import metodoStyles from "@/components/metodo.module.scss";
import sectionWrapperStyles from "@/components/sectionWrappers.module.scss";
// Stage 2b-2 — migrate the remaining homepage sections: production now
// renders design-lab's rebuild of every section still on the OLD visual
// language (CtaBridgeSection -> CtaBridgeBlock, VideoSection -> VideoBlock,
// LocationsSection -> SediBlock, FinalContactSection -> ContactBlock,
// ResourcesSection -> ResourcesLab, SignatureBand -> SignatureBandTuned),
// same mechanism Stage 2b already used for Metodo/Chi sono/Diplomi. The
// six real components this replaces (CtaBridgeSection.tsx/VideoSection.tsx/
// LocationsSection.tsx/FinalContactSection.tsx/ResourcesSection.tsx/
// SignatureBand.tsx, plus their .module.scss files) are untouched and
// still on disk — just no longer imported here, per the same "don't
// delete a route/component, just stop rendering it" precedent Stage 2b
// set for JourneySection/ChiSonoSection/DiplomiSection.
import { WelcomeBlock } from "@/components/WelcomeBlock";
import { CredentialsBand } from "@/components/CredentialsBand";
import { PricingBlock } from "@/components/PricingBlock";
import { CtaBridgeBlock } from "@/components/CtaBridgeBlock";
import { VideoBlock } from "@/components/VideoBlock";
import { SediBlock } from "@/components/SediBlock";
import { SediMapProvider } from "@/components/SediMapContext";
import { LocationsMarquee, type LocationsMarqueeItem } from "@/components/LocationsMarquee";
import marqueeStyles from "@/components/locationsMarquee.module.scss";
import { ContactBlock } from "@/components/ContactBlock";
import { ParallaxFrameStatic } from "@/components/ParallaxFrameStatic";
import { ResourcesLab, type RealArticleLab } from "@/components/ResourcesLab";
import { SignatureBandTuned } from "@/components/SignatureBandTuned";

// PREVIEW-GATE (temporary) — restoring the rest of the real homepage:
// 1. Restore these imports (uncomment): FormazioneBand, PricingSection,
//    from "@/components/*".
// 2. In Home(), restore `formazione`/`prezzi`-driven sections into the
//    Promise.all as needed.
// 3. In the JSX, uncomment the remaining FormazioneBand/PricingSection
//    block below and place it where the PreviewPlaceholderSection stand-in
//    used to sit before the placeholder-removal pass took it out of the
//    homepage flow entirely (component itself untouched — see
//    PreviewPlaceholderSection.tsx's own comment; it's still the standard
//    device for any future gated homepage anchor, just has no current call
//    site). Note this comment moved alongside the Tariffe section in the
//    Stage 2b-2 reorder — Tariffe (homePage.tariffe, PricingBlock) is a
//    separate, already-live field/component, not a lift of this gate.
// Gated sections: FormazioneBand, Pricing — content/design decisions
// still pending on both, per that pass's own instruction (do not touch).
// import { FormazioneBand } from "@/components/FormazioneBand";
// import { PricingSection } from "@/components/PricingSection";

interface HomePageData {
  title?: string;
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
  chiSono?: {
    introHeading?: string;
    introLinkLabel?: string;
    kicker?: string;
    heading?: string;
    bio?: string;
    methodsBody?: string;
    storyLinkLabel?: string;
    watermarkText?: string;
    photo?: SanityImage;
  };
  formazione?: {
    kicker?: string;
    credentials?: string[];
    counters?: { value: number; label: string }[];
  };
  // Homepage-fold pass: folded in from the standalone areeSection
  // document (now deprecated/hidden — see homePage.ts's own schema
  // comment). Same three fields; previewHover wasn't carried over (dead
  // already, see AreeSection.tsx's own comment).
  aree?: {
    kicker?: string;
    title?: string;
    intro?: string;
    items?: AreaRow[];
  };
  // Homepage-fold pass: folded in from the standalone ctaBridgeSection
  // document (now deprecated/hidden).
  ctaBridge?: {
    title?: string;
    titleEmphasis?: string;
    body?: string;
    linkLabel?: string;
  };
  diCosa?: {
    kicker?: string;
    heading?: string;
    linkLabel?: string;
    areas?: { title: string; subItems?: string[] }[];
    photo?: SanityImage;
  };
  hope?: { eyebrow?: string; heading?: string; headingEmphasisWord?: string };
  // Copy pass: was hardcoded (design-lab's WELCOME constant) — now sourced
  // from Sanity like every other section, see homePage.ts's own "welcome"
  // field group.
  welcome?: {
    kicker?: string;
    title?: string;
    titleEmphasis?: string;
    paragraph?: string;
  };
  // Rebuild pass: was entirely hardcoded (design-lab's CREDENTIALS
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
  // DEPRECATED as of the design-lab-to-production migration — see
  // homePage.ts's own schema comment. No longer rendered (superseded by
  // "metodo" below); kept typed/fetched since the underlying field group
  // is intentionally left intact, not deleted.
  percorso?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    paragraph?: string;
    steps?: { title: string; shortLine: string; expandedText: string }[];
  };
  metodo?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    paragraph?: string;
    steps?: { title: string; shortLine: string }[];
  };
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
      tier: "dominant" | "peripheral";
    }[];
  };
  // Stage 2b-2 rename pass: DEPRECATED in favour of "locations" below (see
  // homePage.ts's own schema comment) — kept typed/fetched, data left
  // intact, not deleted. Nothing in this file reads it anymore.
  sedi?: { kicker?: string; heading?: string; paragraph?: string };
  // New "Sedi" field group (Stage 2b-2 rename pass, was sediLab) — see
  // homePage.ts's own schema comment for the full rename history.
  locations?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    intro?: string;
    onlineSubLine?: string;
  };
  // New "Spazi" (photo strip) field group (Stage 2b-2 rename pass, was
  // spaziLab) — see homePage.ts's own schema comment.
  spaces?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    introLine?: string;
  };
  // New "Tariffe" field group (design-lab-only until this pass) —
  // deliberately separate from "prezzi" (the real, still-gated
  // PricingSection's own field, whose layout is explicitly an open
  // decision) — see homePage.ts's own "tariffe" field group comment.
  tariffe?: {
    eyebrow?: string;
    heading?: string;
    headingEmphasisWord?: string;
    rows?: { mode: string; subline: string; price: string }[];
    detailsItems?: string[];
    detrazioneFootnote?: string;
  };
  prezzi?: {
    kicker?: string;
    heading?: string;
    body?: string;
    buttonLabel?: string;
    showPrices?: boolean;
    priceLines?: { label: string; price: string; unit: string }[];
    footnote?: string;
    noPricesSentence?: string;
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
  // New "Contact" field group (design-lab-only until this pass, was
  // contactLab) — separate from the shared finalCta above;
  // googleProfileLabel is the one field still read from finalCta, see the
  // ContactBlock render site below.
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

// EN GATE LIFTED: homePage-en now has real (translated, still
// placeholder-marked — see scripts/patch-homepage-en.ts's own comment)
// content on the current schema, so the hardcoded IT redirect and the
// hreflang suppression this comment used to document are both removed.
// `en: "/en"` is restored below; proxy.ts's own matching
// EN_GATED_PATHNAMES block should be removed in lockstep (see that
// file).
// Same small substring-split-and-wrap helper DesignLabHomepage.tsx/
// CtaBridgeBlock.tsx/PricingBlock.tsx/ChiSonoBlock.tsx each already have
// their own copy of — matching this codebase's established convention
// (see ChiSonoBlock.tsx's own comment) rather than extracting a shared
// one. Used for Metodo's heading <em> here.
function renderHeadingEmphasis(text: string, emphasisWord: string | undefined, emphasisClassName: string) {
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

// Stage 2b-2 — copied verbatim from DesignLabHomepage.tsx's own interim
// fallback (structure pass, slot 13): for each physical address, use
// addr.photo if Sanity has one (none do yet — checked live, not assumed),
// else the assigned interim stock file. §9 gate already applied to every
// file in public/interiors (see design-lab's own pass report) — all 5 are
// empty rooms, no people, no staged session; none excluded. Reserved/
// unused: public/interiors/interior-5.jpg (5 stock photos supplied, only
// 4 physical locations to fill).
//
// INTERIM MARKER: once real per-location interiors are uploaded to
// Sanity (sede.addresses[].photo), this whole map becomes dead weight —
// safe to delete then, not before. Also registered in docs/pre-launch.md.
const INTERIOR_STOCK_FALLBACK: Record<string, string> = {
  "addr-1_sede-milano": "/interiors/interior-1.jpg", // Milano · Via Buonarroti
  "addr-2_sede-milano": "/interiors/interior-2.jpg", // Milano · Via Trivulziana
  "addr-1_sede-monza": "/interiors/interior-3.jpg", // Monza
  "addr-2_sede-cernusco": "/interiors/interior-4.jpg", // Cernusco sul Naviglio
};

// Stage 2b-2 — copied verbatim from DesignLabHomepage.tsx's own lookup:
// addr.district on the two Milano addresses holds the name of the
// third-party medical centre hosting each studio — dropped from this
// caption entirely (matches SediBlock.tsx's own fix to the list/popup
// side of the same data). The two Milano captions are given verbatim
// (street-based, not derived from the address string), Monza/Cernusco
// keep their existing city-only caption.
const MILANO_STREET_CAPTION: Record<string, string> = {
  "Via Michelangelo Buonarroti 41": "Milano · Via Buonarroti",
  "Piazza della Trivulziana 4/A": "Milano · Via Trivulziana",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const siteSettings = await getSiteSettings(locale);

  return await buildMetadata({
    locale: locale as Locale,
    title: "Giuseppe Iannone",
    seo: siteSettings?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: { it: "/", en: "/en" },
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Diplomi/Metodo/Profilo/Faq/FinalContact/Aree/CtaBridge's data all
  // come straight off the same homePage fetch (homePage.diplomi.items /
  // .metodo / .profilo / .faq / .finalCta / .aree / .ctaBridge), no
  // separate query. Homepage-fold pass: areeSection/ctaBridgeSection/area
  // are no longer fetched here at all — areeSection/ctaBridgeSection had
  // already gone the same way in an earlier pass (deprecated/orphaned,
  // superseded by a homePage field group, same status chiSonoSection has
  // long had); area's own rows now live at homePage.aree.items directly
  // (see area.ts's own schema comment for why folding it in cost nothing
  // — its slug field was empty on all 12 documents and backed by no
  // route). sedes (Locations/"Sedi") is the one remaining separate plain
  // list type feeding this page (`sede`), tagged "sede" for the
  // revalidation webhook.
  //
  // Stage 2b-2: realArticles now comes off latestArticlesLabQuery (was
  // latestArticlesQuery) — ResourcesLab needs cover+body on top of the
  // title/slug/publishedAt the old, real ResourcesSection read; see that
  // query's own comment for why it's a separate query, not an extension.
  const [homePage, siteSettings, realArticles, sedes] = await Promise.all([
    sanityFetch<HomePageData | null>(homePageQuery, { locale }, ["homePage"]),
    getSiteSettings(locale),
    sanityFetch<RealArticleLab[]>(latestArticlesLabQuery, { locale }, ["article"]),
    sanityFetch<SedeData[]>(sedesQuery, { locale }, ["sede"]),
  ]);

  // messages/{it,en}.json's Diplomi.closeLabel — resolved server-side,
  // passed down as a prop to every "use client" component that needs it
  // (DiplomiSlider, CtaBridgeBlock, WelcomeBlock — each wraps a dialog/
  // lightbox close button, matching this codebase's established
  // "server-resolved i18n string as a plain prop" convention; Footer.tsx
  // does the same).
  const tDiplomi = await getTranslations({ locale, namespace: "Diplomi" });
  const closeLabel = tDiplomi("closeLabel");

  // Same convention as closeLabel above — ContactFormDialog's <h2> was
  // hardcoded "Scrivimi" regardless of locale (a real bug on /en), fixed
  // by resolving messages/{it,en}.json's new ContactDialog.heading here
  // and passing it down the same three prop chains as closeLabel.
  const tContactDialog = await getTranslations({ locale, namespace: "ContactDialog" });
  const contactDialogHeading = tContactDialog("heading");

  // Stage 2c fix — Hero's two action buttons (video-background variant):
  // design-lab hardcodes their labels as Italian literals directly in
  // HeroVideoActions' own call site (LOCALE is always "it" there), which
  // can't carry over here — production serves /en too. messages/{it,en}
  // .json's new Hero.areeLabel/.contactLabel keys are this pass's own
  // addition, not a pre-existing catalog entry.
  const tHero = await getTranslations({ locale, namespace: "Hero" });
  // Reused below for WelcomeBlock's own CTA button too — same
  // "Scrivimi"/"Message me" string, not a second copy of it.
  const heroContactLabel = tHero("contactLabel");

  // Chi sono pass — extracted to src/sanity/diplomi.ts's own
  // resolveDiplomiLabItems, now the one place this gate is computed
  // (scan + scanRedacted, never `document`, the older separate field this
  // array item type also carries) — the Chi sono page needed the exact
  // same logic for its own qualifications section and a duplicated copy
  // would have been free to drift from this one.
  const diplomiLabItems: DiplomiLabItem[] = resolveDiplomiLabItems(homePage?.diplomi?.items);

  // Stage 2c — hero background-video poster, fallback chain per explicit
  // instruction: homePage.hero.backgroundVideoPoster if set, else the
  // same hardcoded placeholder interior photo this slot has always used
  // — so the hero's own LCP element never renders blank mid-migration,
  // whether or not the client has uploaded a real poster yet.
  const heroPosterUrl = homePage?.hero?.backgroundVideoPoster
    ? urlFor(homePage.hero.backgroundVideoPoster).url()
    : "/interiors/interior-3.jpg";

  // Stage 2b-2 — Welcome/Chi sono/Contact/Lo spazio photos: same static
  // asset references design-lab uses (not new Sanity image fields — this
  // migration's own brief was "use the existing photos as plain static
  // assets", matching Metodo/CTA bridge's own established pattern for
  // /design-lab imagery, and Chi sono's own portraitUrl already set this
  // precedent on this file before this pass). Alt text is hardcoded
  // Italian regardless of locale, same as Chi sono's own pre-existing
  // photoAlt above — an asset description tied to a specific stock photo,
  // not CMS copy; flagged in this pass's own report, not silently
  // resolved as an i18n gap.
  const welcomePhotoUrl = "/design-lab/03.webp";
  const welcomePhotoAlt = "Giuseppe Iannone, ritratto in una galleria, sfondo chiaro.";

  const portraitUrl = "/design-lab/photos/01.webp";
  const portraitAlt = "Giuseppe Iannone, psicoterapeuta — ritratto";

  const contactPhotoUrl = "/design-lab/photos/09.webp";
  const contactPhotoAlt = "Giuseppe Iannone, ritratto.";

  const roomPhotoUrl = "/design-lab/photos/11.webp";
  const roomPhotoAlt =
    "Lo studio: la finestra con vista sul verde, la scrivania con l'orchidea, durante una seduta.";

  // Stage 2b-2 — Locations marquee ("Spazi"), same fallback logic as
  // design-lab's own (see INTERIOR_STOCK_FALLBACK/MILANO_STREET_CAPTION
  // above): for each physical address, use addr.photo if Sanity has one,
  // else the assigned interim stock file. allPhotosReal gates
  // LocationsMarquee's own introLine (true only once every item came from
  // a real addr.photo, not the interim stock fallback).
  const marqueeItems: LocationsMarqueeItem[] = [];
  let allPhotosReal = true;
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
    <main>
      {/* Stage 2c fix: matches design-lab's own Hero exactly now (was the
          only permitted difference in this pass's own acceptance test,
          per explicit instruction to close it anyway). eyebrow is the
          signature-only logo mark (SignatureMark, same asset Footer/
          Header use), not author-credentials text — its own built-in
          aria-label ("Dr. Giuseppe Iannone") carries the meaning.
          backgroundMedia/actions are pre-rendered ReactNodes, same pattern
          HeroOverlap.tsx already established for both slots. */}
      <HeroOverlap
        treatment="treated"
        headline={homePage?.hero?.headline ?? ""}
        headlineEmphasisWord={homePage?.hero?.headlineEmphasisWord}
        positioningStatement={homePage?.hero?.positioningStatement ?? ""}
        ctaLabel={homePage?.hero?.ctaLabel ?? ""}
        photo={homePage?.hero?.photo}
        youtubeId={homePage?.hero?.youtubeId}
        eyebrow={<SignatureMark className={heroOverlapStyles.heroVideoEyebrow} />}
        backgroundMedia={
          <HeroBackgroundVideo
            // Stage 2c — Sanity-driven. Both fields optional/independent;
            // homePage.ts's own schema comment has the full reasoning for
            // why desktop/mobile are two separate uploads rather than one
            // file resized. Neither set -> no <video> mounts, poster
            // above (heroPosterUrl, its own fallback chain) is the whole
            // hero, exactly as before this field group existed.
            srcDesktop={homePage?.hero?.backgroundVideoDesktopUrl}
            srcMobile={homePage?.hero?.backgroundVideoMobileUrl}
            poster={heroPosterUrl}
            posterAlt=""
          />
        }
        actions={
          <HeroVideoActions
            areeHref="#aree"
            areeLabel={tHero("areeLabel")}
            contactLabel={heroContactLabel}
            locale={locale as Locale}
            closeLabel={closeLabel}
            contactDialogHeading={contactDialogHeading}
          />
        }
      />

      {/* Stage 2c fix: Recognition was left unwrapped by Stage 2b-2's own
          scope omission (see that pass's own report) — toneMidWrap
          reassigns --color-bg/-text/-muted/-hairline/-line/-accent/
          -accent-hover locally (tone.tone-mid-surface), matching
          design-lab's own wrapper exactly, same pattern AreeSection/
          FaqSection/DiplomiSlider already use. Layout/copy/spacing
          untouched; only the wrapper is new. */}
      <div
        style={{ marginTop: "-1rem" }}
        className={`${sectionWrapperStyles.toneMidWrap} ${sectionWrapperStyles.sheenWrap}`}
        data-sheen="upper-left"
      >
        <RevealOnScroll>
          <RecognitionSection
            kicker={homePage?.recognition?.kicker ?? ""}
            heading={homePage?.recognition?.heading ?? ""}
            bridgeLine={homePage?.recognition?.bridgeLine ?? ""}
            fragments={homePage?.recognition?.fragments}
          />
        </RevealOnScroll>
      </div>

      {/* Stage 2c fix: Hope was left unwrapped by Stage 2b-2's own scope
          omission — a light island (deliberate light interlude inside the
          otherwise-dark page), matching design-lab's own wrapper exactly.
          Unwrapped, HopeSection picks up --color-accent directly (gold
          under the dark theme); hopeLightWrap is what makes its
          foreground tokens resolve against the light-island surface
          instead. No grain/content sub-wrappers needed since a flat light
          surface has no vignette to stack above. */}
      <div className={sectionWrapperStyles.hopeLightWrap}>
        <RevealOnScroll>
          <HopeSection
            eyebrow={homePage?.hope?.eyebrow ?? ""}
            heading={homePage?.hope?.heading ?? ""}
            headingEmphasisWord={homePage?.hope?.headingEmphasisWord}
          />
        </RevealOnScroll>
      </div>

      {/* Stage 2b-2 — Welcome, new to production (design-lab-to-production
          migration). Copy from Sanity (homePage.welcome). */}
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
        areas={homePage?.aree?.items}
        locale={locale as Locale}
        closeLabel={closeLabel}
        contactDialogHeading={contactDialogHeading}
        contactLabel={heroContactLabel}
      />

      {/* Stage 2b-2 — Credentials, new to production (design-lab-to-
          production migration). See CredentialsBand.tsx's own comment. */}
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

      {/* Un-gated in the Aree section pass — data comes from its own
          areeSection + area fetches above, not homePage.diCosa. Supersedes
          the still-gated ConcernsSection below (removed from that block —
          see this file's own import-block comment). Stage 2b-2: repositioned
          only (was between Chi sono and CTA bridge).
          Stage 2c fix: toneMidWrap was left off by Stage 2b-2's own scope
          omission — added now, matching design-lab's own wrapper exactly,
          including its id="aree" — this pass also wires up Hero's own
          video-hero actions (HeroVideoActions), whose "Perché rivolgersi"
          button scrolls here, so the id is live, not just kept for
          exactness. */}
      <div
        id="aree"
        className={`${sectionWrapperStyles.toneMidWrap} ${sectionWrapperStyles.sheenWrap}`}
        data-sheen="upper-left"
      >
        <RevealOnScroll>
          <AreeSection
            kicker={homePage?.aree?.kicker ?? ""}
            title={homePage?.aree?.title ?? ""}
            intro={homePage?.aree?.intro}
            areas={homePage?.aree?.items}
          />
        </RevealOnScroll>
      </div>

      {/* Design-lab-to-production migration: MetodoInteractive replaces
          JourneySection here — homePage.percorso (kicker/heading/steps,
          including the click-to-expand expandedText panel) is no longer
          rendered anywhere; homePage.metodo (title + shortLine per step
          only) is the new source. id="metodo" preserves the header nav
          anchor JourneySection's own root used to carry. Stage 2b-2:
          repositioned only (was right after Hope) to match design-lab's
          own order — internals untouched. */}
      <div className={sectionWrapperStyles.metodoLightWrap}>
        <section
          id="metodo"
          className={sectionWrapperStyles.section}
          aria-labelledby="metodo-heading"
        >
          <p className={metodoStyles.eyebrow}>
            <span className={metodoStyles.eyebrowRule} aria-hidden="true" />
            {homePage?.metodo?.kicker ?? ""}
          </p>
          <h2 id="metodo-heading" className={metodoStyles.heading}>
            {renderHeadingEmphasis(
              homePage?.metodo?.heading ?? "",
              homePage?.metodo?.headingEmphasisWord,
              metodoStyles.headingEmphasis!,
            )}
          </h2>
          <MetodoInteractive steps={homePage?.metodo?.steps ?? []} />
        </section>
      </div>

      {/* PREVIEW-GATE (temporary) — real section, preserved verbatim.
          Placeholder-removal pass: the PreviewPlaceholderSection stand-in
          that used to sit here (id="formazione") is gone — FormazioneBand
          stays gated (content/design decisions still pending), but the
          homepage no longer shows any visible placeholder for it.
          Reversal: uncomment the block below, verbatim, unchanged — plus
          the import and Promise.all restorations noted at the top of this
          file.
      <FormazioneBand
        kicker={homePage?.formazione?.kicker ?? ""}
        credentials={homePage?.formazione?.credentials}
        counters={homePage?.formazione?.counters}
      />
      */}

      {/* Stage 2b-2 — Tariffe, new to production (design-lab-to-production
          migration). Deliberately separate from the still-gated
          PricingSection/homePage.prezzi above (see PREVIEW-GATE comment) —
          that decision is untouched, do not lift it as part of this
          section. toneMidWrap: the same tone-mid mechanism Aree already
          used pre-migration on design-lab, now shared via
          sectionWrappers.module.scss. */}
      <div className={sectionWrapperStyles.toneMidWrap}>
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

      {/* Stage 2b-2 — CtaBridgeBlock replaces CtaBridgeSection here (design-
          lab-to-production migration) — same ctaBridge data (ctaBridgeQuery,
          fetched above), new light-island presentation. CtaBridgeSection.tsx
          itself is untouched, just no longer imported. */}
      <RevealOnScroll>
        <CtaBridgeBlock
          title={homePage?.ctaBridge?.title ?? ""}
          titleEmphasis={homePage?.ctaBridge?.titleEmphasis}
          body={homePage?.ctaBridge?.body ?? ""}
          linkLabel={homePage?.ctaBridge?.linkLabel ?? ""}
          locale={locale as Locale}
          closeLabel={closeLabel}
          contactDialogHeading={contactDialogHeading}
        />
      </RevealOnScroll>

      {/* Design-lab-to-production migration: ChiSonoBlock replaces
          ChiSonoSection here — chiSonoSection (the 5-paragraph personal-
          story singleton) is no longer fetched or rendered; homePage.
          profilo (professional-facts-only, 3 paragraphs) is the new
          source. ChiSonoBlock renders its own id="chi-sono" internally,
          preserving the header's "Chi sono" nav anchor. Stage 2b-2:
          repositioned only (was right after Metodo) to match design-lab's
          own order, now sits after CTA bridge — internals untouched. */}
      <ChiSonoBlock
        eyebrow={homePage?.profilo?.eyebrow ?? ""}
        heading={homePage?.profilo?.heading ?? ""}
        headingEmphasisWord={homePage?.profilo?.headingEmphasisWord}
        paragraphs={homePage?.profilo?.paragraphs ?? []}
        photoUrl={portraitUrl}
        photoAlt={portraitAlt}
      />

      {/* Design-lab-to-production migration: DiplomiSlider replaces
          DiplomiSection here — both now read the exact same shared
          homePage.diplomi.* fields (kicker/heading/headingEmphasisWord/
          intro/alboLine/items), so design-lab and production show
          identical Diplomi content by construction. diplomiLabItems is
          computed above (privacy-gate: a card is interactive iff scan is
          present AND scanRedacted is true). Stage 2b-2: repositioned only
          (relative order to CTA bridge/Chi sono unchanged in spirit —
          still immediately after them) — internals untouched. */}
      <div className={sectionWrapperStyles.diplomiLightWrap}>
        <section className={sectionWrapperStyles.section} aria-labelledby="diplomi-block-heading">
          <DiplomiSlider
            headingId="diplomi-block-heading"
            kicker={homePage?.diplomi?.kicker ?? ""}
            heading={homePage?.diplomi?.heading ?? ""}
            headingEmphasisWord={homePage?.diplomi?.headingEmphasisWord}
            intro={homePage?.diplomi?.intro}
            alboLine={homePage?.diplomi?.alboLine}
            closeLabel={closeLabel}
            redactionNote={tDiplomi("redactionNote")}
            cardAffordance={tDiplomi("cardAffordance")}
            cardAriaSuffix={tDiplomi("cardAriaSuffix")}
            cardPrevLabel={tDiplomi("cardPrevLabel")}
            cardNextLabel={tDiplomi("cardNextLabel")}
            trackLabel={tDiplomi("trackLabel")}
            lightboxPrevLabel={tDiplomi("lightboxPrevLabel")}
            lightboxNextLabel={tDiplomi("lightboxNextLabel")}
            items={diplomiLabItems}
          />
        </section>
      </div>

      {/* Stage 2b-2 — VideoBlock replaces VideoSection here (design-lab-to-
          production migration) — same homePage.video data, new asymmetric
          layout. Renders nothing until a video file is published (the
          component's own CMS gate, unchanged). VideoSection.tsx itself is
          untouched, just no longer imported. */}
      <RevealOnScroll>
        <VideoBlock
          kicker={homePage?.video?.kicker}
          heading={homePage?.video?.heading}
          lead={homePage?.video?.lead}
          videoUrl={homePage?.video?.videoUrl}
          poster={homePage?.video?.poster}
          captionsUrl={homePage?.video?.captionsUrl}
          locale={locale as Locale}
        />
      </RevealOnScroll>

      {/* Stage 2b-2 — Sedi: SediBlock replaces LocationsSection here
          (design-lab-to-production migration). Same homePage.sedi/sede
          documents as before, new copy field group (homePage.locations,
          renamed from sediLab), address-list affordance, restored
          attribution. SediMapProvider is the shared activeId source for
          both this block and the Spazi photo strip below — a strip photo
          click flies the map to that location, same as clicking its
          address. LocationsSection.tsx itself is untouched, just no
          longer imported. */}
      <SediMapProvider>
        <RevealOnScroll>
          <SediBlock
            kicker={homePage?.locations?.kicker ?? ""}
            heading={homePage?.locations?.heading ?? ""}
            headingEmphasisWord={homePage?.locations?.headingEmphasisWord}
            intro={homePage?.locations?.intro}
            onlineSubLine={homePage?.locations?.onlineSubLine}
            sedes={sedes}
            locale={locale as Locale}
          />
        </RevealOnScroll>

        {/* Stage 2b-2 — Spazi (photo strip), new to production
            (design-lab-to-production migration). Semantically part of the
            Sedi map block, not its own tonal moment — reversed onto Sedi's
            own mid-tone surface (toneMidWrap). */}
        <div className={sectionWrapperStyles.toneMidWrap}>
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

      {/* Stage 2b-2 — ContactBlock replaces FinalContactSection here
          (design-lab-to-production migration). contactSection is this
          block's own independent kicker/heading/caption field group
          (renamed from contactLab, separate from the shared finalCta) —
          googleProfileLabel is the one field still read from finalCta,
          unchanged. Contact-form merge pass: ContactBlock and the homepage
          modal (ContactFormDialog) now both render the same ContactForm.tsx
          (email always required, telefono required only for whatsapp/
          telefonata — see that file's own top comment); the field-model
          divergence this comment used to flag no longer exists.
          FinalContactSection.tsx is still unused, not yet deleted (its own
          pass). */}
      <ContactBlock
        kicker={homePage?.contactSection?.kicker ?? ""}
        heading={homePage?.contactSection?.heading ?? ""}
        headingEmphasisWord={homePage?.contactSection?.headingEmphasisWord}
        photoCaption={homePage?.contactSection?.photoCaption ?? ""}
        googleProfileLabel={homePage?.finalCta?.googleProfileLabel ?? ""}
        googleProfileUrl={siteSettings?.googleProfileUrl}
        locale={locale}
        photoUrl={contactPhotoUrl}
        photoAlt={contactPhotoAlt}
      />

      {/* Stage 2b-2 — "Lo spazio" (parallax), new to production
          (design-lab-to-production migration). CSS-only reveal, image
          only — no JS scroll listener, no rAF loop, no Lenis subscription.
          aspect "12 / 5" is a plain CSS value (not CMS content, not
          locale-dependent) — same literal design-lab's own THE_SPACE.it
          constant uses; not imported from design-lab's content.ts since
          that file is shared with the untouchable DensityPage.tsx route
          and the structural rule bars production from reaching into
          src/app/design-lab/ at all. roomPhotoUrl/roomPhotoAlt above are,
          like Welcome/Contact/Chi sono's own photos, still hardcoded, not
          CMS. */}
      <section className={sectionWrapperStyles.spaceSection}>
        <figure
          className={`${sectionWrapperStyles.fullBleedFrame} ${sectionWrapperStyles.spaceFrameFlush}`}
        >
          <ParallaxFrameStatic aspect="12 / 5" imageUrl={roomPhotoUrl} imageAlt={roomPhotoAlt} />
        </figure>
      </section>

      {/* Stage 2b-2 — ResourcesLab replaces ResourcesSection here (design-
          lab-to-production migration) — realArticles now comes off
          latestArticlesLabQuery (see Promise.all above, cover+body added).
          The live dataset currently has 0 published "article" documents,
          so this renders ResourcesLab's own built-in mock fallback (see
          that file's own comment) rather than ResourcesSection's — a
          different, though similarly real-but-404ing, fallback set.
          ResourcesSection.tsx itself is untouched, just no longer
          imported. */}
      <div className={sectionWrapperStyles.toneMidWrap}>
        <RevealOnScroll>
          <ResourcesLab
            kicker={homePage?.risorse?.kicker ?? ""}
            heading={homePage?.risorse?.heading ?? ""}
            locale={locale}
            realArticles={realArticles}
            allArticlesLabel={homePage?.risorse?.allArticlesLabel ?? ""}
          />
        </RevealOnScroll>
      </div>

      {/* Un-gated in the FAQ/Contact/Blog-preview pass — items come off
          the same homePageQuery fetch above (homePage.faq), no separate
          query. Stage 2b-2: repositioned only (was between Sedi and
          Contact) to match design-lab's own order, now sits near the end.
          Stage 2c fix: faqLightWrap was left off by Stage 2b-2's own scope
          omission — added now, matching design-lab's own wrapper exactly.
          FaqSection.tsx/.module.scss/FaqAccordion.tsx themselves are
          untouched, every colour they read is generic and already covered
          by light-island-surface's reassignment list. */}
      <div className={sectionWrapperStyles.faqLightWrap}>
        <RevealOnScroll>
          <FaqSection
            kicker={homePage?.faq?.kicker ?? ""}
            heading={homePage?.faq?.heading ?? ""}
            linkLabel={homePage?.faq?.linkLabel ?? ""}
            locale={locale}
            items={homePage?.faq?.items}
          />
        </RevealOnScroll>
      </div>

      {/* Stage 2b-2 — SignatureBandTuned replaces SignatureBand here
          (design-lab-to-production migration) — light-island pass, the
          band previously sat unwrapped on the raw root. SignatureBand.tsx
          itself is untouched, just no longer imported. */}
      <div className={sectionWrapperStyles.signatureLightWrap}>
        <RevealOnScroll>
          <SignatureBandTuned />
        </RevealOnScroll>
      </div>
    </main>
  );
}
