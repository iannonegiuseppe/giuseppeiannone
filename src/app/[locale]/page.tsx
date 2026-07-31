import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AreeSection } from "@/components/AreeSection";
import { CtaBridgeSection } from "@/components/CtaBridgeSection";
import { HeroOverlap } from "@/components/HeroOverlap";
import { HopeSection } from "@/components/HopeSection";
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
import { imageDimensions, urlFor } from "@/sanity/image";
import type { Locale } from "@/sanity/paths";
import {
  areasQuery,
  areeSectionQuery,
  ctaBridgeSectionQuery,
  homePageQuery,
  latestArticlesQuery,
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
// only the three wrapper classes this page actually uses
// (.metodoLightWrap/.section/.diplomiLightWrap), as mixins density.module
// .scss's own same-named classes now @include too, so there's one source
// of truth, not two copies that can drift.
import { ChiSonoBlock } from "@/components/ChiSonoBlock";
import { DiplomiSlider, type DiplomiLabItem } from "@/components/DiplomiSlider";
import { MetodoInteractive } from "@/components/MetodoInteractive";
import metodoStyles from "@/components/metodo.module.scss";
import sectionWrapperStyles from "@/components/sectionWrappers.module.scss";

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
// ChiSonoBlock (design-lab-to-production migration; was ChiSonoSection)
// keeps id="chi-sono" on its own root section — the header's "Chi sono"
// nav link still anchor-scrolls there rather than routing to the future
// full /chi-sono page (see headerNavItems.ts's own
// PREVIEW_GATE_ANCHOR_OVERRIDES comment — that gate is untouched here, it
// reverses only once /chi-sono is actually built, a separate, later
// pass). "Metodo" (now MetodoInteractive, was JourneySection) still
// resolves to this page's own #metodo anchor, unaffected by any of this.
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
  // Privacy-gate pair — see homePage.ts's own comment on these two fields
  // and DiplomiSlider.tsx's own comment on the interactivity logic that
  // reads them exclusively (never `document` above).
  scan?: SanityImage;
  scanRedacted?: boolean;
  scanLqip?: string;
}

interface AreeSectionData {
  kicker?: string;
  title?: string;
  intro?: string;
  // Card-grid rebuild pass: still fetched (areeSectionQuery), still a real
  // Sanity field — but no longer read here, see AreeSection.tsx's own
  // comment for why (previewHover faked clickability on non-interactive
  // cards, which the rebuild's own brief explicitly forbids).
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

  // Diplomi/Metodo/Profilo/Faq/FinalContact's data all come straight off
  // the same homePage fetch (homePage.diplomi.items / .metodo / .profilo /
  // .faq / .finalCta), no separate query. Design-lab-to-production
  // migration: chiSonoSection is no longer fetched here at all — it's
  // deprecated/orphaned (see its own schema comment), superseded by
  // homePage.profilo, and nothing in this file reads it anymore. areeSection
  // is its own standalone singleton (not a homePage field group — see that
  // schema file's own comment), so it still needs its own fetch, tagged for
  // the revalidation webhook; areas is a separate plain list type (see
  // area.ts's own comment), fetched alongside its section's header copy.
  // sedes (Locations/"Sedi") is the same established pattern — its own
  // plain list type (`sede`), tagged "sede" for the revalidation webhook,
  // live again as of the locations map pass.
  const [homePage, aree, areas, ctaBridge, siteSettings, realArticles, sedes] = await Promise.all([
    sanityFetch<HomePageData | null>(homePageQuery, { locale }, ["homePage"]),
    sanityFetch<AreeSectionData | null>(areeSectionQuery, { locale }, ["areeSection"]),
    sanityFetch<AreaData[]>(areasQuery, { locale }, ["area"]),
    sanityFetch<CtaBridgeSectionData | null>(ctaBridgeSectionQuery, { locale }, ["ctaBridgeSection"]),
    getSiteSettings(locale),
    sanityFetch<RealArticle[]>(latestArticlesQuery, { locale }, ["article"]),
    sanityFetch<SedeData[]>(sedesQuery, { locale }, ["sede"]),
  ]);

  // messages/{it,en}.json's Diplomi.closeLabel — resolved server-side,
  // passed down as a prop to DiplomiSlider's lightbox close button (a
  // "use client" component, can't call getTranslations itself). Design-
  // lab-to-production migration: this used to be a hardcoded Italian
  // literal ("Chiudi") regardless of locale.
  const tDiplomi = await getTranslations({ locale, namespace: "Diplomi" });
  const closeLabel = tDiplomi("closeLabel");

  // Privacy-gate pass, copied verbatim from DesignLabHomepage.tsx (see
  // that file's own comment for the full reasoning): interactivity is
  // computed HERE, server-side, from scan + scanRedacted — never left to
  // the client to infer, and never read from `document` (the older,
  // separate field this array item type also carries). lightboxUrl is a
  // URL STRING built with urlFor (free string construction, not a network
  // request); scanLqip is a tiny inline base64 data URI already present in
  // the page's own JSON payload.
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

      {/* Design-lab-to-production migration: MetodoInteractive replaces
          JourneySection here — homePage.percorso (kicker/heading/steps,
          including the click-to-expand expandedText panel) is no longer
          rendered anywhere; homePage.metodo (title + shortLine per step
          only) is the new source. id="metodo" preserves the header nav
          anchor JourneySection's own root used to carry. */}
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

      {/* Design-lab-to-production migration: ChiSonoBlock replaces
          ChiSonoSection here — chiSonoSection (the 5-paragraph personal-
          story singleton) is no longer fetched or rendered; homePage.
          profilo (professional-facts-only, 3 paragraphs) is the new
          source. ChiSonoBlock renders its own id="chi-sono" internally,
          preserving the header's "Chi sono" nav anchor. Photo is the same
          static asset reference the design-lab source uses (not a new
          Sanity image field — this migration's brief was "use the
          existing Chi sono portrait as a plain static asset", matching
          Metodo/CTA bridge's own established pattern for /design-lab
          imagery). */}
      <ChiSonoBlock
        eyebrow={homePage?.profilo?.eyebrow ?? ""}
        heading={homePage?.profilo?.heading ?? ""}
        headingEmphasisWord={homePage?.profilo?.headingEmphasisWord}
        paragraphs={homePage?.profilo?.paragraphs ?? []}
        photoUrl="/design-lab/photos/01.webp"
        photoAlt="Giuseppe Iannone, psicoterapeuta — ritratto"
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
        locale={locale as Locale}
      />

      <CtaBridgeSection
        title={ctaBridge?.title ?? ""}
        titleEmphasis={ctaBridge?.titleEmphasis}
        body={ctaBridge?.body ?? ""}
        linkLabel={ctaBridge?.linkLabel ?? ""}
      />

      {/* Design-lab-to-production migration: DiplomiSlider replaces
          DiplomiSection here — both now read the exact same shared
          homePage.diplomi.* fields (kicker/heading/headingEmphasisWord/
          intro/alboLine/items), so design-lab and production show
          identical Diplomi content by construction. diplomiLabItems is
          computed above (privacy-gate: a card is interactive iff scan is
          present AND scanRedacted is true). */}
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
            items={diplomiLabItems}
          />
        </section>
      </div>

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
