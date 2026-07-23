import { createClient } from "@sanity/client";

// Locations map pass — targeted patch for the 4 existing `sede` documents
// plus their (new) EN pairs. Same discipline as every other patch-*.ts
// script: upsertManagedSingleton (createIfNotExists + patch.set) — never
// createOrReplace, so nothing manually added in Studio can be wiped —
// plus a translation.metadata pairing doc per document, same pattern as
// patch-aree-section.ts's own AREAS loop (the closest existing precedent:
// another plain list type, not a singleton).
//
// ID-naming note (reported, not silently decided): the EXISTING IT
// documents use bare ids (sede-milano, sede-monza, sede-cernusco,
// sede-online) — no "-it" suffix, unlike area's own `area-${key}-it`
// convention. Left as-is rather than renamed (renaming a real, already-
// live document is a bigger and riskier change than this pass calls
// for); only the NEW EN documents follow the established "-en" suffix.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-07-05", useCdn: false });

async function upsertManagedSingleton(id: string, type: string, fields: Record<string, unknown>) {
  await client.createIfNotExists({ _id: id, _type: type, ...fields });
  await client.patch(id).set(fields).commit();
}

function translationMetadata(
  id: string,
  schemaType: string,
  translations: { language: string; documentId: string }[],
) {
  return {
    _id: id,
    _type: "translation.metadata",
    schemaTypes: [schemaType],
    translations: translations.map(({ language, documentId }) => ({
      _key: language,
      _type: "internationalizedArrayReferenceValue",
      language,
      value: { _type: "reference", _ref: documentId },
    })),
  };
}

// Geocoded live via OpenStreetMap Nominatim (nominatim.openstreetmap.org),
// structured street/city/country queries, this session — see the pass's
// own report for the exact queries and precision notes (two addresses
// are house-level OSM points; two are street-centerline estimates, since
// OSM has no individually-mapped house-number node for those specific
// buildings — flagged per-entry below, not silently presented as more
// precise than they are).
const SEDE_DOCS = [
  {
    id: "sede-milano",
    idEn: "sede-milano-en",
    order: 1,
    it: { city: "Milano" },
    en: { city: "Milano" }, // Italian toponym, stays as-is per instruction
    addresses: [
      {
        key: "addr-1",
        centerName: "Bilingual Therapy", // proper noun, verbatim both locales
        address: "Via Michelangelo Buonarroti 41", // proper noun, verbatim both locales
        district: "Citylife", // proper noun (place name), verbatim both locales
        // Street-centerline estimate: OSM has no house-level point for
        // "41" on this street inside Milano city proper (confirmed via
        // both Nominatim and Photon — every "house" match for house
        // number 41 on this street name lands in Legnano/Cernusco/
        // Gorgonzola, NOT Milano). Centroid of the actual Milano street
        // segments (Municipio 7/8, De Angeli/Pagano/San Pietro in Sala),
        // combined extent lat 45.4670129-45.4731536, lng 9.1551094-
        // 9.1556117.
        lat: 45.4701,
        lng: 9.1554,
      },
      {
        key: "addr-2",
        centerName: "Dinamica Bicocca",
        address: "Piazza della Trivulziana 4/A",
        district: "Bicocca",
        // House-level OSM point (place_id 75291193 / node 10091284478),
        // house_number 4, city Milano, quarter Bicocca — confirmed exact.
        lat: 45.5148066,
        lng: 9.212195,
      },
    ],
  },
  {
    id: "sede-monza",
    idEn: "sede-monza-en",
    order: 2,
    it: { city: "Monza" },
    en: { city: "Monza" },
    addresses: [
      {
        key: "addr-1",
        centerName: undefined,
        address: "Via Tolomeo 10",
        district: undefined, // not specified for this entry, per spec
        // Street-centerline estimate: OSM maps "Via Tolomeo" as a road
        // (way 43765609) in Monza's Cristo Re district, confirmed by both
        // Nominatim and Photon, but has no individually-mapped house-
        // number-10 point.
        lat: 45.5918984,
        lng: 9.3036836,
      },
    ],
  },
  {
    id: "sede-cernusco",
    idEn: "sede-cernusco-en",
    order: 3,
    it: { city: "Cernusco sul Naviglio" },
    en: { city: "Cernusco sul Naviglio" },
    // "Centro Andrologico Italiano · Via Brescia 23" entry REMOVED
    // entirely (no longer current, per instruction) — only Centro di
    // Psicologia remains.
    addresses: [
      {
        key: "addr-2",
        centerName: "Centro di Psicologia",
        address: "Via Torino 24/11",
        district: undefined, // not specified for this entry, per spec
        // House-level OSM point (place_id 75043214 / node 6511534030),
        // house_number 24, town Cernusco sul Naviglio, suburb Tre Torri —
        // confirmed exact (OSM has no separate node for the "/11"
        // interior/unit suffix, which isn't individually mappable).
        lat: 45.5065826,
        lng: 9.3383308,
      },
    ],
  },
];

const ONLINE_DOC = {
  id: "sede-online",
  idEn: "sede-online-en",
  order: 4,
  it: { city: "Online", onlineLine: "Sedute su piattaforma sicura, da qualsiasi luogo." },
  // Kept from the existing document verbatim (already IT-only before this
  // pass) — EN translation is new.
  en: { city: "Online", onlineLine: "Secure online sessions, from anywhere." },
};

// No explicit _type on these objects — matches the existing seeded data
// exactly (checked: the live documents' own address entries have no
// _type field either, just _key + the plain fields), so this patch
// doesn't introduce a shape divergence from what's already there.
function toSanityAddress(a: (typeof SEDE_DOCS)[number]["addresses"][number]) {
  return {
    _key: a.key,
    ...(a.centerName ? { centerName: a.centerName } : {}),
    address: a.address,
    ...(a.district ? { district: a.district } : {}),
    lat: a.lat,
    lng: a.lng,
  };
}

async function main() {
  for (const sede of SEDE_DOCS) {
    for (const locale of ["it", "en"] as const) {
      const id = locale === "it" ? sede.id : sede.idEn;
      const before = await client.fetch(`*[_id == $id][0]`, { id });
      console.log(`BEFORE ${id}:`, JSON.stringify(before));

      await upsertManagedSingleton(id, "sede", {
        language: locale,
        city: sede[locale].city,
        order: sede.order,
        isOnline: false,
        addresses: sede.addresses.map(toSanityAddress),
      });

      const after = await client.fetch(`*[_id == $id][0]`, { id });
      console.log(`AFTER  ${id}:`, JSON.stringify(after));
    }

    await client.createOrReplace(
      translationMetadata(`translation.metadata.${sede.id}`, "sede", [
        { language: "it", documentId: sede.id },
        { language: "en", documentId: sede.idEn },
      ]),
    );
  }

  // Online "scene" — reused as-is (isOnline: true, no addresses), per
  // "if settings already has an online note/entry, reuse it" instruction:
  // sede-online already IS this entry.
  for (const locale of ["it", "en"] as const) {
    const id = locale === "it" ? ONLINE_DOC.id : ONLINE_DOC.idEn;
    const before = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`BEFORE ${id}:`, JSON.stringify(before));

    await upsertManagedSingleton(id, "sede", {
      language: locale,
      city: ONLINE_DOC[locale].city,
      order: ONLINE_DOC.order,
      isOnline: true,
      onlineLine: ONLINE_DOC[locale].onlineLine,
      addresses: [],
    });

    const after = await client.fetch(`*[_id == $id][0]`, { id });
    console.log(`AFTER  ${id}:`, JSON.stringify(after));
  }

  await client.createOrReplace(
    translationMetadata(`translation.metadata.${ONLINE_DOC.id}`, "sede", [
      { language: "it", documentId: ONLINE_DOC.id },
      { language: "en", documentId: ONLINE_DOC.idEn },
    ]),
  );

  console.log("translation.metadata written for all 4 sede documents.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
