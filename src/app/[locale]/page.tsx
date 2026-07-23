import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AreeSection } from "@/components/AreeSection";
import { ChiSonoSection } from "@/components/ChiSonoSection";
import { CtaBridgeSection } from "@/components/CtaBridgeSection";
import { DiplomiSection } from "@/components/DiplomiSection";
import { HeroOverlap } from "@/components/HeroOverlap";
import { HopeSection } from "@/components/HopeSection";
import { JourneySection } from "@/components/JourneySection";
import { FaqSection } from "@/components/FaqSection";
import { FinalContactSection } from "@/components/FinalContactSection";
import { LocationsSection, type SedeData } from "@/components/LocationsSection";
import { RecognitionSection } from "@/components/RecognitionSection";
import {
  type RealArticle,
  ResourcesSection,
} from "@/components/ResourcesSection";
import { SignatureBand } from "@/components/SignatureBand";
import { VideoSection } from "@/components/VideoSection";
import { sanityFetch } from "@/sanity/client";
import type { Locale } from "@/sanity/paths";
import {
  areasQuery,
  areeSectionQuery,
  chiSonoSectionQuery,
  ctaBridgeSectionQuery,
  homePageQuery,
  latestArticlesQuery,
  sedesQuery,
} from "@/sanity/queries";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";

// PREVIEW-GATE (temporary) — restoring the rest of the real homepage:
// 1. Restore these imports (uncomment): FormazioneBand, PricingSection,
//    from "@/components/*".
// 2. In Home(), restore `formazione`/`prezzi`-driven sections into the
//    Promise.all as needed.
// 3. In the JSX, uncomment the remaining FormazioneBand/PricingSection
//    block below and place it between VideoSection and FaqSection —
//    where the PreviewPlaceholderSection stand-in used to sit before the
//    placeholder-removal pass took it out of the homepage flow entirely
//    (component itself untouched — see PreviewPlaceholderSection.tsx's
//    own comment; it's still the standard device for any future gated
//    homepage anchor, just has no current call site).
// Gated sections: FormazioneBand, Pricing — content/design decisions
// still pending on both, per that pass's own instruction (do not touch).
// Locations map pass: Sedes/SedesSection is un-gated as of this pass,
// rebuilt as LocationsSection (address list + interactive map) — no
// longer part of this gate; see that pass's own report for the full
// rebuild. Hero, Recognition, Hope, Journey ("Metodo"), Chi sono, Aree,
// Diplomi, Video, Faq, FinalContact ("Contact"), Resources ("Blog
// preview"), and Locations ("Sedi") are NOT gated — they stay live
// (Diplomi un-gated in the homePage-array migration pass; Chi sono
// un-gated in the Chi sono section pass; Aree un-gated in the Aree
// section pass — its own new AreeSection component/query, NOT the older
// homePage.diCosa/ConcernsSection.tsx pairing, which this pass supersedes
// and leaves orphaned, same precedent as diploma/qualification and
// homePage.chiSono/ChiSonoOverlap before it; Video un-gated in the video
// section pass — data comes off the same homePageQuery fetch already in
// use, no separate query needed; Faq/FinalContact/Resources un-gated in
// the FAQ/Contact/Blog-preview un-gate pass — all three read off queries
// that already existed [homePageQuery's own faq{}/finalCta{} projections,
// plus the standalone latestArticlesQuery for Resources], nothing new
// authored; ResourcesSection's own zero-articles fallback [see that
// file's own comment] renders 3 hardcoded mock articles with real-but-
// 404ing links — deliberately untouched, per that pass's own amendment;
// Locations un-gated in the locations map pass — sedesQuery already
// existed, reads the existing `sede` document type, now extended with
// district/photo fields, see that pass's own report).
// ChiSonoSection keeps id="chi-sono" on its own root section — the
// header's "Chi sono" nav link still anchor-scrolls there rather than
// routing to the future full /chi-sono page (see headerNavItems.ts's
// own PREVIEW_GATE_ANCHOR_OVERRIDES comment — that gate is untouched
// here, it reverses only once /chi-sono is actually built, a separate,
// later pass). "Metodo" already resolves to this page's own #metodo
// anchor, unaffected by any of this.
// import { FormazioneBand } from "@/components/FormazioneBand";
// import { PricingSection } from "@/components/PricingSection";

interface QualificationItemData {
  _key: string;
  year: string;
  title: string;
  institution: string;
  tier: "titolo" | "formazione_continua";
  document?: SanityImage;
  documentLqip?: string;
}

interface ChiSonoSectionData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  paragraphs?: string[];
  pullQuote?: string;
  portrait?: SanityImage & { alt?: string };
  portraitLqip?: string;
  storyLink?: { current?: string };
  signatureEnabled?: boolean;
}

interface AreeSectionData {
  kicker?: string;
  title?: string;
  intro?: string;
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
  title?: string;
  hero?: {
    headline?: string;
    headlineEmphasisWord?: string;
    positioningStatement?: string;
    ctaLabel?: string;
    photo?: SanityImage;
    youtubeId?: string;
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
  diCosa?: {
    kicker?: string;
    heading?: string;
    linkLabel?: string;
    areas?: { title: string; subItems?: string[] }[];
    photo?: SanityImage;
  };
  hope?: { eyebrow?: string; heading?: string; headingEmphasisWord?: string };
  diplomi?: {
    kicker?: string;
    heading?: string;
    alboLine?: string;
    items?: QualificationItemData[];
  };
  percorso?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    paragraph?: string;
    steps?: { title: string; shortLine: string; expandedText: string }[];
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
  sedi?: { kicker?: string; heading?: string; paragraph?: string };
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

  // Diplomi/Faq/FinalContact's data all come straight off the same
  // homePage fetch (homePage.diplomi.items / .faq / .finalCta), no
  // separate query. chiSonoSection/areeSection are each their OWN
  // standalone singleton (not a homePage field group — see each schema
  // file's own comment), so they need their own fetch, tagged for the
  // revalidation webhook; areas is a separate plain list type (see
  // area.ts's own comment), fetched alongside its section's header copy.
  // sedes (Locations/"Sedi") is the same established pattern — its own
  // plain list type (`sede`), tagged "sede" for the revalidation webhook,
  // live again as of the locations map pass.
  const [homePage, chiSono, aree, areas, ctaBridge, siteSettings, realArticles, sedes] = await Promise.all([
    sanityFetch<HomePageData | null>(homePageQuery, { locale }, ["homePage"]),
    sanityFetch<ChiSonoSectionData | null>(chiSonoSectionQuery, { locale }, ["chiSonoSection"]),
    sanityFetch<AreeSectionData | null>(areeSectionQuery, { locale }, ["areeSection"]),
    sanityFetch<AreaData[]>(areasQuery, { locale }, ["area"]),
    sanityFetch<CtaBridgeSectionData | null>(ctaBridgeSectionQuery, { locale }, ["ctaBridgeSection"]),
    getSiteSettings(locale),
    sanityFetch<RealArticle[]>(latestArticlesQuery, { locale }, ["article"]),
    sanityFetch<SedeData[]>(sedesQuery, { locale }, ["sede"]),
  ]);

  return (
    <main>
      <HeroOverlap
        treatment="treated"
        headline={homePage?.hero?.headline ?? ""}
        headlineEmphasisWord={homePage?.hero?.headlineEmphasisWord}
        positioningStatement={homePage?.hero?.positioningStatement ?? ""}
        ctaLabel={homePage?.hero?.ctaLabel ?? ""}
        photo={homePage?.hero?.photo}
        youtubeId={homePage?.hero?.youtubeId}
      />

      <RecognitionSection
        kicker={homePage?.recognition?.kicker ?? ""}
        heading={homePage?.recognition?.heading ?? ""}
        bridgeLine={homePage?.recognition?.bridgeLine ?? ""}
        fragments={homePage?.recognition?.fragments}
      />

      <HopeSection
        eyebrow={homePage?.hope?.eyebrow ?? ""}
        heading={homePage?.hope?.heading ?? ""}
        headingEmphasisWord={homePage?.hope?.headingEmphasisWord}
      />

      <JourneySection
        kicker={homePage?.percorso?.kicker ?? ""}
        heading={homePage?.percorso?.heading ?? ""}
        headingEmphasisWord={homePage?.percorso?.headingEmphasisWord}
        paragraph={homePage?.percorso?.paragraph}
        steps={homePage?.percorso?.steps}
      />

      {/* Section-reorder pass: Chi sono now comes BEFORE Diplomi (was
          after) — Metodo -> Chi sono -> Diplomi -> Areas. Un-gated in the
          Chi sono section pass — data comes from its own chiSonoSection
          singleton fetch above (chiSono), not homePage. Keeps
          id="chi-sono" so the header's still-gated "Chi sono" nav anchor
          (see headerNavItems.ts) continues to land here. */}
      <ChiSonoSection
        kicker={chiSono?.kicker ?? ""}
        title={chiSono?.title ?? ""}
        titleEmphasisWord={chiSono?.titleEmphasisWord}
        paragraphs={chiSono?.paragraphs}
        pullQuote={chiSono?.pullQuote}
        portrait={chiSono?.portrait}
        portraitLqip={chiSono?.portraitLqip}
        storyLink={chiSono?.storyLink}
        signatureEnabled={chiSono?.signatureEnabled}
        locale={locale as Locale}
      />

      {/* Un-gated in the Aree section pass — data comes from its own
          areeSection + area fetches above, not homePage.diCosa. Supersedes
          the still-gated ConcernsSection below (removed from that block —
          see this file's own import-block comment). */}
      <AreeSection
        kicker={aree?.kicker ?? ""}
        title={aree?.title ?? ""}
        intro={aree?.intro}
        areas={areas}
        previewHover={aree?.previewHover}
        locale={locale as Locale}
      />

      <CtaBridgeSection
        title={ctaBridge?.title ?? ""}
        titleEmphasis={ctaBridge?.titleEmphasis}
        body={ctaBridge?.body ?? ""}
        linkLabel={ctaBridge?.linkLabel ?? ""}
      />

      {/* Un-gated in the homePage-array migration pass — data comes
          straight off homePage.diplomi.items (part of homePageQuery
          above), no separate fetch. Renders whatever is currently in the
          dataset: real scans/text where uploaded, the typographic
          placeholder fallback for anything still [segnaposto]. */}
      <DiplomiSection
        kicker={homePage?.diplomi?.kicker ?? ""}
        heading={homePage?.diplomi?.heading ?? ""}
        alboLine={homePage?.diplomi?.alboLine}
        qualifications={homePage?.diplomi?.items}
        locale={locale as Locale}
      />

      {/* Un-gated in the video section pass — data comes off the same
          homePageQuery fetch above (homePage.video), no separate fetch.
          Renders nothing until a video file is published (component's
          own CMS gate — see VideoSection.tsx's own early return), which
          currently is true for both locales in the live dataset. Sits
          ahead of FAQ, per this pass's own "Diplomi -> Video -> Prezzi"
          instruction. */}
      <VideoSection
        kicker={homePage?.video?.kicker}
        heading={homePage?.video?.heading}
        lead={homePage?.video?.lead}
        videoUrl={homePage?.video?.videoUrl}
        poster={homePage?.video?.poster}
        captionsUrl={homePage?.video?.captionsUrl}
        locale={locale as Locale}
      />

      {/* PREVIEW-GATE (temporary) — real sections, preserved verbatim.
          Placeholder-removal pass: the PreviewPlaceholderSection stand-in
          that used to sit here (id="formazione") is gone — FormazioneBand/
          Pricing stay gated (content/design decisions still pending on
          both), but the homepage no longer shows any visible placeholder
          for them; the gap they'll eventually fill sits between Video and
          Locations below, currently closed. Reversal: uncomment the block
          below, verbatim, unchanged — plus the import and Promise.all
          restorations noted at the top of this file.
      <FormazioneBand
        kicker={homePage?.formazione?.kicker ?? ""}
        credentials={homePage?.formazione?.credentials}
        counters={homePage?.formazione?.counters}
      />

      <PricingSection
        kicker={homePage?.prezzi?.kicker ?? ""}
        heading={homePage?.prezzi?.heading ?? ""}
        body={homePage?.prezzi?.body ?? ""}
        buttonLabel={homePage?.prezzi?.buttonLabel ?? ""}
        showPrices={homePage?.prezzi?.showPrices ?? true}
        priceLines={homePage?.prezzi?.priceLines}
        footnote={homePage?.prezzi?.footnote}
        noPricesSentence={homePage?.prezzi?.noPricesSentence}
      />
      */}

      {/* Un-gated in the locations map pass — rebuilt as LocationsSection
          (address list + interactive Leaflet map), replacing the retired
          SedesSection/SedesStage sticky-scroll implementation entirely.
          kicker/heading/paragraph come off the same pre-existing
          homePage.sedi field group the old gated section already used;
          sedes comes off sedesQuery (see this pass's own report). */}
      <LocationsSection
        kicker={homePage?.sedi?.kicker ?? ""}
        heading={homePage?.sedi?.heading ?? ""}
        paragraph={homePage?.sedi?.paragraph}
        sedes={sedes}
        locale={locale as Locale}
      />

      {/* Un-gated in the FAQ/Contact/Blog-preview pass — items come off
          the same homePageQuery fetch above (homePage.faq), no separate
          query. Sits right after Locations (the still-gated Formazione/
          Pricing block above no longer renders a visible placeholder
          here — see the placeholder-removal pass's own comment on that
          block), per this pass's own "[Pricing gated] -> Locations -> FAQ
          -> Contact -> Blog preview" instruction. */}
      <FaqSection
        kicker={homePage?.faq?.kicker ?? ""}
        heading={homePage?.faq?.heading ?? ""}
        linkLabel={homePage?.faq?.linkLabel ?? ""}
        locale={locale}
        items={homePage?.faq?.items}
      />

      {/* Un-gated in the FAQ/Contact/Blog-preview pass — data comes off
          the same homePageQuery fetch (homePage.finalCta) plus
          siteSettings (googleProfileUrl), both already fetched above.
          VARIANT B pass (slim inset accent band): photo/responseNote are
          no longer passed — both fields are now orphaned (still fetched
          as part of the bare `finalCta,` projection, still populated in
          the dataset, just unread) — see FinalContactSection.tsx's own
          top-of-file comment for the full HONESTY-RULE flag. */}
      <FinalContactSection
        kicker={homePage?.finalCta?.kicker ?? ""}
        heading={homePage?.finalCta?.heading ?? ""}
        body={homePage?.finalCta?.body ?? ""}
        googleProfileLabel={homePage?.finalCta?.googleProfileLabel ?? ""}
        googleProfileUrl={siteSettings?.googleProfileUrl}
        locale={locale}
      />

      {/* Un-gated in the FAQ/Contact/Blog-preview pass — realArticles
          comes from the existing latestArticlesQuery (already fetched
          above), same standalone query Resources always used. The live
          dataset currently has 0 published "article" documents, so this
          renders its own built-in 3-mock-article fallback (hardcoded in
          ResourcesSection.tsx, real-but-404ing links) — deliberately left
          as-is, per this pass's own amendment: no swap, no empty-state,
          no hiding. */}
      <ResourcesSection
        kicker={homePage?.risorse?.kicker ?? ""}
        heading={homePage?.risorse?.heading ?? ""}
        locale={locale}
        realArticles={realArticles}
        allArticlesLabel={homePage?.risorse?.allArticlesLabel ?? ""}
      />

      <SignatureBand />
    </main>
  );
}
