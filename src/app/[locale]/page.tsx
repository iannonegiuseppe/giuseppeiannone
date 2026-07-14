import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ChiSonoOverlap } from "@/components/ChiSonoOverlap";
import { ConcernsSection } from "@/components/ConcernsSection";
import { DiplomiSection } from "@/components/DiplomiSection";
import { FaqSection } from "@/components/FaqSection";
import { FinalContactSection } from "@/components/FinalContactSection";
import { FormazioneBand } from "@/components/FormazioneBand";
import { HeroOverlap } from "@/components/HeroOverlap";
import { PercorsoSection } from "@/components/PercorsoSection";
import { PricingSection } from "@/components/PricingSection";
import { RecognitionSection } from "@/components/RecognitionSection";
import {
  type RealArticle,
  ResourcesSection,
} from "@/components/ResourcesSection";
import { SedesSection } from "@/components/SedesSection";
import { VideoSection } from "@/components/VideoSection";
import { sanityFetch } from "@/sanity/client";
import { homePath, type Locale } from "@/sanity/paths";
import {
  diplomasQuery,
  homePageQuery,
  latestArticlesQuery,
  sedesQuery,
} from "@/sanity/queries";
import { buildMetadata, getSiteSettings } from "@/sanity/seo";

interface HomePageData {
  title?: string;
  hero?: {
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
  hope?: { eyebrow?: string; heading?: string };
  diplomi?: { kicker?: string; heading?: string };
  percorso?: {
    kicker?: string;
    heading?: string;
    paragraph?: string;
    steps?: { title: string; text: string }[];
  };
  recognition?: {
    kicker?: string;
    heading?: string;
    bridgeLine?: string;
    vignettes?: {
      id: string;
      vignette: string;
      area: string;
      slug: string;
      visualImage?: SanityImage;
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

interface SedeData {
  _id: string;
  city: string;
  isOnline?: boolean;
  onlineLine?: string;
  addresses?: {
    centerName?: string;
    address: string;
    lat: number;
    lng: number;
  }[];
}

interface DiplomaData {
  _id: string;
  image: SanityImage;
  title: string;
  institution: string;
  year: number;
}

// TEMPORARY EN GATE: this composition's copy is hardcoded Italian —
// translations arrive with the content phase, not this promotion pass.
// Until then the EN homepage redirects to the IT root (below) and its
// hreflang pair is suppressed here (localizedPaths omits `en`) rather
// than dismantling the hreflang system itself — every other page keeps
// emitting both. Remove this gate, restore `en: "/en"` here, and drop
// the redirect once real EN copy exists.
//
// SPEC-VS-LIBRARY MISMATCH, flagged rather than silently guessed: the
// spec calls for a 302. next/navigation's redirect() only offers 307
// (TemporaryRedirect, the default used below), 303 (SeeOther), or 308
// (PermanentRedirect) — there is no literal 302 in the App Router's
// page-level redirect primitive; forcing one would mean bypassing
// redirect() for a hand-rolled Response, a bigger change than this gate
// warrants. 307 is used instead — the modern, unambiguous equivalent of
// "temporary redirect" (preserves method, unlike 302's historically
// inconsistent handling across clients) — and is what's actually shipped
// here; reported plainly rather than claimed as 302.
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
    localizedPaths: { it: "/" },
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // TEMPORARY EN GATE — see generateMetadata's own comment above.
  if (locale === "en") {
    redirect(homePath("it"));
  }

  const [homePage, siteSettings, sedes, diplomas, realArticles] =
    await Promise.all([
      sanityFetch<HomePageData | null>(homePageQuery, { locale }, ["homePage"]),
      getSiteSettings(locale),
      sanityFetch<SedeData[]>(sedesQuery, { locale }, ["sede"]),
      sanityFetch<DiplomaData[]>(diplomasQuery, { locale }, ["diploma"]),
      // Tagged "article" per the project's type-driven revalidation convention
      // (src/app/api/revalidate/route.ts revalidates the raw _type string on
      // every write) — same tag family the webhook already produces for this
      // document type, no changes needed there.
      sanityFetch<RealArticle[]>(latestArticlesQuery, { locale }, ["article"]),
    ]);

  const authorName = siteSettings?.author?.name ?? "";

  return (
    <main>
      <HeroOverlap
        treatment="treated"
        authorName={authorName}
        authorCredentials={siteSettings?.author?.credentials}
        registrationNumber={siteSettings?.author?.registrationNumber}
        positioningStatement={homePage?.hero?.positioningStatement ?? ""}
        ctaLabel={homePage?.hero?.ctaLabel ?? ""}
        photo={homePage?.hero?.photo}
        youtubeId={homePage?.hero?.youtubeId}
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

      <FormazioneBand
        kicker={homePage?.formazione?.kicker ?? ""}
        credentials={homePage?.formazione?.credentials}
        counters={homePage?.formazione?.counters}
      />

      <ConcernsSection
        kicker={homePage?.diCosa?.kicker ?? ""}
        heading={homePage?.diCosa?.heading ?? ""}
        linkLabel={homePage?.diCosa?.linkLabel ?? ""}
        areas={homePage?.diCosa?.areas}
        photo={homePage?.diCosa?.photo}
      />
      <DiplomiSection
        kicker={homePage?.diplomi?.kicker ?? ""}
        heading={homePage?.diplomi?.heading ?? ""}
        diplomas={diplomas}
      />
      <PercorsoSection
        kicker={homePage?.percorso?.kicker ?? ""}
        heading={homePage?.percorso?.heading ?? ""}
        paragraph={homePage?.percorso?.paragraph ?? ""}
        steps={homePage?.percorso?.steps}
      />
      <RecognitionSection
        kicker={homePage?.recognition?.kicker ?? ""}
        heading={homePage?.recognition?.heading ?? ""}
        bridgeLine={homePage?.recognition?.bridgeLine ?? ""}
        vignettes={homePage?.recognition?.vignettes}
      />
      <SedesSection
        kicker={homePage?.sedi?.kicker ?? ""}
        heading={homePage?.sedi?.heading ?? ""}
        paragraph={homePage?.sedi?.paragraph ?? ""}
        sedes={sedes}
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

      <VideoSection
        kicker={homePage?.video?.kicker}
        heading={homePage?.video?.heading}
        lead={homePage?.video?.lead}
        videoUrl={homePage?.video?.videoUrl}
        poster={homePage?.video?.poster}
        captionsUrl={homePage?.video?.captionsUrl}
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

      <ResourcesSection
        kicker={homePage?.risorse?.kicker ?? ""}
        heading={homePage?.risorse?.heading ?? ""}
        locale={locale}
        realArticles={realArticles}
        allArticlesLabel={homePage?.risorse?.allArticlesLabel ?? ""}
      />

      <FaqSection
        kicker={homePage?.faq?.kicker ?? ""}
        heading={homePage?.faq?.heading ?? ""}
        linkLabel={homePage?.faq?.linkLabel ?? ""}
        locale={locale}
        items={homePage?.faq?.items}
      />
    </main>
  );
}
