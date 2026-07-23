import type { Image as SanityImage } from "sanity";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/sanity/paths";
import { LocationsInteractive } from "./LocationsInteractive";
import styles from "./LocationsSection.module.scss";

export type SedeAddressData = {
  _key: string;
  centerName?: string;
  address: string;
  district?: string;
  lat: number;
  lng: number;
  photo?: (SanityImage & { alt?: string }) | null;
  photoLqip?: string | null;
};

export type SedeData = {
  _id: string;
  city: string;
  isOnline?: boolean;
  onlineLine?: string;
  addresses?: SedeAddressData[];
};

// One physical address, flattened out of its parent `sede` document —
// this is the shape both the (always-static) list and the (client-only)
// map consume. The "online" sede has no addresses at all and never
// becomes a LocationEntry — see buildLocations below.
export type LocationEntry = {
  id: string;
  city: string;
  centerName?: string;
  address: string;
  district?: string;
  lat: number;
  lng: number;
  photo?: (SanityImage & { alt?: string }) | null;
  photoLqip?: string | null;
};

function buildLocations(sedes: SedeData[]): {
  locations: LocationEntry[];
  onlineNote?: string;
} {
  const locations: LocationEntry[] = [];
  let onlineNote: string | undefined;

  for (const sede of sedes) {
    if (sede.isOnline) {
      onlineNote = sede.onlineLine;
      continue;
    }
    for (const addr of sede.addresses ?? []) {
      locations.push({
        id: `${sede._id}-${addr._key}`,
        city: sede.city,
        centerName: addr.centerName,
        address: addr.address,
        district: addr.district,
        lat: addr.lat,
        lng: addr.lng,
        photo: addr.photo,
        photoLqip: addr.photoLqip,
      });
    }
  }

  return { locations, onlineNote };
}

// Locations section — replaces the gated, sticky-scroll SedesSection/
// SedesStage entirely (see this pass's own report for what survived vs.
// was rewritten). Left column is a real, always-static address list —
// the map (right column) is progressive enhancement only, dynamically
// imported client-side with ssr:false inside LocationsInteractive; if it
// never loads, this section is still complete, since every address is
// real text here, not sourced from the map.
export async function LocationsSection({
  kicker,
  heading,
  paragraph,
  sedes,
  locale,
}: {
  kicker: string;
  heading: string;
  paragraph?: string;
  sedes: SedeData[];
  locale: Locale;
}) {
  const { locations, onlineNote } = buildLocations(sedes);

  if (locations.length === 0) {
    return null;
  }

  // Server-resolved, passed down as plain props — same established
  // pattern as DiplomiSection's own lightbox labels (getTranslations here,
  // no client component in this codebase calls useTranslations() itself).
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

  return (
    <section className={styles.locationsSection} data-lab-section="locations">
      <div className={styles.locationsHeader}>
        <p className={styles.locationsKicker}>
          <span className={styles.locationsKickerRule} aria-hidden="true" />
          {kicker}
        </p>
        <h2 className={styles.locationsHeading}>{heading}</h2>
        {paragraph ? <p className={styles.locationsIntro}>{paragraph}</p> : null}
      </div>
      <LocationsInteractive locations={locations} onlineNote={onlineNote} labels={labels} />
    </section>
  );
}
