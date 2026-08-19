import { defineField, defineType } from "sanity";

// City/online pages pass — a short anchor label plus a reference to the
// pillarPage it points at, not a plain href string. A string breaks
// silently the moment a pillar's slug changes; a reference doesn't (the
// page always resolves the CURRENT slug at request time via pillarPath).
// `label` stays free text because these pages deliberately use short,
// page-specific anchor text ("Disturbi d'ansia") rather than the
// pillar's own full stored title ("Ansia e disturbi d'ansia") — see
// StackedBands.tsx's own consumers for the real examples.
export const pillarLink = defineType({
  name: "pillarLink",
  title: "Pillar link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Link text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pillar",
      title: "Pillar page",
      type: "reference",
      to: [{ type: "pillarPage" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "pillar.title" },
  },
});
