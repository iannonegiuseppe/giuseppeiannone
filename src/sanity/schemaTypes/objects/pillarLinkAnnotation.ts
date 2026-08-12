import { defineField } from "sanity";

// Contatti lead pass — a reference-based counterpart to linkAnnotation.ts.
// That one stores a raw URL string (fine for external links, or for a
// prose link an editor types once), but a typed relative path silently
// 404s the day a pillar's slug changes — this project already carries 468
// WordPress redirects for exactly that reason. This annotation stores a
// real `reference` to the target document instead, resolved at query time
// (contactPageQuery's own markDefs projection) and at render time via
// hrefFor (src/sanity/paths.ts) — the same general-purpose reference->URL
// resolver portableTextComponents.tsx already uses for relatedTopics/
// conditionCard/treatmentCard, not a second one invented for this case.
// Scoped to pillarPage only for now (contactPage.intro's only real use);
// widen `to` if a future consumer needs to link a subtopicPage/article
// inline too.
export function pillarLinkAnnotation() {
  return defineField({
    name: "pillarLink",
    title: "Link to topic page",
    type: "object",
    fields: [
      defineField({
        name: "target",
        title: "Target page",
        type: "reference",
        to: [{ type: "pillarPage" }],
        validation: (Rule) => Rule.required(),
      }),
    ],
  });
}
