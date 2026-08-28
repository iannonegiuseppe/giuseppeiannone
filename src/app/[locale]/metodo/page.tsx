import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AsymmetricOffsetBlock } from "@/components/AsymmetricOffsetBlock";
import { CenteredHero } from "@/components/CenteredHero";
import { ContactBlock } from "@/components/ContactBlock";
import { EpigraphBand } from "@/components/EpigraphBand";
import { MetodoRelationshipPhoto } from "@/components/MetodoRelationshipPhoto";
import { PracticalClosing } from "@/components/PracticalClosing";
import { SplitBlock } from "@/components/SplitBlock";
import { StackedBands } from "@/components/StackedBands";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { sanityFetch } from "@/sanity/client";
import { CONTACT_PHOTO_URL, CONTACT_PHOTO_ALT } from "@/sanity/contactPhoto";
import { methodPath } from "@/sanity/paths";
import { contactSectionQuery, methodPageQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import { urlFor } from "@/sanity/image";
import styles from "./page.module.scss";

interface MethodPhase {
  label?: string;
  heading?: string;
  p1?: string;
  p2?: string;
}

interface MethodSplitSide {
  label?: string;
  heading?: string;
  p1?: string;
  p2?: string;
  p3?: string;
}

interface MethodBand {
  heading?: string;
  p1?: string;
  p2?: string;
}

interface MethodColumn {
  heading?: string;
  p?: string;
}

interface MethodPageData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  lead?: string;
  split?: { left?: MethodSplitSide; right?: MethodSplitSide };
  path?: {
    kicker?: string;
    heading?: string;
    phaseOne?: MethodPhase;
    phaseTwo?: MethodPhase;
    phaseThree?: MethodPhase;
    diary?: { heading?: string; p?: string; quote?: string };
    experiments?: { heading?: string; p1?: string; rhythmLeadIn?: string; rhythmBody?: string };
  };
  relationship?: { kicker?: string; epigraph?: string; p1?: string; p2?: string; p3?: string };
  approach?: {
    kicker?: string;
    heading?: string;
    headingEmphasisWord?: string;
    p1?: string;
    p2?: string;
    offset?: { heading?: string; p1?: string; p2?: string };
  };
  fitEnding?: { band1?: MethodBand; band2?: MethodBand };
  practical?: { col1?: MethodColumn; col2?: MethodColumn; col3?: MethodColumn; closingQuote?: string };
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

function getMethodPage(locale: string) {
  return sanityFetch<MethodPageData | null>(methodPageQuery, { locale }, ["methodPage"]);
}

// Copy-pasted from every other real page's own private helper (faq/
// page.tsx, contatti/page.tsx) rather than a new shared export — matching
// this codebase's own established convention.
function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

// CONTACT_PHOTO_URL/ALT: single-sourced (src/sanity/contactPhoto.ts) — was
// its own local const here.

// Section 4 ("La relazione") photo — same manually-constructed-reference
// pattern as page.tsx's own welcomePhotoUrl/portraitUrl (this field isn't
// wired into methodPageQuery's own GROQ projection, same reasoning as
// those two). Moved here from section 6 ("Fit and Ending") — same asset,
// renamed constant to match its new home.
const RELATIONSHIP_PHOTO_URL = urlFor({
  asset: { _ref: "image-84b6209387b4bbdacd096b99966766b192d7958a-1440x1440-webp", _type: "reference" },
}).url();
const RELATIONSHIP_PHOTO_ALT = "Giuseppe Iannone, ritratto.";

// Splits `text` at the first occurrence of `emphasis` and wraps that span
// in the given render function — same indexOf-based mechanism every real
// page's own headingEmphasisWord/titleEmphasisWord split already uses
// (chi-sono, prezzi, contatti), not a second one.
function splitEmphasis(text: string, emphasis: string | undefined, render: (s: string) => React.ReactNode) {
  const index = emphasis ? text.indexOf(emphasis) : -1;
  if (!emphasis || index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      {render(emphasis)}
      {text.slice(index + emphasis.length)}
    </>
  );
}

// Section 3's "Il ritmo." / "The rhythm." lead-in — same splitting
// mechanism as splitEmphasis above, reused rather than a second one, just
// rendering a <strong> instead of <ShimmerText>.
function splitLeadIn(text: string, leadIn: string | undefined) {
  return splitEmphasis(text, leadIn, (s) => <strong className={styles.leadIn}>{s}</strong>);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as "it" | "en";
  const [data, siteSettings] = await Promise.all([getMethodPage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: methodPath("it"),
      en: methodPath("en"),
    },
  });
}

export default async function MetodoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as "it" | "en";

  const [data, contactCopy, siteSettings] = await Promise.all([
    getMethodPage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
  ]);

  const contactSection = contactCopy?.contactSection;
  const title = data?.title ?? "";
  const approachHeading = data?.approach?.heading ?? "";

  const rhythmNode = splitLeadIn(data?.path?.experiments?.rhythmBody ?? "", data?.path?.experiments?.rhythmLeadIn);

  const relationshipParagraphs = [data?.relationship?.p1, data?.relationship?.p2, data?.relationship?.p3].filter(
    (p): p is string => Boolean(p),
  );

  return (
    <main className={styles.page} data-light-hero>
      {/* === 1. HERO — light island, centred ================================ */}
      <CenteredHero
        kicker={data?.kicker ?? ""}
        title={title}
        titleEmphasisWord={data?.titleEmphasisWord}
        lead={data?.lead ?? ""}
      />

      {/* === 2. THE SPLIT — dark left / surface right, 50/50, zero gap ======
          "themeDark" (plain global class, src/styles/_tokens.scss) wraps
          the WHOLE grid as an ANCESTOR of both halves, never the same
          element as either half's own background — the documented
          light-island mirror-image trap (CLAUDE.md), same fix already
          proven on /prezzi's dark band and this project's own /contatti
          WhatsApp card. Both halves need it: the left's --color-bg fill
          and the right's --color-surface fill are themselves unaffected
          by light-island-surface (neither token is in its reassignment
          list), but BOTH halves' text (--color-text/--color-accent) IS
          reassigned by it, so both need the correction regardless of
          which one owns the "safe" background token. SplitBlock itself
          never carries this class — see its own file comment. */}
      <div className="themeDark">
        <SplitBlock
          left={{
            label: data?.split?.left?.label ?? "",
            heading: data?.split?.left?.heading ?? "",
            p1: data?.split?.left?.p1 ?? "",
            p2: data?.split?.left?.p2 ?? "",
            p3: data?.split?.left?.p3,
          }}
          right={{
            label: data?.split?.right?.label ?? "",
            heading: data?.split?.right?.heading ?? "",
            p1: data?.split?.right?.p1 ?? "",
            p2: data?.split?.right?.p2 ?? "",
            p3: data?.split?.right?.p3,
          }}
        />
      </div>

      {/* === 3. THE PATH — light island, three columns + rule + two columns */}
      <section className={styles.pathSection}>
        <div className={styles.pathHeader}>
          <p className={styles.kicker}>
            <SectionKicker>{data?.path?.kicker ?? ""}</SectionKicker>
          </p>
          <h2 className={styles.h2}>{data?.path?.heading}</h2>
        </div>

        <div className={styles.pathColumns}>
          <div className={styles.pathColumnAccent}>
            <p className={styles.pathPhaseLabel}>{data?.path?.phaseOne?.label}</p>
            <h3 className={styles.h3}>{data?.path?.phaseOne?.heading}</h3>
            <p className={styles.bodyP}>{data?.path?.phaseOne?.p1}</p>
            <p className={styles.bodyP}>{data?.path?.phaseOne?.p2}</p>
          </div>
          <div className={styles.pathColumn}>
            <p className={styles.pathPhaseLabel}>{data?.path?.phaseTwo?.label}</p>
            <h3 className={styles.h3}>{data?.path?.phaseTwo?.heading}</h3>
            <p className={styles.bodyP}>{data?.path?.phaseTwo?.p1}</p>
            <p className={styles.bodyP}>{data?.path?.phaseTwo?.p2}</p>
          </div>
          <div className={styles.pathColumn}>
            <p className={styles.pathPhaseLabel}>{data?.path?.phaseThree?.label}</p>
            <h3 className={styles.h3}>{data?.path?.phaseThree?.heading}</h3>
            <p className={styles.bodyP}>{data?.path?.phaseThree?.p1}</p>
            <p className={styles.bodyP}>{data?.path?.phaseThree?.p2}</p>
          </div>
        </div>

        <div className={styles.pathRule} />

        <div className={styles.pathBelow}>
          <div>
            <h3 className={styles.h3}>{data?.path?.diary?.heading}</h3>
            <p className={styles.bodyPMarginBottom}>{data?.path?.diary?.p}</p>
            <div className={styles.quoteCard}>
              <p className={styles.quoteCardText}>{data?.path?.diary?.quote}</p>
            </div>
          </div>
          <div>
            <h3 className={styles.h3}>{data?.path?.experiments?.heading}</h3>
            <p className={styles.bodyP}>{data?.path?.experiments?.p1}</p>
            <p className={styles.rhythmP}>{rhythmNode}</p>
          </div>
        </div>
      </section>

      {/* === 4. THE RELATIONSHIP — dark, epigraph + paragraphs beside a photo
          EpigraphBand paints its own explicit background/color (see its
          own file comment for why) — themeDark here still needed for
          every OTHER token it reads (--color-accent via SectionKicker,
          --color-hairline, etc.), same rule as sections 2/6. Photo moved
          here from section 6 ("Fit and Ending") — the epigraph itself
          keeps full width (EpigraphBand.module.scss's own .relationshipInner
          is untouched); only the paragraph row below it gains a photo
          column, so the pull-quote is never narrowed. See
          EpigraphBand.tsx's own comment on the photo props. */}
      <div className="themeDark">
        <EpigraphBand
          kicker={data?.relationship?.kicker ?? ""}
          epigraph={data?.relationship?.epigraph ?? ""}
          paragraphs={relationshipParagraphs}
          photoUrl={RELATIONSHIP_PHOTO_URL}
          photoAlt={RELATIONSHIP_PHOTO_ALT}
        />
      </div>

      {/* === 5. THE APPROACH — light island, asymmetric offset, no grid ===== */}
      <AsymmetricOffsetBlock
        kicker={data?.approach?.kicker ?? ""}
        heading={approachHeading}
        headingEmphasisWord={data?.approach?.headingEmphasisWord}
        p1={data?.approach?.p1 ?? ""}
        p2={data?.approach?.p2 ?? ""}
        offset={{
          heading: data?.approach?.offset?.heading ?? "",
          p1: data?.approach?.offset?.p1 ?? "",
          p2: data?.approach?.offset?.p2 ?? "",
        }}
      />

      {/* === 6. FIT AND ENDING — surface step, two side-by-side bands ======= */}
      <div className="themeDark">
        <StackedBands
          tone="surface"
          bands={[
            {
              heading: data?.fitEnding?.band1?.heading ?? "",
              p1: data?.fitEnding?.band1?.p1 ?? "",
              p2: data?.fitEnding?.band1?.p2,
            },
            {
              heading: data?.fitEnding?.band2?.heading ?? "",
              p1: data?.fitEnding?.band2?.p1 ?? "",
              p2: data?.fitEnding?.band2?.p2,
            },
          ]}
        />
      </div>

      {/* === 7. PRACTICAL AND CLOSING — light island ========================= */}
      <PracticalClosing
        columns={[
          { heading: data?.practical?.col1?.heading ?? "", body: data?.practical?.col1?.p ?? "" },
          { heading: data?.practical?.col2?.heading ?? "", body: data?.practical?.col2?.p ?? "" },
          { heading: data?.practical?.col3?.heading ?? "", body: data?.practical?.col3?.p ?? "" },
        ]}
        closingQuote={data?.practical?.closingQuote}
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
