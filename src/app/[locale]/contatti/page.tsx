import type { Metadata } from "next";
import NextImage from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { getTranslations, setRequestLocale } from "next-intl/server";
import buttonStyles from "@/components/Button.module.scss";
import { ContactBlock } from "@/components/ContactBlock";
import type { LocationEntry, SedeData } from "@/components/LocationsSection";
import { SediMapProvider } from "@/components/SediMapContext";
import { ShimmerText } from "@/components/ShimmerText";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { sanityFetch } from "@/sanity/client";
import { whatsappUrl } from "@/sanity/contact";
import { CONTACT_PHOTO_URL, CONTACT_PHOTO_ALT } from "@/sanity/contactPhoto";
import { urlFor } from "@/sanity/image";
import {
  contactPath,
  hrefFor,
  milanPath,
  monzaPath,
  onlineTherapyPath,
  type Locale,
  type ReferencedDoc,
} from "@/sanity/paths";
import { contactPageQuery, contactSectionQuery, sedesQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import { ContattiLocationCards, type CityPageLink } from "./ContattiLocationCards";
import { ContattiMap } from "./ContattiMap";
import styles from "./page.module.scss";

// 30-minute ISR fallback beneath the revalidateTag webhook — see
// [locale]/page.tsx's own comment for the full rationale. contact/
// page.tsx re-exports this route's default/generateMetadata but restates
// this const on its own — Next's segment-config extraction doesn't
// follow re-exports across files.
export const revalidate = 86400;

interface ContactPageCopyBlock {
  label?: string;
  title?: string;
  body?: string;
  cta?: string;
}

interface ContactPageFactBlock {
  label?: string;
  value?: string;
  note?: string;
}

interface ContactPageData {
  kicker?: string;
  title?: string;
  titleEmphasisWord?: string;
  // Lead-expansion pass: portable-text blocks now (was a plain string —
  // couldn't hold three visual paragraphs or the pillar-page links P2
  // needs; see contactPage.ts's own comment). `unknown` here, not a
  // hand-typed shape: next-sanity's own PortableText component takes
  // `value: unknown` too, and the real per-mark shape (pillarLink's
  // dereferenced target) is narrowed inside introComponents below instead.
  intro?: unknown;
  whatsapp?: ContactPageCopyBlock;
  phone?: ContactPageCopyBlock;
  email?: ContactPageCopyBlock;
  hours?: ContactPageFactBlock;
  appointments?: ContactPageFactBlock;
  sediKicker?: string;
  sediHeading?: string;
  online?: { title?: string; body?: string };
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

function getContactPage(locale: string) {
  return sanityFetch<ContactPageData | null>(contactPageQuery, { locale }, ["contactPage"]);
}

// Copy-pasted from every other real page's own private helper (faq/
// page.tsx, prezzi/page.tsx) rather than a new shared export — matching
// this codebase's own established convention (see prezzi-proposals/
// shared.ts's own comment on the same choice).
function getContactSectionCopy(locale: string) {
  return sanityFetch<ContactSectionCopy | null>(contactSectionQuery, { locale }, ["homePage"]);
}

function getSedes(locale: string) {
  return sanityFetch<SedeData[]>(sedesQuery, { locale }, ["sede"]);
}

// CONTACT_PHOTO_URL/ALT: single-sourced (src/sanity/contactPhoto.ts).

// Hero photo — same manually-constructed-reference pattern as
// page.tsx's own welcomePhotoUrl/portraitUrl (this field isn't wired
// into contactPageQuery's own GROQ projection, same reasoning as
// those). Deliberately the SAME asset as the homepage's own Chi-sono
// portrait (portraitUrl there), not the contact-form cutout further
// down this page or the /blog hero cutout — chosen because he's seated
// facing the camera in the room a visitor would actually come to,
// which matters more here than on the blog (where he's looking down,
// absorbed in his own notebook). Appearing on the homepage too is
// fine: the two pages are never viewed back to back, and the room
// itself is the point on a contact page.
// Decorative, same as every other hero photo on this site (LightPortraitHero's
// own heroVisual wrapper/image pair) — aria-hidden on the column, alt=""
// on the <img> itself; the kicker/heading/intro beside it carry the real
// content, this is atmospheric support, not information of its own.
const HERO_PHOTO_URL = urlFor({
  asset: { _ref: "image-d4826af8101b8002d66bf042e9352f35ff34f452-1448x1086-png", _type: "reference" },
}).url();

// City-page links pass — these three pages were unreachable from
// anywhere on the site before this pass (no nav, no footer, no in-page
// link). This is the first of two links added: each city's own address
// card here, plus a matching one on the online strip below. Wording kept
// short and literal, matching this section's own existing "Indicazioni"
// link rather than introducing new copy tone. No Cernusco entry —
// nothing to link to yet, that page doesn't exist (see this pass's own
// report).
const CITY_PAGE_LINK_TEXT: Record<Locale, { milano: string; monza: string; online: string }> = {
  it: {
    milano: "Tutti i dettagli su Milano",
    monza: "Tutti i dettagli su Monza",
    online: "Tutti i dettagli sull'online",
  },
  en: {
    milano: "More about Milan",
    monza: "More about Monza",
    online: "More about online sessions",
  },
};

// Canonical/hreflang built the Prezzi/Chi-sono/FAQ way: fixed, hardcoded
// from contactPath() directly, never derived from an `alternates` GROQ
// projection — see CLAUDE.md's own "Singleton page routes" section.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as "it" | "en";
  const [data, siteSettings] = await Promise.all([getContactPage(locale), getSiteSettings(locale)]);

  return await buildMetadata({
    locale: typedLocale,
    title: data?.title ?? "",
    seo: data?.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: {
      it: contactPath("it"),
      en: contactPath("en"),
    },
  });
}

// Minimal, dedicated components object for the lead — NOT
// getPortableTextComponents (src/sanity/portableTextComponents.tsx),
// which is the full rich-content set (headings/images/lists/CTA blocks/
// card grids) this three-paragraph lead has no use for and whose schema
// (contactPage.ts's own intro field) doesn't even allow. Only what the
// restricted schema actually permits: normal paragraphs, and the
// pillarLink mark. hrefFor is the same reference->URL resolver
// portableTextComponents.tsx already uses for relatedTopics/
// conditionCard/treatmentCard — reused here too, not a second resolver.
function getIntroComponents(locale: Locale): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => <p className={styles.intro}>{children}</p>,
    },
    marks: {
      pillarLink: ({ value, children }) => {
        const target = value?.target as ReferencedDoc | undefined;
        if (!target?.slug) return <>{children}</>;
        return (
          <Link href={hrefFor(locale, target)} className={styles.introLink}>
            {children}
          </Link>
        );
      },
    },
  };
}

export default async function ContattiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as "it" | "en";

  const [data, contactCopy, siteSettings, sedes] = await Promise.all([
    getContactPage(locale),
    getContactSectionCopy(locale),
    getSiteSettings(locale),
    getSedes(locale),
  ]);

  const whatsappChannel = siteSettings?.contactChannels?.find((c) => c.type === "whatsapp");
  const phoneChannel = siteSettings?.contactChannels?.find((c) => c.type === "phone");
  const emailChannel = siteSettings?.contactChannels?.find((c) => c.type === "email");
  const waHref = whatsappChannel ? whatsappUrl(whatsappChannel.value, typedLocale) : undefined;

  const onlineSede = sedes.find((s) => s.isOnline);
  const physicalLocations = sedes.filter((s) => !s.isOnline);

  // Flattened for the cards and the map alike — same shape/id convention
  // SediBlock's own (private, unexported) buildLocations helper uses,
  // replicated here since this page composes SediMap directly rather than
  // going through SediBlock (see ContattiMap.tsx's own comment for why).
  // centerName deliberately dropped here, not just left unrendered — see
  // this pass's own report on where it's still a live (if currently
  // empty) render risk elsewhere in the app.
  const mapLocations: LocationEntry[] = physicalLocations.flatMap((sede) =>
    (sede.addresses ?? []).map((addr) => ({
      id: `${sede._id}-${addr._key}`,
      city: sede.city,
      address: addr.address,
      district: addr.district,
      lat: addr.lat,
      lng: addr.lng,
      photo: addr.photo,
      photoLqip: addr.photoLqip,
    })),
  );

  const linkText = CITY_PAGE_LINK_TEXT[typedLocale];
  const cityPageLinks: Record<string, CityPageLink> = {
    Milano: { href: milanPath(typedLocale), label: linkText.milano },
    Monza: { href: monzaPath(typedLocale), label: linkText.monza },
  };

  const tLocations = await getTranslations({ locale, namespace: "Locations" });
  const mapLabels = {
    mapAriaLabel: tLocations("mapAriaLabel"),
    googleMapsLabel: tLocations("googleMapsLabel"),
    appleMapsLabel: tLocations("appleMapsLabel"),
    copyAddressLabel: tLocations("copyAddressLabel"),
    copiedLabel: tLocations("copiedLabel"),
    closePopupLabel: tLocations("closePopupLabel"),
    zoomInLabel: tLocations("zoomInLabel"),
    zoomOutLabel: tLocations("zoomOutLabel"),
    scrollHintDesktopCtrl: tLocations("scrollHintDesktopCtrl"),
    scrollHintDesktopCmd: tLocations("scrollHintDesktopCmd"),
    scrollHintTouch: tLocations("scrollHintTouch"),
  };

  const title = data?.title ?? "";
  const emphasisWord = data?.titleEmphasisWord;
  const emphasisIndex = emphasisWord ? title.indexOf(emphasisWord) : -1;
  const titleNode =
    emphasisWord && emphasisIndex !== -1 ? (
      <>
        {title.slice(0, emphasisIndex)}
        <ShimmerText>{emphasisWord}</ShimmerText>
        {title.slice(emphasisIndex + emphasisWord.length)}
      </>
    ) : (
      title
    );

  const contactSection = contactCopy?.contactSection;

  return (
    <main>
      {/* Section 1 — light island. data-light-hero is ShimmerText's own
          "light island ground" marker (see that component's own comment —
          the name predates this non-hero usage, kept as-is per this pass's
          own decision not to rename it). */}
      <div className={styles.channelsWrap} data-light-hero>
        <section className={styles.channelsSection}>
          {/* Photo pass — header's own 672px width/heading font-size are
              untouched: the photo is a new sibling column beside it, not
              a change to .header itself. Below xl (1280px) the room
              beside .header drops to a sliver (256px at 1024) before a
              real photo can read there, so the row only splits into
              columns at xl+ — see .headerRow's own comment. */}
          <div className={styles.headerRow}>
            <header className={styles.header}>
              <p className={styles.kicker}>
                <SectionKicker>{data?.kicker ?? ""}</SectionKicker>
              </p>
              <h1 className={styles.title}>{titleNode}</h1>
              <PortableText value={data?.intro ?? []} components={getIntroComponents(typedLocale)} />
            </header>
            <div className={styles.headerPhotoCol} aria-hidden="true">
              <div className={styles.headerPhotoFrame}>
                <NextImage
                  src={HERO_PHOTO_URL}
                  alt=""
                  fill
                  sizes="(min-width: 80rem) 35vw, (min-width: 48rem) 80vw, 100vw"
                  className={styles.headerPhotoImg}
                />
              </div>
            </div>
          </div>

          <div className={styles.channels}>
            {/* WhatsApp — dark surface nested inside this light-island
                section. "themeDark" (plain global class, src/styles/
                _tokens.scss) on this OUTER wrapper, not on .whatsappCard
                itself — same fix, same reasoning, as the real /prezzi
                page's own dark band (src/app/[locale]/prezzi/page.tsx):
                .channelsWrap (an ancestor) is light-island-surface, which
                reassigns --color-bg/--color-text/etc for its entire
                subtree regardless of :root already carrying
                data-theme="dark" — tone.tone-base-surface's own tokens
                are themselves just aliases of --color-bg/--color-text, so
                they inherit the same poisoning without this wrapper.
                First tried tone.rich-dark-surface/tone-deep-foreground
                here (a gradient background this simple card doesn't need,
                and whose --tone-deep-text chain resolves through the very
                --color-text the light island already shadowed) — measured
                live as a washed-out, barely-visible card, not the fix.
                Corrected to match /prezzi's own proven recipe exactly:
                plain tokens throughout, no tone-deep-* indirection
                needed. See this pass's own report for the live contrast
                measurements. */}
            <div className="themeDark">
              {waHref ? (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappCard}
                  aria-label={`${data?.whatsapp?.title ?? "WhatsApp"} — ${data?.whatsapp?.cta ?? ""}`}
                >
                  <span className={styles.whatsappEyebrow}>{data?.whatsapp?.label}</span>
                  <span className={styles.whatsappTitle}>{data?.whatsapp?.title}</span>
                  <p className={styles.whatsappBody}>{data?.whatsapp?.body}</p>
                  <span className={styles.whatsappNumber}>{phoneChannel?.label}</span>
                  {/* Two-corrections pass, item 1: restored as a real filled
                      button — reuses Button.module.scss's own .button/
                      .primary classes verbatim (the same ones ContactBlock's
                      "Invia il messaggio" renders through), not a second
                      button style. A real <Button>/<ButtonLink> component
                      can't be used here directly: this whole card is
                      already one enclosing <a>, and nesting a second real
                      interactive element inside it is invalid HTML (the
                      same trap the location cards avoided last pass) — so
                      this is a plain, decorative <span> carrying the
                      button's own classes, mirroring Button.tsx's own
                      ButtonContent output (label + arrow + glint) exactly. */}
                  <span className={`${buttonStyles.button} ${buttonStyles.primary} ${styles.whatsappCta}`}>
                    <span className={buttonStyles.label}>{data?.whatsapp?.cta}</span>
                    <span className={buttonStyles.arrow} aria-hidden="true">
                      →
                    </span>
                    <span className={buttonStyles.glint} aria-hidden="true" />
                  </span>
                </a>
              ) : null}
            </div>

            {/* Nine-revisions pass, item 5: the whole card is now the
                link (a single <a>, not a <div> with a separate "→" row
                nested inside it) — label/title/body/value all sit inside
                one anchor. */}
            {phoneChannel ? (
              <a href={`tel:${phoneChannel.value}`} className={styles.lightCard}>
                <span className={styles.lightCardEyebrow}>{data?.phone?.label}</span>
                <h2 className={styles.lightCardTitle}>{data?.phone?.title}</h2>
                <p className={styles.lightCardBody}>{data?.phone?.body}</p>
                <span className={styles.lightCardValue}>{phoneChannel.label}</span>
              </a>
            ) : null}

            {emailChannel ? (
              <a href={`mailto:${emailChannel.value}`} className={styles.lightCard}>
                <span className={styles.lightCardEyebrow}>{data?.email?.label}</span>
                <h2 className={styles.lightCardTitle}>{data?.email?.title}</h2>
                <p className={styles.lightCardBody}>{data?.email?.body}</p>
                <span className={styles.lightCardValue}>{emailChannel.value}</span>
              </a>
            ) : null}
          </div>

          <div className={styles.factsStrip}>
            <div className={styles.factsCol}>
              <p className={styles.factsLabel}>{data?.hours?.label}</p>
              <p className={styles.factsValue}>{data?.hours?.value}</p>
              <p className={styles.factsNote}>{data?.hours?.note}</p>
            </div>
            <div className={styles.factsCol}>
              <p className={styles.factsLabel}>{data?.appointments?.label}</p>
              <p className={styles.factsValue}>{data?.appointments?.value}</p>
              <p className={styles.factsNote}>{data?.appointments?.note}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Section 2 — dark. A plain sibling of the light-island div above,
          not nested inside it, so it inherits the real ambient dark theme
          (data-theme="dark" on <html>, [locale]/layout.tsx) directly —
          no tone mixin required for that alone. tone.tone-base-surface is
          still applied explicitly (a documented no-op today) so this
          reads as a stated choice, matching Welcome's/prezzi's own dark
          band precedent, not "no tone wrapper" mistaken for an oversight.
          Sheen-placement fix — data-sheen now lives on this OUTER,
          full-bleed wrapper, not on .locationsSection (which carries the
          container mixin) — see page.module.scss's own comment on
          .locationsWrap for why the glow was clipping against the
          container's edge before. */}
      <div className={styles.locationsWrap} data-sheen="upper-left">
        <section className={styles.locationsSection}>
          <div className={styles.locationsHeader}>
            <p className={styles.kicker}>
              <SectionKicker>{data?.sediKicker ?? ""}</SectionKicker>
            </p>
            <h2 className={styles.locationsHeading}>{data?.sediHeading}</h2>
          </div>

          {/* Nine-revisions pass, item 7: online strip moved above the four
              location cards. */}
          {onlineSede ? (
            <div className={styles.onlineStrip}>
              <h3 className={styles.onlineTitle}>{data?.online?.title}</h3>
              <p className={styles.onlineBody}>{data?.online?.body}</p>
              <Link href={onlineTherapyPath(typedLocale)} className={styles.onlineLink}>
                {linkText.online}
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          ) : null}

          {/* Nine-revisions pass, item 8: cards and map now share one
              SediMapProvider — the same activeId-sync mechanism the
              homepage's own SediBlock/SediInteractive pairing uses — so a
              card click flies the map to that pin, not a second,
              independently-invented mechanism. */}
          <SediMapProvider>
            <ContattiLocationCards
              locations={mapLocations}
              directionsLabel={tLocations("directionsLabel")}
              showOnMapLabel={tLocations("showOnMapLabel")}
              cityPageLinks={cityPageLinks}
            />
            <ContattiMap locations={mapLocations} labels={mapLabels} />
          </SediMapProvider>
        </section>
      </div>

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
