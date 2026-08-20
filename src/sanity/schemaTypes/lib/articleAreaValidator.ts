import type { Reference, ValidationContext } from "sanity";

// Categorisation pass — article.area/article.areaOther together express one
// required choice ("which of the seven pillars, or explicitly none of
// them"), split across two fields because a single `reference` field can't
// itself represent "deliberately not one of these" — leaving it empty would
// be indistinguishable from "not decided yet," which is exactly the
// ambiguity Rule.required() exists to rule out. Each field's own validator
// cross-checks the other via context.document, so leaving BOTH empty (the
// state every one of the 468 existing articles is in right now, since this
// pass writes no article data) blocks publish with a visible error on both
// fields — not just one an editor could scroll past.
//
// The same-language check follows rootSlugValidator.ts's own established
// pattern (async Rule.custom + context.getClient) rather than inventing a
// second approach — that validator is this schema set's only other example
// of a cross-document reference check. Genuinely does more than
// subtopicPage.parentPillar's own "must be same language" comment: that
// field states the rule in its description and enforces nothing; this one
// also restricts the Studio picker itself (options.filter, below) so a
// wrong-language pillar is never selectable in the first place, with this
// validator as the backstop for anything that sets the reference another
// way (API write, copy-paste).
function normalizeDocId(id: string | undefined): string | undefined {
  return id?.startsWith("drafts.") ? id.slice("drafts.".length) : id;
}

export async function articleAreaCheck(
  value: Reference | undefined,
  context: ValidationContext,
): Promise<true | string> {
  const areaOther = context.document?.areaOther === true;

  if (!value?._ref) {
    return areaOther ? true : 'Required: choose an area, or check "Not one of the seven" below.';
  }
  if (areaOther) {
    return 'Cannot set both an area and "Not one of the seven" — choose one.';
  }

  const language = typeof context.document?.language === "string" ? context.document.language : undefined;
  if (!language) return true; // languageField hasn't been written yet — nothing to check against.

  const refId = normalizeDocId(value._ref);
  const client = context.getClient({ apiVersion: "2026-07-05" });
  const pillarLanguage = await client.fetch<string | null>(
    `*[_id == $id || _id == "drafts." + $id][0].language`,
    { id: refId },
  );

  if (pillarLanguage && pillarLanguage !== language) {
    return `This article is "${language}" but the selected area is a "${pillarLanguage}" pillar page — pick the same-language one.`;
  }
  return true;
}

export function articleAreaOtherCheck(
  value: boolean | undefined,
  context: ValidationContext,
): true | string {
  const hasArea = Boolean((context.document?.area as Reference | undefined)?._ref);
  if (value === true) {
    return hasArea ? 'Cannot set both an area and "Not one of the seven" — choose one.' : true;
  }
  return hasArea ? true : 'Required: choose an area, or check this box.';
}
