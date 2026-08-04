import type { SlugValue, ValidationContext } from "sanity";
import { RESERVED_ROOT_SLUGS } from "../../reservedSlugs";

// Root-namespace pass — the SAME validator attaches to pillarPage.slug
// and page.slug (Rule.required().custom(rootSlugCollisionCheck) on both),
// deliberately: a one-directional check (only page checks against
// pillarPage, say) lets a new pillar silently take an already-published
// page's slug, or vice versa. One shared function imported in both
// schema files is what makes "symmetric" actually guaranteed rather than
// something two separate implementations have to be kept in sync by
// hand.
//
// Deliberately NOT subtopicPage.slug: subtopics live at
// /{pillar}/{subtopic}, two segments — a one-segment root slug can never
// collide with one. Checking it would reject valid slugs against a
// collision that cannot occur (see reservedSlugs.ts's own comment on the
// same point).
//
// Deliberately Rule.custom, not the built-in slug isUnique option:
// isUnique can only report a generic "already in use." A custom rule can
// name what it hit — reserved route, an article, a pillar page, or
// another page — which is the difference between Giuseppe understanding
// the error and Giuseppe guessing at it. It also needs to check across
// _type (isUnique is scoped to the field's own document type only) and
// against a static reserved list, neither of which isUnique can do.
//
// Scoped per language: it/en are separate documents at separate URLs
// (/il-mio-libro vs /en/il-mio-libro), so the same slug in different
// languages is not a collision — only same-language matches count.
const CHECKED_TYPES = ["page", "pillarPage", "article"];

interface SlugCollisionRow {
  _id: string;
  _type: string;
}

function describeCollision(slug: string, row: SlugCollisionRow): string {
  switch (row._type) {
    case "article":
      return `"${slug}" is already used by an article (/blog/${slug}). Choose a different slug.`;
    case "pillarPage":
      return `"${slug}" is already used by a pillar page. Choose a different slug.`;
    case "page":
      return `"${slug}" is already used by another page. Choose a different slug.`;
    default:
      return `"${slug}" is already used by another document. Choose a different slug.`;
  }
}

export async function rootSlugCollisionCheck(
  slugValue: SlugValue | undefined,
  context: ValidationContext,
): Promise<true | string> {
  const slug = slugValue?.current;
  // Emptiness is Rule.required()'s job, chained alongside this — see
  // pillarPage.ts/page.ts's own `Rule.required().custom(...)`.
  if (!slug) return true;

  const lowerSlug = slug.toLowerCase();
  if (RESERVED_ROOT_SLUGS.has(lowerSlug)) {
    return `"${slug}" is a reserved site address. Choose a different slug.`;
  }

  const document = context.document;
  const language = typeof document?.language === "string" ? document.language : undefined;
  if (!language) return true; // languageField hasn't been written yet — nothing to check against.

  const currentId = document?._id;
  const publishedId = currentId?.startsWith("drafts.") ? currentId.slice("drafts.".length) : currentId;
  const draftId = currentId?.startsWith("drafts.") ? currentId : `drafts.${currentId}`;

  const client = context.getClient({ apiVersion: "2026-07-05" });
  const collision = await client.fetch<SlugCollisionRow | null>(
    `*[(_type in $checkedTypes)
      && language == $language
      && slug.current == $slug
      && !(_id in [$draftId, $publishedId])
    ][0]{ _id, _type }`,
    { checkedTypes: CHECKED_TYPES, language, slug, draftId, publishedId },
  );

  if (!collision) return true;
  return describeCollision(slug, collision);
}
