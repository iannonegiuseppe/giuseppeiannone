import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { getWordPressArticleRedirects } from "./src/sanity/buildTimeRedirects";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the workspace root: sibling directories outside this project contain
  // their own lockfiles, which would otherwise make Next.js infer the wrong root.
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    // WordPress migration pass — generated from the live article slug
    // list (see buildTimeRedirects.ts), not hand-maintained. Static
    // permanent redirects here rather than middleware: middleware runs on
    // every request, and this is a fixed map that only changes when an
    // article is added/removed.
    const wordPressArticleRedirects = await getWordPressArticleRedirects();

    return [
      ...wordPressArticleRedirects,
      // The risorse/resources PREVIEW-GATE routes were live on preview
      // and may be linked from somewhere — redirect rather than 404.
      { source: "/risorse", destination: "/blog", permanent: true },
      { source: "/risorse/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/en/resources", destination: "/en/blog", permanent: true },
      { source: "/en/resources/:slug", destination: "/en/blog/:slug", permanent: true },
      // Old WordPress site's own standalone pages (crawled live against
      // https://www.giuseppeiannone.it, not the migrated article corpus —
      // see this pass's own report) — a small, hand-curated list, not run
      // through getClaimedRootSlugs()'s dynamic filter the way the 468
      // article slugs are, since there are only 7 of these and each was
      // checked individually against live new-site routes before being
      // added here. No trailing slash on any source, same reasoning as
      // buildTimeRedirects.ts's own comment: Next's automatic trailing-
      // slash normalization always strips it before these are matched, so
      // a slash-terminated source would never fire.
      { source: "/psicoterapia-online-metodo", destination: "/metodo", permanent: true },
      { source: "/scarica-e-book", destination: "/libri", permanent: true },
      {
        source: "/psychotherapy-for-english-speakers",
        destination: "/en",
        permanent: true,
      },
      // Old site's own duplicate/alternate contact page — its own <title>
      // was literally "Contatti — Dr. Giuseppe Iannone...".
      {
        source: "/studio-psicologia-psicoterapia-milano",
        destination: "/contatti",
        permanent: true,
      },
      // Old standalone page on generalized anxiety, same subject as the
      // new anxiety pillar (old meta description and the pillar's own
      // title both describe anxiety as a symptom of related conditions).
      { source: "/ansia", destination: "/disturbi-d-ansia", permanent: true },
      // Old site had two privacy-policy URLs (a WordPress duplicate-slug
      // artifact, "-2" suffix) — both real, both live, both point here.
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/privacy-policy-2", destination: "/privacy", permanent: true },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // Image-transformation quota pass. Both arrays were previously unset,
    // so Next's defaults applied: 8 deviceSizes + 7 imageSizes = 15
    // candidate widths per source image, and a transformation is billed
    // once per unique source+width+format. With ~700 distinct source URLs
    // (517 referenced Sanity assets, article covers existing at three
    // different urlFor().width() values each) that is a ceiling in the
    // several thousands — measured at 4,174 of 5,000 for September.
    //
    // 3840 and 2048 are dropped because nothing on this site is displayed
    // that wide AND, decisively, Next's optimizer never upscales past its
    // source: only 8.1% of referenced assets are wider than 1920 and 2.5%
    // wider than 2048 (measured against the real dataset), so for the
    // other ~92% the 1920/2048/3840 entries all returned the byte-
    // IDENTICAL image — three separate billed transformations for one
    // result. 750 and 1200 go for the same reason: they sit within ~15% of
    // 828/1080 and split traffic across near-duplicate variants without
    // adding perceptible detail.
    //
    // imageSizes keeps 96/256/384 (dropping 32/48/64/128): the smallest
    // real slot on the site is the 48px article-author avatar, which is a
    // FIXED-width image and so uses Next's `x` descriptor path (width and
    // 2*width, snapped up this list) rather than this array's vw filter.
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [96, 256, 384],
    // The current seed image is an SVG placeholder — Next.js blocks SVG
    // optimization by default (an SVG can carry a <script>). Safe here
    // because every asset comes from an editor publishing through Studio,
    // not from public uploads; the strict CSP below still blocks scripts
    // in case an SVG asset ever slips through with one.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
