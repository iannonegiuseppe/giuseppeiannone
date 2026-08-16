import { getTranslations } from "next-intl/server";
import type { Locale } from "@/sanity/paths";
import type { SedeData, LocationEntry } from "@/components/LocationsSection";
import { SediInteractive } from "./SediInteractive";
import styles from "./sediSection.module.scss";

// Forked from src/components/LocationsSection.tsx — that file (and
// LocationsInteractive/LocationsMap/LocationsPopupContent) is SHARED with
// the real, live production route, reading homePage.sedi/sede documents
// directly. This pass's copy comes from the NEW, /design-lab-only
// homePage.sediLab field group instead (see homePage.ts's own comment on
// that field for why: same reuse-vs-new call as profilo/chiSonoSection).
// Map/list DATA (locations, onlineNote) is still built from the same real
// `sede` documents — only the presentation layer and copy source fork.
// LocationEntry's own SHAPE (not behaviour) is reused via a type-only
// import — identical data contract, no coupling to the shared component.
function buildLocations(sedes: SedeData[]) {
  const locations: LocationEntry[] = [];
  let onlineCity: string | undefined;

  for (const sede of sedes) {
    if (sede.isOnline) {
      onlineCity = sede.city;
      continue;
    }
    for (const addr of sede.addresses ?? []) {
      locations.push({
        id: `${sede._id}-${addr._key}`,
        city: sede.city,
        centerName: addr.centerName,
        address: addr.address,
        // Correction pass: addr.district on the two Milano addresses holds
        // the name of the third-party medical centre hosting each studio
        // (Sanity field untouched — production still reads it) — dropped
        // here, at the single point every lab consumer of LocationEntry
        // (this list's own sub-line/aria-label, SediPopupContent's own
        // secondary line) reads district from, rather than patching each
        // rendering call site separately. Monza/Cernusco have no district
        // value to begin with, so this only changes Milano's two entries;
        // both are already distinguished by their own street/title line.
        district: sede.city === "Milano" ? undefined : addr.district,
        lat: addr.lat,
        lng: addr.lng,
        photo: addr.photo,
        photoLqip: addr.photoLqip,
      });
    }
  }

  return { locations, onlineCity };
}

export async function SediBlock({
  kicker,
  heading,
  headingEmphasisWord,
  intro,
  onlineSubLine,
  sedes,
  locale,
}: {
  kicker: string;
  heading: string;
  headingEmphasisWord?: string;
  intro?: string;
  onlineSubLine?: string;
  sedes: SedeData[];
  locale: Locale;
}) {
  const { locations, onlineCity } = buildLocations(sedes);
  if (locations.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "Locations" });
  const labels = {
    mapAriaLabel: t("mapAriaLabel"),
    googleMapsLabel: t("googleMapsLabel"),
    appleMapsLabel: t("appleMapsLabel"),
    copyAddressLabel: t("copyAddressLabel"),
    copiedLabel: t("copiedLabel"),
    closePopupLabel: t("closePopupLabel"),
    zoomInLabel: t("zoomInLabel"),
    zoomOutLabel: t("zoomOutLabel"),
    scrollHintDesktopCtrl: t("scrollHintDesktopCtrl"),
    scrollHintDesktopCmd: t("scrollHintDesktopCmd"),
    scrollHintTouch: t("scrollHintTouch"),
  };

  // Heading emphasis: same small substring-split-and-wrap helper used by
  // Metodo/CTA-bridge/Diplomi/Video — the word must exist verbatim in the
  // heading string (checked with a plain indexOf), not assumed.
  const emphasisIndex = headingEmphasisWord ? heading.indexOf(headingEmphasisWord) : -1;
  const headingNode =
    headingEmphasisWord && emphasisIndex !== -1 ? (
      <>
        {heading.slice(0, emphasisIndex)}
        <em className={styles.locationsHeadingAccent}>{headingEmphasisWord}</em>
        {heading.slice(emphasisIndex + headingEmphasisWord.length)}
      </>
    ) : (
      heading
    );

  return (
    <div className={styles.sediWrap} data-sheen="upper-left">
      <section className={styles.locationsSection} data-lab-section="sedi">
        <div className={styles.locationsHeader}>
          <p className={styles.locationsKicker}>
            <span className={styles.locationsKickerRule} aria-hidden="true" />
            {kicker}
          </p>
          <h2
            id="sedi-block-heading"
            className={styles.locationsHeading}
            style={{ fontWeight: 400, fontSynthesis: "none" }}
          >
            {headingNode}
          </h2>
          {intro ? <p className={styles.locationsIntro}>{intro}</p> : null}
        </div>
        <SediInteractive
          locations={locations}
          onlineCity={onlineCity}
          onlineSubLine={onlineSubLine}
          labels={labels}
        />
      </section>
    </div>
  );
}
