// Single source of truth for the Sedi section — drives the sticky scroll
// scenes, the map markers, the mobile slider cards, and the sr-only
// canonical list, all from this one array. No parallel copies.
//
// Partner-center names are published pending the client's written
// confirmation — [da confermare con il cliente].
//
// Coordinates are geocoded (OpenStreetMap/Nominatim, dev-time lookup only
// — never called at runtime) where a clean single match existed; each is
// still flagged [coordinate da verificare] per spec, since street-level
// geocoding from a public dataset is a starting point, not a guarantee.
// One exception, flagged individually below: Via Buonarroti 41's
// Nominatim match resolved to a same-named street in Cernusco sul
// Naviglio (~15km from central Milano, clearly wrong for a Milano
// address) rather than the well-known central-Milano Via Buonarroti near
// Sempione/CityLife — used a manually-estimated coordinate for that one
// instead of a geocoder result known to be mismatched.
export type SedeAddress = {
  centerName?: string; // undefined where the source only gave a bare address (Monza)
  address: string;
  lat: number; // [coordinate da verificare]
  lng: number; // [coordinate da verificare]
};

export type SedeScene = {
  id: string;
  city: string;
  addresses: SedeAddress[]; // empty for the online scene
  onlineLine?: string; // set only for the online scene
};

export const sedeScenes: SedeScene[] = [
  {
    id: "milano",
    city: "Milano",
    addresses: [
      {
        centerName: "Bilingual Therapy", // [da confermare con il cliente]
        address: "Via Buonarroti 41",
        // [coordinate da verificare] — MANUAL ESTIMATE, not geocoded: see
        // the file-level comment above. Nominatim's only "Via Buonarroti
        // 41" match is a same-named street in Cernusco sul Naviglio
        // (~15km away), not central Milano's — that result was rejected
        // as wrong rather than used.
        lat: 45.4779,
        lng: 9.1636,
      },
      {
        centerName: "Dinamica Bicocca", // [da confermare con il cliente]
        address: "Piazza della Trivulziana 4/A",
        lat: 45.5148, // [coordinate da verificare] — geocoded, Bicocca district
        lng: 9.2122, // [coordinate da verificare] — geocoded, Bicocca district
      },
    ],
  },
  {
    id: "monza",
    city: "Monza",
    addresses: [
      {
        address: "Via Tolomeo 10",
        lat: 45.5919, // [coordinate da verificare] — geocoded at street level (no house-number match)
        lng: 9.3037, // [coordinate da verificare] — geocoded at street level (no house-number match)
      },
    ],
  },
  {
    id: "cernusco-sul-naviglio",
    city: "Cernusco sul Naviglio",
    addresses: [
      {
        centerName: "Centro Andrologico Italiano", // [da confermare con il cliente]
        address: "Via Brescia 23",
        lat: 45.5122, // [coordinate da verificare] — geocoded, house-number match
        lng: 9.3369, // [coordinate da verificare] — geocoded, house-number match
      },
      {
        centerName: "Centro di Psicologia", // [da confermare con il cliente]
        address: "Via Torino 24/11",
        lat: 45.5066, // [coordinate da verificare] — geocoded, house-number match
        lng: 9.3383, // [coordinate da verificare] — geocoded, house-number match
      },
    ],
  },
  {
    id: "online",
    city: "Online",
    addresses: [],
    onlineLine: "Sedute su piattaforma sicura, da qualsiasi luogo.",
  },
];

// All addresses across every scene, flattened — the map's marker set and
// the "online" scene's fitBounds overview both read this same list.
export const allSedeAddresses: SedeAddress[] = sedeScenes.flatMap((scene) => scene.addresses);
