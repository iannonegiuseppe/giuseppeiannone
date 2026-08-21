import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AsymmetricOffsetBlock } from "@/components/AsymmetricOffsetBlock";
import { CenteredHero } from "@/components/CenteredHero";
import { CityWelcomeBlock } from "@/components/CityWelcomeBlock";
import { ContactBlock } from "@/components/ContactBlock";
import { EpigraphBand } from "@/components/EpigraphBand";
import { PracticalClosing } from "@/components/PracticalClosing";
import { SplitBlock } from "@/components/SplitBlock";
import { StackedBands } from "@/components/StackedBands";
import { sanityFetch } from "@/sanity/client";
import { monzaPath, pillarPath, type Locale } from "@/sanity/paths";
import { contactSectionQuery, monzaPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface SplitSide {
  label?: string;
  heading?: string;
  p1?: string;
  p2?: string;
}

interface OffsetBlock {
  heading?: string;
  p1?: string;
  p2?: string;
}

interface AreaBandLink {
  label?: string;
  slug?: string;
}

interface AreaBand {
  heading?: string;
  p1?: string;
  p2?: string;
  links?: AreaBandLink[];
}

interface PracticalColumn {
  heading?: string;
  p?: string;
}

interface MonzaPageData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  lead?: string;
  split?: { left?: SplitSide; right?: SplitSide };
  confidentiality?: { kicker?: string; epigraph?: string; p1?: string; p2?: string; p3?: string };
  fourAreas?: { kicker?: string; heading?: string; bands?: AreaBand[] };
  asymmetric?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    p1?: string;
    p2?: string;
    offset?: OffsetBlock;
  };
  practical?: { col1?: PracticalColumn; col2?: PracticalColumn; col3?: PracticalColumn };
  seo?: SeoFields;
}

interface ContactSectionCopy {
  contactSection?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    photoCaption?: string;
  };
  googleProfileLabel?: string;
}

function getMonzaPage(locale: string) {
  return sanityFetch<MonzaPageData | null>(monzaPageQuery, { locale }, ["monzaPage"]);
}

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

const CONTACT_PHOTO_URL = "/design-lab/photos/09.webp";
const CONTACT_PHOTO_ALT = "Giuseppe Iannone, ritratto.";

// Mid-page portrait pass — see psicologo-milano/page.tsx's own comment
// on this same pair of constants for the full reasoning (not 09.webp,
// which this page already uses lower down; 04.webp is the same
// photoshoot's unused dark-background frame). Rebuild pass: see that
// same file's CityWelcomeBlock comment — this section is now a real
// Welcome-shaped composition.
const MID_PAGE_PHOTO_URL = "/design-lab/photos/04.webp";
const MID_PAGE_PHOTO_ALT = "Giuseppe Iannone, ritratto.";

const PRACTISING_SINCE_YEAR = "2013";

function credentialLine(locale: Locale, registrationNumber: string | undefined) {
  if (!registrationNumber) return null;
  return locale === "en"
    ? `Registered with the Order of Psychologists of Lombardy, no. ${registrationNumber} · practising since ${PRACTISING_SINCE_YEAR}`
    : `Iscritto all'Albo degli Psicologi della Lombardia n. ${registrationNumber} · in studio dal ${PRACTISING_SINCE_YEAR}`;
}

// Identical to psicologo-milano/page.tsx's own CITY_WELCOME_COPY (verbatim,
// per brief). No list — see CityWelcomeBlock.tsx's own top comment.
const CITY_WELCOME_COPY = {
  it: {
    kicker: "Il primo passo",
    heading: "Il primo colloquio serve a capire insieme cosa sta succedendo",
    headingEmphasisWord: "capire insieme",
    lead: "Dura quarantacinque minuti e non comporta impegno a proseguire. Le domande le faccio io — non serve arrivare preparato, e non serve sapere già da dove cominciare.",
    ctaLabel: "Scrivimi",
  },
  en: {
    kicker: "The first step",
    heading: "A first session is there to work out together what is going on",
    headingEmphasisWord: "together",
    lead: "It lasts forty-five minutes and commits you to nothing. I ask the questions — you do not need to arrive prepared, and you do not need to know where to begin.",
    ctaLabel: "Write to me",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const [data, siteSettings] = await Promise.all([getMonzaPage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: monzaPath("it"),
      en: monzaPath("en"),
    },
  });
}

function toBands(locale: Locale, bands: AreaBand[] | undefined) {
  return (bands ?? []).map((band) => ({
    heading: band.heading ?? "",
    p1: band.p1 ?? "",
    p2: band.p2,
    links: (band.links ?? [])
      .filter((link): link is { label: string; slug: string } => Boolean(link.label && link.slug))
      .map((link) => ({ label: link.label, href: pillarPath(locale, link.slug) })),
  }));
}

export default async function MonzaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [data, contactCopy, siteSettings, tDiplomi, tContactDialog] = await Promise.all([
    getMonzaPage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "Diplomi" }),
    getTranslations({ locale, namespace: "ContactDialog" }),
  ]);

  const contactSection = contactCopy?.contactSection;
  const midPageCredentialLine = credentialLine(typedLocale, siteSettings?.author?.registrationNumber);
  const closeLabel = tDiplomi("closeLabel");
  const contactDialogHeading = tContactDialog("heading");
  const cityWelcomeCopy = CITY_WELCOME_COPY[typedLocale];

  return (
    <main className={styles.page} data-light-hero>
      {/* === 1. HERO === */}
      <CenteredHero
        kicker={data?.kicker ?? ""}
        title={data?.title ?? ""}
        titleEmphasisWord={data?.titleEmphasisWord}
        lead={data?.lead ?? ""}
      />

      {/* === 2. MONZA OR MILANO — split, right after the hero === */}
      <div className="themeDark">
        <SplitBlock
          left={{
            label: data?.split?.left?.label ?? "",
            heading: data?.split?.left?.heading ?? "",
            p1: data?.split?.left?.p1 ?? "",
            p2: data?.split?.left?.p2 ?? "",
          }}
          right={{
            label: data?.split?.right?.label ?? "",
            heading: data?.split?.right?.heading ?? "",
            p1: data?.split?.right?.p1 ?? "",
            p2: data?.split?.right?.p2 ?? "",
          }}
        />
      </div>

      {/* === 3. CONFIDENTIALITY — this page's own epigraph band === */}
      <div className="themeDark">
        <EpigraphBand
          kicker={data?.confidentiality?.kicker ?? ""}
          epigraph={data?.confidentiality?.epigraph ?? ""}
          paragraphs={[data?.confidentiality?.p1, data?.confidentiality?.p2, data?.confidentiality?.p3].filter(
            (p): p is string => Boolean(p),
          )}
        />
      </div>

      {/* === 4. FOUR AREAS — stacked bands, with pillar links === */}
      <div className="themeDark">
        <StackedBands tone="surface" bands={toBands(typedLocale, data?.fourAreas?.bands)} />
      </div>

      {/* === 5. WORKING WHERE YOU LIVE — asymmetric offset. Its own offset
          column is retired — this block now renders its main column
          only; the mid-page section below carries its own, unrelated
          copy. === */}
      <AsymmetricOffsetBlock
        kicker={data?.asymmetric?.kicker ?? ""}
        heading={data?.asymmetric?.heading ?? ""}
        headingEmphasisWord={data?.asymmetric?.headingEmphasisWord}
        p1={data?.asymmetric?.p1 ?? ""}
        p2={data?.asymmetric?.p2 ?? ""}
      />

      {/* === 5b. Real Welcome-shaped mid-page section — see
          CityWelcomeBlock.tsx's own top comment and
          psicologo-milano/page.tsx's own identical usage, including the
          themeDark wrapper's own comment there (required — the sheen-
          guard hazard pattern otherwise, not decorative). === */}
      <div className="themeDark">
        <CityWelcomeBlock
          kicker={cityWelcomeCopy.kicker}
          heading={cityWelcomeCopy.heading}
          headingEmphasisWord={cityWelcomeCopy.headingEmphasisWord}
          lead={cityWelcomeCopy.lead}
          ctaLabel={cityWelcomeCopy.ctaLabel}
          authorName={siteSettings?.author?.name ?? "Giuseppe Iannone"}
          credentialLine={midPageCredentialLine ?? undefined}
          photoUrl={MID_PAGE_PHOTO_URL}
          photoAlt={MID_PAGE_PHOTO_ALT}
          locale={typedLocale}
          closeLabel={closeLabel}
          contactDialogHeading={contactDialogHeading}
        />
      </div>

      {/* === 6. PRACTICAL — no closing quote on this page === */}
      <PracticalClosing
        columns={[
          { heading: data?.practical?.col1?.heading ?? "", body: data?.practical?.col1?.p ?? "" },
          { heading: data?.practical?.col2?.heading ?? "", body: data?.practical?.col2?.p ?? "" },
          { heading: data?.practical?.col3?.heading ?? "", body: data?.practical?.col3?.p ?? "" },
        ]}
      />

      <ContactBlock
        kicker={contactSection?.kicker ?? ""}
        heading={contactSection?.heading ?? ""}
        headingEmphasisWord={contactSection?.headingEmphasisWord}
        photoCaption={contactSection?.photoCaption ?? ""}
        googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
        googleProfileUrl={siteSettings?.googleProfileUrl}
        locale={typedLocale}
        photoUrl={CONTACT_PHOTO_URL}
        photoAlt={CONTACT_PHOTO_ALT}
      />
    </main>
  );
}
