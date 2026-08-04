import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "next-sanity";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/sanity/BreadcrumbsNav";
import { getPillarTrail } from "@/sanity/breadcrumbs";
import { sanityFetch, sanityFetchPublished } from "@/sanity/client";
import { extractHeadings, headingIdsByKey } from "@/sanity/headings";
import {
  buildBreadcrumbListJsonLd,
  buildFaqPageJsonLd,
  buildMedicalWebPageJsonLd,
  extractFaqEntries,
  type MedicalEntityType,
} from "@/sanity/jsonLd";
import { JsonLdScript } from "@/sanity/JsonLdScript";
import { getSiteUrl } from "@/sanity/metadata";
import type { AlternateEntry } from "@/sanity/paths";
import { pagePath, pillarLocalizedPaths, pillarPath } from "@/sanity/paths";
import { getPortableTextComponents } from "@/sanity/portableTextComponents";
import { pageSlugsQuery, pillarSlugsQuery, rootSlugQuery } from "@/sanity/queries";
import { buildMetadata, getSiteSettings, type SeoFields } from "@/sanity/seo";
import { TableOfContents } from "@/sanity/TableOfContents";

interface PillarPageData {
  _id: string;
  title: string;
  body: unknown;
  seo?: SeoFields;
  medicalEntityType?: MedicalEntityType;
  alternates?: AlternateEntry[];
}

interface GenericPageData {
  _id: string;
  title: string;
  body: unknown;
  seo?: SeoFields;
  alternates?: AlternateEntry[];
}

type ResolvedRootDoc =
  | { kind: "pillar"; data: PillarPageData }
  | { kind: "page"; data: GenericPageData };

// Root-namespace pass — resolves ONE slug against BOTH root-level
// document types in a single request (rootSlugQuery), rather than trying
// pillarPage then falling back to page: a sequential try/fallback can
// never observe a collision (it just silently picks whichever it checks
// first), and it costs a second round-trip on every request. See
// queries.ts's own comment on rootSlugQuery.
//
// Precedence: pillarPage wins. Pillars are the site's only indexed
// non-blog content today and predate the page type; authoring-time
// validation (Step 3 of this pass) is meant to make this branch
// unreachable in practice, so precedence here is a backstop, not the
// primary defence. The collision is still logged — silence is exactly
// the failure mode this whole pass exists to close, so a
// deterministic-but-quiet winner would just reproduce it. Run
// scripts/audit-root-slug-collisions.ts to check the whole dataset at
// once rather than waiting for a request to hit the collision.
async function resolveRootSlug(
  locale: string,
  slug: string,
): Promise<ResolvedRootDoc | null> {
  const { pillar, page } = await sanityFetch<{
    pillar: PillarPageData | null;
    page: GenericPageData | null;
  }>(rootSlugQuery, { locale, slug }, [
    "pillarPage",
    "page",
    `pillarPage:${slug}`,
    `page:${slug}`,
  ]);

  if (pillar && page) {
    console.warn(
      `[root-resolver] Slug collision at /${slug} (locale=${locale}): pillarPage ${pillar._id} and page ${page._id} both claim it. Serving the pillar page — the page is unreachable at this URL until the collision is resolved.`,
    );
  }

  if (pillar) return { kind: "pillar", data: pillar };
  if (page) return { kind: "page", data: page };
  return null;
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const [pillars, pages] = await Promise.all([
    sanityFetchPublished<{ slug: string }[]>(pillarSlugsQuery, { locale: params.locale }, [
      "pillarPage",
    ]),
    sanityFetchPublished<{ slug: string }[]>(pageSlugsQuery, { locale: params.locale }, [
      "page",
    ]),
  ]);

  // Deduped: a collision (both types publishing the same slug) must not
  // emit duplicate static params — Next.js errors on that at build time.
  // Deduping degrades a collision to "one param, precedence decides which
  // document renders there" instead of a broken build.
  const slugs = new Set([...pillars, ...pages].map((doc) => doc.slug));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const [resolved, siteSettings] = await Promise.all([
    resolveRootSlug(locale, slug),
    getSiteSettings(locale),
  ]);

  return await buildMetadata({
    locale: locale as "it" | "en",
    title: resolved?.data.title ?? "",
    seo: resolved?.data.seo,
    siteName: siteSettings?.title ?? "",
    siteSeo: siteSettings?.seo,
    localizedPaths: pillarLocalizedPaths(resolved?.data.alternates),
  });
}

export default async function RootSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const resolved = await resolveRootSlug(locale, slug);
  if (!resolved) notFound();

  const typedLocale = locale as "it" | "en";
  const siteUrl = getSiteUrl();
  const path =
    pillarLocalizedPaths(resolved.data.alternates)[typedLocale] ??
    (resolved.kind === "pillar" ? pillarPath(typedLocale, slug) : pagePath(typedLocale, slug));
  const pageUrl = `${siteUrl}${path}`;

  const trail = await getPillarTrail(typedLocale, resolved.data.title, path);
  const breadcrumbJsonLd = buildBreadcrumbListJsonLd(trail, siteUrl);

  const headings = extractHeadings(resolved.data.body);
  const headingIds = headingIdsByKey(headings);
  const components = await getPortableTextComponents(locale, headingIds);

  if (resolved.kind === "pillar") {
    const medicalWebPageJsonLd = buildMedicalWebPageJsonLd({
      url: pageUrl,
      name: resolved.data.title,
      description: resolved.data.seo?.metaDescription,
      medicalEntityType: resolved.data.medicalEntityType,
    });
    const faqEntries = extractFaqEntries(resolved.data.body);
    const faqPageJsonLd = faqEntries.length > 0 ? buildFaqPageJsonLd(faqEntries) : undefined;

    return (
      <main>
        <JsonLdScript data={breadcrumbJsonLd} />
        <JsonLdScript data={medicalWebPageJsonLd} />
        {faqPageJsonLd ? <JsonLdScript data={faqPageJsonLd} /> : null}
        <Breadcrumbs trail={trail} />
        <h1>{resolved.data.title}</h1>
        <TableOfContents locale={locale} headings={headings} />
        <PortableText value={resolved.data.body as never} components={components} />
      </main>
    );
  }

  // "page" branch — the universal page type (Step 4 of this pass). No
  // medicalWebPageJsonLd/faqPageJsonLd here: those assert medical-schema
  // semantics (medicalEntityType, a FAQPage) that don't apply to an
  // arbitrary Giuseppe-authored page (e.g. a page about his book) — only
  // the generic BreadcrumbList markup carries over. Untestable against
  // live content until the page type's schema exists (Step 4); re-verify
  // once it does.
  return (
    <main>
      <JsonLdScript data={breadcrumbJsonLd} />
      <Breadcrumbs trail={trail} />
      <h1>{resolved.data.title}</h1>
      <TableOfContents locale={locale} headings={headings} />
      <PortableText value={resolved.data.body as never} components={components} />
    </main>
  );
}
