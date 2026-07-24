import type { Image as SanityImage } from "sanity";
import type { Metadata } from "next";
import NextImage from "next/image";
import { AreeSection } from "@/components/AreeSection";
import { FaqSection } from "@/components/FaqSection";
import { FinalContactSection } from "@/components/FinalContactSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroOverlap } from "@/components/HeroOverlap";
import { HopeSection } from "@/components/HopeSection";
import { LenisProvider } from "@/components/LenisProvider";
import { LocationsSection, type SedeData } from "@/components/LocationsSection";
import { RecognitionSection } from "@/components/RecognitionSection";
import { type RealArticle, ResourcesSection } from "@/components/ResourcesSection";
import { sanityFetch } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { resolveRobots } from "@/sanity/metadata";
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
import { getSiteSettings } from "@/sanity/seo";
import { CertificatesMarquee } from "./density/CertificatesMarquee";
import { CtaBridgeBlock } from "./CtaBridgeBlock";
import { DiplomiBlock } from "./density/DiplomiBlock";
import { CHI_SONO, CREDENTIALS, MARQUEE_ITEMS, METODO, THE_SPACE } from "./density/content";
import densityStyles from "./density/density.module.scss";
import { MetodoInteractive } from "./density/MetodoInteractive";
import { ParallaxFrame } from "./density/ParallaxFrame";
import { ScrambleValue } from "./density/ScrambleValue";
import { SignatureBandTuned } from "./SignatureBandTuned";
import { VideoBlock } from "./VideoBlock";
import { ViewportWidthFix } from "./ViewportWidthFix";

const LOCALE: Locale = "it";

// Assembled proposed homepage — the density page's own reworked blocks
// (Metodo/Credentials/Lo spazio/Marquee, all hardcoded content, no CMS
// wiring per this pass's own constraint) combined with the REAL,
// currently-live homepage sections (real CMS data, same queries/props
// [locale]/page.tsx already uses). Gated identically to
// /design-lab/density: hard 404 in production, noindex as a redundant
// second layer, unlinked, absent from sitemap. Italian only — no /en
// variant (this pass's own "Italian only, no i18n" constraint), so
// unlike density this route has no locale sub-path at all.
export const metadata: Metadata = {
  title: "Proposta homepage — anteprima (interno)",
  robots: resolveRobots(true),
};

interface QualificationItemData {
  _key: string;
  year: string;
  title: string;
  institution: string;
  tier: "titolo" | "formazione_continua";
  document?: SanityImage;
  documentLqip?: string;
}

// V1: Chi sono now uses the density page's own hardcoded copy in full
// (see CHI_SONO in ./density/content) — this fetch stays only to source
// the real portrait asset for the new photo-break frame, per this
// pass's own "put the existing portrait asset into that frame — no
// placeholder" instruction. Kicker/title/paragraphs/pullQuote/storyLink
// are fetched by the real query but intentionally unread here.
interface ChiSonoSectionData {
  portrait?: SanityImage & { alt?: string };
  portraitLqip?: string;
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
  hero?: {
    headline?: string;
    headlineEmphasisWord?: string;
    positioningStatement?: string;
    ctaLabel?: string;
    photo?: SanityImage;
    youtubeId?: string;
  };
  hope?: { eyebrow?: string; heading?: string; headingEmphasisWord?: string };
  diplomi?: {
    kicker?: string;
    heading?: string;
    alboLine?: string;
    items?: QualificationItemData[];
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

// PREVIEW-GATE (temporary) — this route's hard production 404 (`if
// (isProductionDeployment()) notFound()`) is deliberately REMOVED here so
// the client can review this page at its real production URL — noindex
// (metadata.robots above, resolveRobots(true) — unconditional, not
// environment-driven) still applies, so it stays unindexed and unlinked
// either way. Reversal: re-add the isProductionDeployment()/notFound()
// gate (see /design-lab/density's own page.tsx, .../density/en/page.tsx,
// or git history on this file, for the exact block) once client review
// is done — flagged in docs/pre-launch.md.
export default async function DesignLabHomepage() {
  const [homePage, chiSono, aree, areas, ctaBridge, siteSettings, realArticles, sedes] =
    await Promise.all([
      sanityFetch<HomePageData | null>(homePageQuery, { locale: LOCALE }, ["homePage"]),
      sanityFetch<ChiSonoSectionData | null>(chiSonoSectionQuery, { locale: LOCALE }, ["chiSonoSection"]),
      sanityFetch<AreeSectionData | null>(areeSectionQuery, { locale: LOCALE }, ["areeSection"]),
      sanityFetch<AreaData[]>(areasQuery, { locale: LOCALE }, ["area"]),
      sanityFetch<CtaBridgeSectionData | null>(ctaBridgeSectionQuery, { locale: LOCALE }, ["ctaBridgeSection"]),
      getSiteSettings(LOCALE),
      sanityFetch<RealArticle[]>(latestArticlesQuery, { locale: LOCALE }, ["article"]),
      sanityFetch<SedeData[]>(sedesQuery, { locale: LOCALE }, ["sede"]),
    ]);

  const metodo = METODO.it;
  const credentials = CREDENTIALS.it;
  const theSpace = THE_SPACE.it;
  const chiSonoText = CHI_SONO.it;

  // V1: reuses the existing square portrait (the only real asset that
  // exists today) cropped to a 16:9 letterbox via object-fit: cover —
  // NOT a placeholder. SWAP FILE ONCE THE LANDSCAPE PHOTO EXISTS: only
  // this portraitUrl/portraitAlt/portraitLqip block below needs to
  // change (new urlFor() source + new lqip) — .photoFrame/.photoFrameImg
  // (density.module.scss) already assume a 16:9 source and won't need
  // any layout change.
  const portraitUrl = chiSono?.portrait
    ? urlFor(chiSono.portrait).width(1600).format("webp").quality(80).url()
    : undefined;
  const portraitAlt = chiSono?.portrait?.alt ?? "";
  const portraitLqip = chiSono?.portraitLqip;

  // FIX 2: stand-in for "Lo spazio" Frame A — the video poster (1000x667,
  // already landscape/3:2, alt "Vedi come lavoro, prima di scrivermi")
  // crops far more naturally into the 16:9 frame than the ~1:1 hero
  // photo would, and reads thematically closer to "how he works" than a
  // plain headshot. Still not the real room — the caption below says so
  // explicitly.
  const spaceStandInUrl = homePage?.video?.poster
    ? urlFor(homePage.video.poster).width(1600).format("webp").quality(80).url()
    : undefined;

  return (
    <LenisProvider>
      <div className={densityStyles.root}>
        <ViewportWidthFix />
        <Header locale={LOCALE} contactChannels={siteSettings?.contactChannels} />

        <header className={densityStyles.pageHeader}>
          <h1 className={densityStyles.pageTitle}>Proposta homepage</h1>
          <p className={densityStyles.pageNote}>
            Questa è la proposta di homepage costruita a partire dai blocchi rilavorati e da
            quelli esistenti.
          </p>
          <p className={densityStyles.pageNote}>Le cornici grigie indicano dove andranno le fotografie.</p>
        </header>

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

        {/* Fix 1: Hero→Recognition gap reduced by one spacing step. At lg
            the gap is 100% Recognition's own padding-top (--space-8,
            64px — Hero's own root contributes 0 at that breakpoint,
            verified); below lg both sides contribute (--space-8 bottom
            on Hero's text + --space-7 top on Recognition = 112px). One
            step down is a 16px delta on both sides of this part of the
            scale (--space-8→-7 and --space-7→-6 are both exactly 16px),
            so a flat -1rem margin here (not a --space-8 token override,
            which risks touching other uses of that token inside
            Recognition's own subtree) reduces the gap by one step at
            every breakpoint without touching either real file. */}
        <div style={{ marginTop: "-1rem" }}>
          <RecognitionSection
            kicker={homePage?.recognition?.kicker ?? ""}
            heading={homePage?.recognition?.heading ?? ""}
            bridgeLine={homePage?.recognition?.bridgeLine ?? ""}
            fragments={homePage?.recognition?.fragments}
          />
        </div>

        {/* V3: Hope is a real, shared component — wrapped rather than
            edited so it gets the same rich dark treatment as Credentials
            and the Footer without touching HopeSection.module.scss. See
            density.module.scss's own comment on .richDarkWrap for why
            this is safe (Hope uses --color-accent for its background
            ONLY, once). */}
        <div className={densityStyles.richDarkWrap}>
          <div className={densityStyles.richDarkGrain} aria-hidden="true" />
          <div className={densityStyles.richDarkContent}>
            <HopeSection
              eyebrow={homePage?.hope?.eyebrow ?? ""}
              heading={homePage?.hope?.heading ?? ""}
              headingEmphasisWord={homePage?.hope?.headingEmphasisWord}
            />
          </div>
        </div>

        {/* Metodo — density's full-bleed zigzag, replacing JourneySection
            entirely. Hardcoded content (this pass's own constraint: no
            CMS wiring for density blocks), not homePage.percorso. */}
        <section className={densityStyles.section} aria-labelledby="metodo-heading">
          <div className={densityStyles.metodoHeader}>
            <div className={densityStyles.sectionHeadingCol}>
              <p className={densityStyles.metodoKicker}>{metodo.kicker}</p>
              <h2 id="metodo-heading" className={densityStyles.metodoHeading}>
                {metodo.heading}
              </h2>
            </div>
            <p
              className={`${densityStyles.metodoParagraph} ${densityStyles.sectionIntro} ${densityStyles.sectionIntroRight}`}
            >
              {metodo.paragraph}
            </p>
          </div>

          <MetodoInteractive steps={metodo.steps} />
        </section>

        {/* V1: Chi sono replaced entirely with the density version — no
            sticky side portrait, display-scale headline, 2 paragraphs,
            full-width photo frame (real portrait asset, not a
            placeholder), remaining 3 paragraphs. Hardcoded copy
            (CHI_SONO), same as Metodo/Credentials/Lo spazio. */}
        <section className={densityStyles.section} aria-labelledby="chi-sono-heading">
          <h2 id="chi-sono-heading" className={densityStyles.heading}>
            {chiSonoText.title}{" "}
            <em className={densityStyles.emphasis}>{chiSonoText.emphasis}</em>
            {chiSonoText.titleEnd}
          </h2>

          <div className={densityStyles.textBlock}>
            {chiSonoText.paragraphsBeforePhoto.map((p) => (
              <p key={p} className={densityStyles.paragraph}>
                {p}
              </p>
            ))}
          </div>

          <figure className={densityStyles.photoBreak}>
            <div className={densityStyles.photoFrame}>
              {portraitUrl ? (
                <NextImage
                  src={portraitUrl}
                  alt={portraitAlt}
                  fill
                  sizes="(min-width: 82.5rem) 1224px, 100vw"
                  className={densityStyles.photoFrameImg}
                  {...(portraitLqip
                    ? { placeholder: "blur" as const, blurDataURL: portraitLqip }
                    : {})}
                />
              ) : null}
            </div>
          </figure>

          <div className={densityStyles.textBlock}>
            {chiSonoText.paragraphsAfterPhoto.map((p) => (
              <p key={p} className={densityStyles.paragraph}>
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* Credentials band — density's full-bleed gradient/sheen/grain
            band with the scramble reveal. Hardcoded content. */}
        <section className={densityStyles.credentialsBand} aria-label="Credenziali">
          <div className={densityStyles.credentialsGrain} aria-hidden="true" />
          <div className={densityStyles.credentialsInner}>
            <ul className={densityStyles.credentialsList}>
              {credentials.items.map((item) => (
                <li key={item.detail} className={densityStyles.credentialsItem}>
                  <p className={densityStyles.credentialsValue}>
                    <ScrambleValue value={item.value} />
                  </p>
                  <p className={densityStyles.credentialsCaption}>
                    {item.unit ? `${item.unit} ${item.detail}` : item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Aree — the REAL component/data, not the density variant. */}
        <AreeSection
          kicker={aree?.kicker ?? ""}
          title={aree?.title ?? ""}
          intro={aree?.intro}
          areas={areas}
          previewHover={aree?.previewHover}
          locale={LOCALE}
        />

        <CtaBridgeBlock
          title={ctaBridge?.title ?? ""}
          titleEmphasis={ctaBridge?.titleEmphasis}
          body={ctaBridge?.body ?? ""}
          linkLabel={ctaBridge?.linkLabel ?? ""}
        />

        {/* Diplomi — item 8: real data (all 4 live items, same as the
            real component), but the real DiplomiSection's own container-
            width track can't be made to bleed without touching that
            file, so this reuses density's own DiplomiBlock reproduction
            instead (already built for the density page — same scroll-
            snap/arrow mechanics, consolidated icon-button), scaled up
            and bleeding the container on the right edge only. */}
        <section className={densityStyles.section} aria-labelledby="diplomi-block-heading">
          <DiplomiBlock
            kicker={homePage?.diplomi?.kicker ?? ""}
            heading={homePage?.diplomi?.heading ?? ""}
            alboLine={homePage?.diplomi?.alboLine}
            headingId="diplomi-block-heading"
            items={(homePage?.diplomi?.items ?? []).map((item) => ({
              year: item.year,
              title: item.title,
              institution: item.institution,
            }))}
          />
        </section>

        {/* Certificates marquee — density, autoplay, hardcoded content,
            directly beneath Diplomi per this pass's own order. */}
        <CertificatesMarquee items={MARQUEE_ITEMS} />

        {/* Lo spazio — item 2: Frame B ("I dettagli restano semplici")
            and its text deleted entirely per this pass's own explicit
            instruction — it added nothing the page didn't already say.
            Only Frame A (the aperture-reveal parallax) remains. */}
        <section className={densityStyles.section} aria-labelledby="lo-spazio-heading">
          <p className={densityStyles.metodoKicker} id="lo-spazio-heading">
            {theSpace.kicker}
          </p>

          <div className={densityStyles.spaceBlock}>
            <div className={densityStyles.spaceText}>
              <h3 className={densityStyles.spaceHeading}>{theSpace.blocks[0]?.heading}</h3>
              <p className={densityStyles.spaceParagraph}>{theSpace.blocks[0]?.paragraph}</p>
            </div>
            <figure className={densityStyles.fullBleedFrame}>
              <ParallaxFrame
                aspect={theSpace.blocks[0]?.aspect}
                label={`Frame A — ${theSpace.blocks[0]?.aspect}`}
                imageUrl={spaceStandInUrl}
                imageAlt="Fermo immagine — segnaposto per la foto reale dello studio"
              />
            </figure>
            <p className={densityStyles.photoCaption}>
              Segnaposto: fermo immagine dal video, non la stanza reale. {theSpace.blocks[0]?.caption}
            </p>
          </div>
        </section>

        {/* Video — differentiation pass: rebuilt as an asymmetric two-
            column block (see VideoBlock.tsx) instead of the real
            VideoSection's centered-stack layout, which read as the same
            "media box + text beside it" device Lo spazio's Frame B also
            used. Real data, real VideoPlayer mechanics, unchanged. */}
        <VideoBlock
          kicker={homePage?.video?.kicker}
          heading={homePage?.video?.heading}
          lead={homePage?.video?.lead}
          videoUrl={homePage?.video?.videoUrl}
          poster={homePage?.video?.poster}
          captionsUrl={homePage?.video?.captionsUrl}
          locale={LOCALE}
        />

        {/* Sedi — the REAL interactive map component, not the density
            static placeholder. */}
        <LocationsSection
          kicker={homePage?.sedi?.kicker ?? ""}
          heading={homePage?.sedi?.heading ?? ""}
          paragraph={homePage?.sedi?.paragraph}
          sedes={sedes}
          locale={LOCALE}
        />

        <FaqSection
          kicker={homePage?.faq?.kicker ?? ""}
          heading={homePage?.faq?.heading ?? ""}
          linkLabel={homePage?.faq?.linkLabel ?? ""}
          locale={LOCALE}
          items={homePage?.faq?.items}
        />

        {/* Contact band — fix 1: the base+sheen+vignette overlay was
            painting ABOVE the real form, not behind it — position:
            absolute elements always paint above non-positioned content
            regardless of z-index or DOM order (CSS stacking order:
            "positioned, z-index:auto" is a strictly higher category than
            "non-positioned block", not something z-index alone can
            override), and the real FinalContactSection's own DOM has no
            position of its own. pointer-events: none meant clicks passed
            through to the form underneath, but the form was still
            visually hidden under the overlay's own opaque base fill —
            "renders, but you can't see or read it" is exactly what was
            reported. Fixed by giving the form's own wrapper an explicit
            position: relative + a z-index HIGHER than the overlay's, so
            it participates in the same stacking comparison instead of
            losing automatically. Grain stays above everything (same as
            Hope/Credentials/Footer) — proven negligible on legibility at
            5% opacity/soft-light. */}
        <div className={densityStyles.richDarkWrapContact}>
          <div className={densityStyles.richDarkOverlayContact} aria-hidden="true" />
          <div className={densityStyles.richDarkContactContent}>
            <FinalContactSection
              kicker={homePage?.finalCta?.kicker ?? ""}
              heading={homePage?.finalCta?.heading ?? ""}
              body={homePage?.finalCta?.body ?? ""}
              googleProfileLabel={homePage?.finalCta?.googleProfileLabel ?? ""}
              googleProfileUrl={siteSettings?.googleProfileUrl}
              locale={LOCALE}
            />
          </div>
          <div className={densityStyles.richDarkGrainContact} aria-hidden="true" />
        </div>

        <ResourcesSection
          kicker={homePage?.risorse?.kicker ?? ""}
          heading={homePage?.risorse?.heading ?? ""}
          locale={LOCALE}
          realArticles={realArticles}
          allArticlesLabel={homePage?.risorse?.allArticlesLabel ?? ""}
        />

        <SignatureBandTuned />
      </main>

        {/* Footer — the REAL component, wrapped the same way Hope is
            (V3: one shared dark treatment across the page, not editing
            Footer.module.scss — verified the same way: --color-accent is
            used for Footer's own background ONLY, once, nothing else in
            its subtree depends on it). Header + LenisProvider now
            present (C2/C3) — neither needs NextIntlClientProvider,
            confirmed no component rendered on this page calls
            next-intl's client-side useTranslations(). */}
        <div className={densityStyles.richDarkWrap}>
          <div className={densityStyles.richDarkGrain} aria-hidden="true" />
          <div className={densityStyles.richDarkContent}>
            <Footer
              locale={LOCALE}
              authorName={siteSettings?.author?.name ?? ""}
              authorCredentials={siteSettings?.author?.credentials}
              authorRegistrationNumber={siteSettings?.author?.registrationNumber}
              contactChannels={siteSettings?.contactChannels}
              piva={siteSettings?.piva}
              sedes={sedes}
              crisisSupportText={siteSettings?.crisisSupportText}
              googleProfileUrl={siteSettings?.googleProfileUrl}
              socialLinks={siteSettings?.socialLinks}
            />
          </div>
        </div>
      </div>
    </LenisProvider>
  );
}
