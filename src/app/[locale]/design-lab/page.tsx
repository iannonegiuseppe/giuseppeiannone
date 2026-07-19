import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ChiSonoOverlap } from "@/components/ChiSonoOverlap";
import { ConcernsSection } from "@/components/ConcernsSection";
import { DiplomiSection } from "@/components/DiplomiSection";
import { FaqSection } from "@/components/FaqSection";
import { FinalContactSection } from "@/components/FinalContactSection";
import { FormazioneBand } from "@/components/FormazioneBand";
import { HeroOverlap } from "@/components/HeroOverlap";
import { HopeSection } from "@/components/HopeSection";
import { PercorsoSection } from "@/components/PercorsoSection";
import { PricingSection } from "@/components/PricingSection";
import { RecognitionSection } from "@/components/RecognitionSection";
import { type RealArticle, ResourcesSection } from "@/components/ResourcesSection";
import { SedesSection } from "@/components/SedesSection";
import { VideoSection } from "@/components/VideoSection";
import { sanityFetch } from "@/sanity/client";
import { diplomasQuery, homePageQuery, latestArticlesQuery, sedesQuery } from "@/sanity/queries";
import { getSiteSettings } from "@/sanity/seo";

// Mirror route, post-promotion: every section below is the SAME shared
// component now rendered on the real homepage (src/app/[locale]/page.tsx)
// — this route no longer owns any of that code, it only re-renders it for
// continued internal review. Kept (not deleted) until the client formally
// signs off and this route is retired; noindex/unlinked either way. The
// real Header/Footer (rendered by layout.tsx for every route) already
// cover this one too — this page renders no header/footer of its own.
//
// CMS-wiring pass: fetches the exact same Sanity data as page.tsx (still a
// mirror, not a fork) — no EN gate/redirect here since this route was
// never subject to it, and no generateMetadata override beyond the fixed
// noindex below.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface HomePageData {
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
  diplomi?: { kicker?: string; heading?: string };
  percorso?: { kicker?: string; heading?: string; paragraph?: string; steps?: { title: string; text: string }[] };
  recognition?: {
    kicker?: string;
    heading?: string;
    bridgeLine?: string;
    fragments?: { label: string; text: string; emphasisWord?: string; tier: "dominant" | "peripheral" }[];
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
  faq?: { kicker?: string; heading?: string; linkLabel?: string; items?: { _id: string; question: string; answer: unknown }[] };
}

interface SedeData {
  _id: string;
  city: string;
  isOnline?: boolean;
  onlineLine?: string;
  addresses?: { centerName?: string; address: string; lat: number; lng: number }[];
}

interface DiplomaData {
  _id: string;
  image: SanityImage;
  title: string;
  institution: string;
  year: number;
}

export default async function DesignLabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [homePage, siteSettings, sedes, diplomas, realArticles] = await Promise.all([
    sanityFetch<HomePageData | null>(homePageQuery, { locale }, ["homePage"]),
    getSiteSettings(locale),
    sanityFetch<SedeData[]>(sedesQuery, { locale }, ["sede"]),
    sanityFetch<DiplomaData[]>(diplomasQuery, { locale }, ["diploma"]),
    sanityFetch<RealArticle[]>(latestArticlesQuery, { locale }, ["article"]),
  ]);

  return (
    <main>
      <HeroOverlap
        treatment="treated"
        label="Hero — approved"
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

      <PercorsoSection
        kicker={homePage?.percorso?.kicker ?? ""}
        heading={homePage?.percorso?.heading ?? ""}
        paragraph={homePage?.percorso?.paragraph ?? ""}
        steps={homePage?.percorso?.steps}
      />

      <DiplomiSection
        kicker={homePage?.diplomi?.kicker ?? ""}
        heading={homePage?.diplomi?.heading ?? ""}
        diplomas={diplomas}
      />
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
    </main>
  );
}
