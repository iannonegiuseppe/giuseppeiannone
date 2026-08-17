import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Image as SanityImage } from "sanity";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import { AreaMosaic, type AreaMosaicItem } from "@/components/AreaMosaic";
import { ChiSonoBodyBlocks, type ChiSonoBodyBlockData } from "@/components/ChiSonoBodyBlocks";
import { ChiSonoCredentials, type ChiSonoCredentialItem } from "@/components/ChiSonoCredentials";
import { ChiSonoGlassCard, type ChiSonoGlassCardFact } from "@/components/ChiSonoGlassCard";
import { ChiSonoHowIWork } from "@/components/ChiSonoHowIWork";
import { ChiSonoParallaxDivider } from "@/components/ChiSonoParallaxDivider";
import { ChiSonoPublications } from "@/components/ChiSonoPublications";
import { ContactBlock } from "@/components/ContactBlock";
import { DiplomiSlider } from "@/components/DiplomiSlider";
import { PillarHero } from "@/components/PillarHero";
import { TimelineSection, type TimelineEntryData } from "@/components/TimelineSection";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { sanityFetch } from "@/sanity/client";
import { resolveDiplomiLabItems } from "@/sanity/diplomi";
import { buildBreadcrumbListJsonLd } from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import { aboutPath, type Locale } from "@/sanity/paths";
import portableTextStyles from "@/sanity/portableTextComponents.module.scss";
import {
  chiSonoDiplomiQuery,
  chiSonoMosaicQuery,
  chiSonoSectionQuery,
  contactSectionQuery,
} from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import styles from "./page.module.scss";

interface WhatIWorkWithData {
  kicker?: string;
  heading?: string;
  intro?: string[];
  closingLine?: string;
}

interface HowIWorkPart {
  title?: string;
  body?: string[];
}

interface HowIWorkData {
  kicker?: string;
  heading?: string;
  intro?: string;
  parts?: HowIWorkPart[];
}

interface ParallaxDividerData {
  line1?: string;
  emphasisWord?: string;
  line2?: string;
  markerLabel?: string;
}

interface ChiSonoCredentialsData {
  kicker?: string;
  tagline?: string;
  taglineEmphasisWord?: string;
  items?: ChiSonoCredentialItem[];
}

type PublicationGroup = "journal" | "book" | "conference";

interface PublicationEntry {
  group?: PublicationGroup;
  authors?: string;
  title?: string;
  source?: string;
  url?: string;
}

interface PublicationsData {
  kicker?: string;
  title?: string;
  note?: string;
  items?: PublicationEntry[];
}

interface ChiSonoData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  heroStandfirst?: string;
  whatIWorkWith?: WhatIWorkWithData;
  glassCard?: { facts?: ChiSonoGlassCardFact[] };
  parallaxDivider?: ParallaxDividerData;
  howIWork?: HowIWorkData;
  credentials?: ChiSonoCredentialsData;
  bodyBlocks?: ChiSonoBodyBlockData[];
  journey?: { kicker?: string; heading?: string; description?: string };
  timeline?: TimelineEntryData[];
  publications?: PublicationsData;
  portrait?: (SanityImage & { alt?: string }) | undefined;
  seo?: SeoFields;
}

interface DiplomiData {
  diplomi?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    intro?: string;
    alboLine?: string;
    items?: Parameters<typeof resolveDiplomiLabItems>[0];
  };
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

// Publications — group labels are structural section headers, not
// citation content, so they're localized here (locale-branched literal,
// same precedent as this file's own workingLanguagesLine below) rather
// than stored per-item on chiSonoSection. Citation content itself
// (authors/title/source) is NOT translated — identical it/en, per the
// source draft's own explicit note.
const PUBLICATION_GROUP_ORDER: PublicationGroup[] = ["journal", "book", "conference"];
const PUBLICATION_GROUP_LABELS: Record<Locale, Record<PublicationGroup, string>> = {
  it: {
    journal: "Riviste con revisione tra pari",
    book: "Capitoli di libro",
    conference: "Contributi a congressi",
  },
  en: {
    journal: "Peer-reviewed journals",
    book: "Book chapters",
    conference: "Conference contributions",
  },
};

// Parallax divider placeholder image — public/design-lab/photos/lo-spazio.webp,
// an atmospheric interior shot already sitting unused in the repo
// (grepped before picking it: no other page references this file). Not
// one of the seven pillar hero images, not a Sanity field (this is
// explicitly placeholder imagery, not editorial content — see
// ChiSonoParallaxDivider.tsx's own comment).
const PARALLAX_DIVIDER_IMAGE_URL = "/design-lab/photos/lo-spazio.webp";

function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

function getMosaicItems(locale: string) {
  return sanityFetch<AreaMosaicItem[]>(chiSonoMosaicQuery, { locale }, ["pillarPage"]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [chiSono, siteSettings] = await Promise.all([
    sanityFetch<ChiSonoData | null>(chiSonoSectionQuery, { locale }, ["chiSonoSection"]),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: locale as "it" | "en",
    title: chiSono?.title ?? "",
    seo: chiSono?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: aboutPath("it"),
      en: aboutPath("en"),
    },
  });
}

// Chi sono full rebuild — every block replaced/reordered per the brief.
// Reordering pass — current order: 1 Hero (full-bleed, PillarHero reused
// verbatim) + 2 the glass card overlapping its bottom boundary; 3 "Di
// cosa mi occupo" + mosaic + 4 credentials (moved here, right after the
// mosaic — was after "Come lavoro"; all three still one continuous light
// island); 5 parallax divider + 6 the pinned timeline (route); 7 the two
// alternating blocks (light — moved here, was after "Come lavoro", now
// the light break between the timeline and "Come lavoro" instead); 8
// "Come lavoro" (dark, resumes the same ambient background as 5-6); 9
// publications + 10 diplomi (unchanged) + 11 contact (unchanged), light.
// Professional details (name/credentials/Albo/P.IVA/addresses/languages,
// formerly block 11 here) removed entirely — the footer already carries
// all of it (title+Albo under the logo, addresses in Sedi, P.IVA in the
// legal line), so this block was a straight repeat sitting right above
// it. getSedes/formatAddressesLine and the sedes fetch this block was
// the only consumer of are gone from this file too; the underlying
// Sanity fields (siteSettings.author, siteSettings.piva, sede documents,
// homePage.diplomi.alboLine) are untouched — still fetched/read by the
// footer and (alboLine, sedes-via-other-consumers) elsewhere, just no
// longer re-read here.
// Surface sequence: DARK(hero) -> LIGHT(3+4) -> DARK(5+6) -> LIGHT(7) ->
// DARK(8) -> LIGHT(9-12) — THREE dark passages now, and the gap between
// passage 2 (5+6) and passage 3 (8) is only ONE light section (7), not
// the two §10.4 requires ("never two adjacent... each separated by at
// least two light sections"). Flagged, not resolved here — this is a
// direct, explicit instruction ("immediately after the timeline section
// and before whatever follows it" = before "Come lavoro"), not an
// oversight; resolving it would mean either accepting the violation,
// finding a different light section to relocate here too, or asking
// "Come lavoro" to not count as fully dark. Left for the owner's call.
// The standalone pull-quote section and the closing strip after the
// mosaic (a paragraph + italic line, both describing the practice by
// negation) are both gone — the pull-quote's content lives inside
// bodyBlocks; the closing strip has no replacement, per instruction
// (chiSonoSection's own pullQuote/pullQuoteFollowUp fields stay
// orphaned, unread, same precedent as paragraphs/storyLink; intro was
// trimmed and closingLine unset in Sanity itself, not just unread).
//
// Timeline promotion pass — the route deck (TimelineRoutePinned.tsx,
// built and iterated across many rounds as one of three ?timeline=
// preview variants) is now the real, permanent block: no more query
// param, TimelineSection is always called with variant="route" below.
// TimelineCaseFile.tsx/TimelinePulse.tsx and the original shipped
// TimelineEntry/TimelineRail default stay in the repo, unreachable from
// this one call site — orphaned, not deleted, same precedent as
// diploma/qualification and pullQuote before them (see chiSonoSection.ts's
// own comment). NOTE (flagged, not fixed here — needs the copy owner's
// input): the parallax divider's own marker label reads "↓ COME LAVORO"
// today, an explicit "scroll down for this" pointer that assumed
// ChiSonoHowIWork was the very next block. It no longer is — the
// timeline now sits between them — so that label currently points past
// the timeline to a section one further down.
// "cards-tabs" is now the permanent design for "Lavori pubblicati" — no
// more ?publications= query param (see ChiSonoPublications.tsx's own
// comment for the promotion, same shape as the timeline's earlier
// route promotion).
//
// "blocks" promotion pass — the ?howiwork= preview query param (five
// proposed green designs, see ChiSonoHowIWork.tsx's own dispatch
// comment) is gone: no more query param, ChiSonoHowIWork is always
// called with variant="blocks" below, same shape as the timeline's and
// publications' own earlier promotions. HowIWorkStagger/Cards/Path/
// Split.tsx stay in the repo, unreachable from this one call site —
// orphaned, not deleted, same precedent as TimelineCaseFile/
// TimelinePulse before them.
export default async function ChiSonoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [chiSono, mosaicItems, diplomiData, contactCopy, siteSettings] = await Promise.all([
    sanityFetch<ChiSonoData | null>(chiSonoSectionQuery, { locale }, ["chiSonoSection"]),
    getMosaicItems(locale),
    sanityFetch<DiplomiData | null>(chiSonoDiplomiQuery, { locale }, ["homePage"]),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
  ]);

  const siteUrl = getSiteUrl();
  const path = aboutPath(typedLocale);

  const trail = await getPillarTrail(typedLocale, chiSono?.title ?? "", path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  const tDiplomi = await getTranslations({ locale, namespace: "Diplomi" });
  const tChiSono = await getTranslations({ locale, namespace: "ChiSono" });
  const diplomiLabItems = resolveDiplomiLabItems(diplomiData?.diplomi?.items);

  const contactSection = contactCopy?.contactSection;
  const contactPhotoUrl = "/design-lab/photos/09.webp";
  const contactPhotoAlt = "Giuseppe Iannone, ritratto.";

  const whatIWorkWith = chiSono?.whatIWorkWith;
  const howIWork = chiSono?.howIWork;
  const parts = howIWork?.parts ?? [];
  const publications = chiSono?.publications;

  const groupLabels = PUBLICATION_GROUP_LABELS[typedLocale];
  const groupedPublications = PUBLICATION_GROUP_ORDER.map((group) => ({
    group,
    label: groupLabels[group],
    items: (publications?.items ?? []).filter((item) => item.group === group),
  })).filter((group) => group.items.length > 0);

  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />

      {/* Block 1 + 2: Hero (full-bleed, dark) + the glass card
          overlapping its bottom boundary. */}
      <div className={styles.heroBoundary}>
        <div className={styles.heroViewport}>
          <PillarHero
            trail={trail}
            heroKicker={chiSono?.kicker ?? ""}
            title={chiSono?.title ?? ""}
            titleEmphasisWord={chiSono?.titleEmphasisWord}
            standfirst={chiSono?.heroStandfirst}
            heroImage={chiSono?.portrait}
            // Hero crop fix — the portrait is close to square, cropped
            // into a much wider lg+ band; centered (the default) cropped
            // into the top of the head. Paired with .heroViewport's own
            // lg+ height bump below — see that rule's own comment for
            // why object-position alone couldn't fix this without
            // cropping the crossed-arms composition down to nothing.
            imageObjectPosition="50% 15%"
          />
        </div>
        <ChiSonoGlassCard facts={chiSono?.glassCard?.facts ?? []} />
      </div>

      <div className={styles.lightIslandTop}>
        {/* Block 3: "Di cosa mi occupo" — heading/intro in the
            container, then the full-bleed area mosaic. The closing strip
            that used to follow the mosaic (a paragraph plus an italic
            line, both describing the practice by negation) is removed
            entirely per instruction — no wrapper, no styles, nothing
            rendered in its place. whatIWorkWith.intro now renders in
            full (was sliced to hold back its last item for that removed
            strip); chiSonoSection.ts's own intro array was trimmed from
            4 items to 3 in Sanity to match, and closingLine was unset,
            not just left unread. */}
        {whatIWorkWith ? (
          <>
            <div className={styles.whatIWorkWith}>
              {whatIWorkWith.kicker ? (
                <p className={styles.whatIWorkWithKicker}>
                  <SectionKicker>{whatIWorkWith.kicker}</SectionKicker>
                </p>
              ) : null}
              {whatIWorkWith.heading ? (
                <h2 className={styles.whatIWorkWithHeading}>{whatIWorkWith.heading}</h2>
              ) : null}
              {(whatIWorkWith.intro ?? []).map((paragraph, index) => (
                <p key={index} className={portableTextStyles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>

            <AreaMosaic
              items={mosaicItems}
              locale={typedLocale}
              subtopicCountLabel={(count) => tChiSono("subtopicCount", { count })}
            />
          </>
        ) : null}

        {/* Block 4 (moved here, was after "Come lavoro"): credentials/
            institutions — the light pause between the mosaic and the
            timeline (both photographic), immediately following the
            mosaic now. Self-contained (own tone.light-island-surface —
            see that component's own .scss), so nesting it inside this
            same light-island wrapper is redundant but harmless, same
            precedent as ContactBlock's own independent re-application. */}
        <ChiSonoCredentials
          kicker={chiSono?.credentials?.kicker}
          tagline={chiSono?.credentials?.tagline}
          taglineEmphasisWord={chiSono?.credentials?.taglineEmphasisWord}
          items={chiSono?.credentials?.items ?? []}
        />
      </div>

      {/* Block 5 (moved — see the ChiSonoParallaxDivider call further
          down, between Diplomi and Publications; it used to sit here).
          Block 6 is now the pinned timeline (route), directly following
          the light island above with no divider buffer between them. */}
      <TimelineSection
        kicker={chiSono?.journey?.kicker}
        heading={chiSono?.journey?.heading}
        description={chiSono?.journey?.description}
        entries={chiSono?.timeline ?? []}
        variant="route"
        locale={typedLocale === "en" ? "en" : "it"}
      />

      {/* Block 7 (moved here, was after "Come lavoro"): the two
          alternating image/text blocks — light, self-contained (own
          tone.light-island-surface), now the light break between the
          timeline and "Come lavoro" rather than sitting after both. */}
      <ChiSonoBodyBlocks blocks={chiSono?.bodyBlocks ?? []} />

      {/* Blocks 8-9 (moved here, were in lightIslandBottom after "Come
          lavoro"): diplomi then publications, in that order — a new
          light island (lightIslandMiddle) since neither DiplomiSlider
          nor ChiSonoPublications carries its own tone.light-island-
          surface; they'd render with the page's dark ambient tokens
          without this wrapper. Merges visually with the bodyBlocks
          section right above it (same flat --light-base-bg fill, no
          seam) into one continuous light passage before "Come lavoro"
          resumes the dark. ChiSonoParallaxDivider (formerly block 5,
          between credentials and the timeline) now sits between the
          two — short variant, max 450px desktop, see that component's
          own comment on the `short` prop.
          FLAGGED, not resolved here: its copy (chiSono.parallaxDivider)
          was written for its OLD position — line1 "Riconoscersi in un
          elenco non è una diagnosi" ("Recognising yourself in a LIST
          isn't a diagnosis") directly references the mosaic/list block
          it used to sit right after, and markerLabel "COME LAVORO" was
          already documented (this file's own earlier comment) as
          pointing past the timeline even in its old spot. Here, neither
          makes sense: there's no "list" near Diplomi/Publications, and
          "Come lavoro" is now three blocks further down, not the next
          one. Moved as literally instructed, copy included — the owner
          needs to decide whether to write new copy for this spot, drop
          it, or accept the mismatch. */}
      <div className={styles.lightIslandMiddle}>
        <section className={styles.qualifications} aria-labelledby="chi-sono-diplomi-heading">
          <DiplomiSlider
            headingId="chi-sono-diplomi-heading"
            kicker={diplomiData?.diplomi?.kicker ?? ""}
            heading={diplomiData?.diplomi?.heading ?? ""}
            headingEmphasisWord={diplomiData?.diplomi?.headingEmphasisWord}
            intro={diplomiData?.diplomi?.intro}
            alboLine={diplomiData?.diplomi?.alboLine}
            closeLabel={tDiplomi("closeLabel")}
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

        <ChiSonoParallaxDivider
          line1={chiSono?.parallaxDivider?.line1}
          emphasisWord={chiSono?.parallaxDivider?.emphasisWord}
          line2={chiSono?.parallaxDivider?.line2}
          markerLabel={chiSono?.parallaxDivider?.markerLabel}
          imageUrl={PARALLAX_DIVIDER_IMAGE_URL}
          short
        />

        <ChiSonoPublications
          kicker={publications?.kicker}
          title={publications?.title}
          note={publications?.note}
          groups={groupedPublications}
          variant="cards-tabs"
          headingId="chi-sono-publications-heading"
        />

        {/* Between "Lavori pubblicati" and "Come lavoro" — same
            AnimatedDivider component ContactBlock/CredentialsBand
            already use, default direction, no delayIndex. Width comes
            from the container wrapper (mixins.container, same as every
            other constrained block on this page); the divider's own
            className only carries vertical margin, same convention as
            .contactRule/.credentialsRule (both margin-only, no width
            override — AnimatedDivider's own width:100% already fills
            whatever contains it). */}
        <div className={styles.publicationsDivider}>
          <AnimatedDivider className={styles.publicationsDividerRule} />
        </div>
      </div>

      {/* Block 10: "Come lavoro" — heading block (kicker/heading/intro)
          on ivory, the four cards on the dark ambient background
          (same native background as blocks 5-6). */}
      <ChiSonoHowIWork
        kicker={howIWork?.kicker}
        heading={howIWork?.heading}
        intro={howIWork?.intro}
        parts={parts}
        variant="blocks"
      />

      <div className={styles.lightIslandBottom}>
        {/* Block 11: Contact — unchanged. Professional details (name/
            credentials/Albo/P.IVA/addresses/languages) used to render
            here, directly above; removed entirely — the footer already
            repeats all of it. */}
        <ContactBlock
          kicker={contactSection?.kicker ?? ""}
          heading={contactSection?.heading ?? ""}
          headingEmphasisWord={contactSection?.headingEmphasisWord}
          photoCaption={contactSection?.photoCaption ?? ""}
          googleProfileLabel={contactCopy?.googleProfileLabel ?? ""}
          googleProfileUrl={siteSettings?.googleProfileUrl}
          locale={typedLocale}
          photoUrl={contactPhotoUrl}
          photoAlt={contactPhotoAlt}
        />
      </div>
    </main>
  );
}
