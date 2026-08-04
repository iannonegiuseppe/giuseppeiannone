import { defineArrayMember, defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { languageField } from "../lib/languageField";
import { linkAnnotation } from "../objects/linkAnnotation";

// Blog index redesign pass — singleton copy for the /blog listing's own
// hero and closing editorial block (not per-article content, which stays
// on the `article` document type). Article count is computed at render
// time from the real total, not stored here.
//
// `editorial` is deliberately a NARROWER restricted array than the shared
// `portableText` object type (h2/h3/blockquote/faqBlock/keyTakeaways/
// relatedTopics/ctaBlock/conditionCard/treatmentCard, used by
// article/pillarPage/subtopicPage bodies) — this is a short "about this
// blog" blurb in a readable column, not a full content page. Paragraphs,
// one heading level (h2 — the final copy structures the block into four
// named subsections, e.g. "Perché scrivo questi articoli"; `heading`
// above is the blog INDEX's own H1-adjacent kicker/heading, a different
// role), bold/italic, links, and lists — still no images, no custom
// content blocks. Revisit deliberately, per CLAUDE.md's own restriction
// rule, before adding anything beyond this.
export const blogIndexSection = defineType({
  name: "blogIndexSection",
  title: "Blog index section",
  type: "document",
  fields: [
    defineField({
      name: "kicker",
      title: "Kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "headingEmphasisWord",
      title:
        "Heading — emphasized word (must match the heading above exactly, case-sensitive; leave empty for no emphasis)",
      type: "string",
    }),
    defineField({
      name: "intro",
      title: "Intro paragraph",
      description: "Sits under the heading in the blog index hero.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().custom(deontologyCheck),
    }),
    defineField({
      name: "editorial",
      title: "Editorial block",
      description:
        "Closing \"about this blog\" block at the bottom of the listing page, below the contact form.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
          ],
          lists: [
            { title: "Bullet list", value: "bullet" },
            { title: "Numbered list", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [linkAnnotation()],
          },
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    languageField(),
  ],
  preview: {
    select: { title: "heading", subtitle: "kicker" },
  },
});
