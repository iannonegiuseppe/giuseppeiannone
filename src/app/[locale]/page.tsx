import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { DiplomiSection } from "@/components/DiplomiSection";
import { HeroOverlap } from "@/components/HeroOverlap";
import { HopeSection } from "@/components/HopeSection";
import { JourneySection } from "@/components/JourneySection";
import { PreviewPlaceholderSection } from "@/components/PreviewPlaceholderSection";
import { RecognitionSection } from "@/components/RecognitionSection";
import { sanityFetch } from "@/sanity/client";
import type { Locale } from "@/sanity/paths";
import { homePageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";

// PREVIEW-GATE (temporary) — restoring the rest of the real homepage:
// 1. Restore these imports (uncomment):
//    ChiSonoOverlap, ConcernsSection, FaqSection, FinalContactSection,
//    FormazioneBand, PricingSection, ResourcesSection (+ RealArticle
//    type), SedesSection, VideoSection, from "@/components/*";
//    latestArticlesQuery, sedesQuery from "@/sanity/queries".
// 2. Remove the PreviewPlaceholderSection import above once its one
//    remaining call site (id="chi-sono") is gone too.
// 3. In Home(), restore the full Promise.all (siteSettings/sedes/
//    realArticles) — see that block's own comment below.
// 4. In the JSX, delete the remaining <PreviewPlaceholderSection> call
//    and uncomment the real section block below it (FormazioneBand
//    through ResourcesSection, verbatim, unchanged).
// Gated sections: FormazioneBand, ChiSono ("Chi sono"), Concerns, Video,
// Pricing, Faq, FinalContact + Sedes, Resources. Hero, Recognition, Hope,
// Journey ("Metodo"), and Diplomi are NOT gated — they stay live
// (Diplomi un-gated in the homePage-array migration pass — its data now
// comes straight off the same homePageQuery fetch below, no separate
// query). See also headerNavItems.ts's own PREVIEW-GATE block (the
// nav-href side of this same change) — "metodo" already resolves to
// this page's own #metodo anchor, unaffected by this section's un-gate,
// so nothing there needs to change.
// import { ChiSonoOverlap } from "@/components/ChiSonoOverlap";
// import { ConcernsSection } from "@/components/ConcernsSection";
// import { FaqSection } from "@/components/FaqSection";
// import { FinalContactSection } from "@/components/FinalContactSection";
// import { FormazioneBand } from "@/components/FormazioneBand";
// import { PricingSection } from "@/components/PricingSection";
// import {
//   type RealArticle,
//   ResourcesSection,
// } from "@/components/ResourcesSection";
// import { SedesSection } from "@/components/SedesSection";
// import { VideoSection } from "@/components/VideoSection";
// import { latestArticlesQuery, sedesQuery } from "@/sanity/queries";

interface QualificationItemData {
  _key: string;
  year: string;
  title: string;
  institution: string;
  tier: "titolo" | "formazione_continua";
  document?: SanityImage;
  documentLqip?: string;
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

// PREVIEW-GATE (temporary): only used by the now-commented-out sedesQuery
// fetch below — commented out alongside it (would otherwise be flagged as
// an unused interface). Restore as step 3 of the reversal described in
// the import-block comment above.
// interface SedeData {
//   _id: string;
//   city: string;
//   isOnline?: boolean;
//   onlineLine?: string;
//   addresses?: {
//     centerName?: string;
//     address: string;
//     lat: number;
//     lng: number;
//   }[];
// }

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

  // PREVIEW-GATE (temporary): only homePage is fetched while the lower
  // sections are gated — siteSettings (here; generateMetadata above has
  // its own separate fetch, untouched)/sedes/realArticles only ever fed
  // the now-gated sections, so fetching them would just be wasted CMS
  // round-trips until they're back. Diplomi's data (homePage.diplomi.items)
  // needs nothing extra here — it comes off this same homePage fetch.
  // Restore the full destructure + Promise.all below (uncomment) as
  // step 3 of the reversal described in this file's own import-block
  // comment.
  const [homePage] = await Promise.all([
    sanityFetch<HomePageData | null>(homePageQuery, { locale }, ["homePage"]),
  ]);
  // const [homePage, siteSettings, sedes, realArticles] =
  //   await Promise.all([
  //     sanityFetch<HomePageData | null>(homePageQuery, { locale }, ["homePage"]),
  //     getSiteSettings(locale),
  //     sanityFetch<SedeData[]>(sedesQuery, { locale }, ["sede"]),
  //     // Tagged "article" per the project's type-driven revalidation convention
  //     // (src/app/api/revalidate/route.ts revalidates the raw _type string on
  //     // every write) — same tag family the webhook already produces for this
  //     // document type, no changes needed there.
  //     sanityFetch<RealArticle[]>(latestArticlesQuery, { locale }, ["article"]),
  //   ]);

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

      {/* PREVIEW-GATE (temporary): anchor placeholder for the "Chi sono"
          nav link (headerNavItems.ts resolves it to #chi-sono for the
          duration of this gate — see that file's own PREVIEW-GATE
          comment). "Metodo" is no longer gated — JourneySection above
          now owns #metodo for real. Reversal: delete this
          PreviewPlaceholderSection call and uncomment the real section
          block immediately below (FormazioneBand through
          ResourcesSection, preserved verbatim, unchanged) — plus the
          import and Promise.all restorations noted at the top of this
          file. */}
      <PreviewPlaceholderSection id="chi-sono" locale={locale} />

      {/* PREVIEW-GATE (temporary) — real sections, preserved verbatim:
      <FormazioneBand
        kicker={homePage?.formazione?.kicker ?? ""}
        credentials={homePage?.formazione?.credentials}
        counters={homePage?.formazione?.counters}
      />

      <ChiSonoOverlap
        introHeading={homePage?.chiSono?.introHeading ?? ""}
        introLinkLabel={homePage?.chiSono?.introLinkLabel ?? ""}
        kicker={homePage?.chiSono?.kicker ?? ""}
        heading={homePage?.chiSono?.heading ?? ""}
        bio={homePage?.chiSono?.bio ?? ""}
        methodsBody={homePage?.chiSono?.methodsBody}
        storyLinkLabel={homePage?.chiSono?.storyLinkLabel ?? ""}
        watermarkText={homePage?.chiSono?.watermarkText}
        photo={homePage?.chiSono?.photo}
      />

      <ConcernsSection
        kicker={homePage?.diCosa?.kicker ?? ""}
        heading={homePage?.diCosa?.heading ?? ""}
        linkLabel={homePage?.diCosa?.linkLabel ?? ""}
        areas={homePage?.diCosa?.areas}
        photo={homePage?.diCosa?.photo}
      />

      <VideoSection
        kicker={homePage?.video?.kicker}
        heading={homePage?.video?.heading}
        lead={homePage?.video?.lead}
        videoUrl={homePage?.video?.videoUrl}
        poster={homePage?.video?.poster}
        captionsUrl={homePage?.video?.captionsUrl}
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

      <FaqSection
        kicker={homePage?.faq?.kicker ?? ""}
        heading={homePage?.faq?.heading ?? ""}
        linkLabel={homePage?.faq?.linkLabel ?? ""}
        locale={locale}
        items={homePage?.faq?.items}
      />

      <FinalContactSection
        kicker={homePage?.finalCta?.kicker ?? ""}
        heading={homePage?.finalCta?.heading ?? ""}
        body={homePage?.finalCta?.body ?? ""}
        responseNote={homePage?.finalCta?.responseNote ?? ""}
        googleProfileLabel={homePage?.finalCta?.googleProfileLabel ?? ""}
        googleProfileUrl={siteSettings?.googleProfileUrl}
        photo={homePage?.finalCta?.photo}
        locale={locale}
      />
      <SedesSection
        kicker={homePage?.sedi?.kicker ?? ""}
        heading={homePage?.sedi?.heading ?? ""}
        paragraph={homePage?.sedi?.paragraph ?? ""}
        sedes={sedes}
      />

      <ResourcesSection
        kicker={homePage?.risorse?.kicker ?? ""}
        heading={homePage?.risorse?.heading ?? ""}
        locale={locale}
        realArticles={realArticles}
        allArticlesLabel={homePage?.risorse?.allArticlesLabel ?? ""}
      />
      */}
    </main>
  );
}
