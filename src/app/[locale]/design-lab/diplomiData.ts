// Single typed array driving thumbnails, captions, and the lightbox.
//
// [scansioni reali dopo verifica privacy del cliente] — images are plain
// document-shaped SVG placeholders (public/design-lab/diploma-0N.svg),
// not real scans: real diploma/certificate images arrive only after the
// client has reviewed them for personal data (birth date, matricola,
// signatures). Title/institution are bracketed placeholders pending the
// client's written confirmation, matching the marquee's own regalie-list
// convention — no real-sounding institution names invented. Year is a
// plausible illustrative value only, matching the counters row's own
// "plausible dummy numerics" convention from the previous pass.
export type Diploma = {
  image: string;
  // Real intrinsic size of `image` — needed by the lightbox (correct
  // aspect-ratio letterboxing/zoom) as much as by the card, so it lives
  // here once rather than as a second, driftable mapping.
  width: number;
  height: number;
  title: string;
  institution: string;
  year: number;
};

export const diplomiData: Diploma[] = [
  {
    image: "/design-lab/diploma-01.svg",
    width: 600,
    height: 800,
    title: "[segnaposto — laurea in Psicologia]",
    institution: "[segnaposto — università]",
    year: 2012,
  },
  {
    image: "/design-lab/diploma-02.svg",
    width: 800,
    height: 600,
    title: "[segnaposto — specializzazione in Psicoterapia]",
    institution: "[segnaposto — scuola di specializzazione]",
    year: 2016,
  },
  {
    image: "/design-lab/diploma-03.svg",
    width: 600,
    height: 800,
    title: "[segnaposto — corso di formazione 1]",
    institution: "[segnaposto — ente formativo 1]",
    year: 2019,
  },
  {
    image: "/design-lab/diploma-04.svg",
    width: 800,
    height: 600,
    title: "[segnaposto — corso di formazione 2]",
    institution: "[segnaposto — ente formativo 2]",
    year: 2021,
  },
  {
    image: "/design-lab/diploma-05.svg",
    width: 600,
    height: 800,
    title: "[segnaposto — attestato di supervisione]",
    institution: "[segnaposto — ente formativo 3]",
    year: 2023,
  },
];
