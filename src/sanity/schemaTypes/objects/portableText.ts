import { defineArrayMember, defineField, defineType } from "sanity";
import { linkAnnotation } from "./linkAnnotation";

// Restricted rich text: H2/H3 only (H1 always comes from the document
// title), paragraphs, bold/italic, links, lists, blockquote, images with
// required alt text, plus the custom content objects below. Nothing else —
// don't add marks/styles/blocks here without deliberately revisiting this
// rule in CLAUDE.md.
//
// Privacy/cookie policy pass — that deliberate revisit: contentTable added
// because the legal pages' source content has real tabular data (a legal-
// basis table, three cookie tables) that reads worse as a definition list
// — confirmed against the actual content, not assumed, before adding it.
// See contentTable.ts's own comment for the exact shape (header row + body
// rows, plain-string cells, no merging/alignment). Still nothing else.
export const portableText = defineType({
  name: "portableText",
  title: "Content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
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
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        // WordPress migration pass — set true only when `alt` above was
        // generated (the article's own title, reused verbatim) rather
        // than authored, because the source WordPress image had none.
        // Query for these with:
        //   *[_type == "article"]{ title, "genAlt": body[_type == "image" && generatedAlt == true] }
        // Hidden from the Studio form — it's a migration marker, not
        // something an editor sets directly; it just stops being true
        // the moment someone edits alt for that image.
        defineField({
          name: "generatedAlt",
          title: "Alt text was generated (not authored)",
          type: "boolean",
          initialValue: false,
          hidden: true,
        }),
        // Pillar template pass — optional, shared by every document type
        // that uses this portableText type. Not rendered as a caption on
        // every route: today only src/sanity/portableTextComponents.tsx
        // (pillar/subtopic/page) renders it; the article route's own
        // separate renderer (articlePortableText.tsx) is untouched and
        // simply ignores this field if it's ever filled in on an article.
        defineField({
          name: "caption",
          title: "Caption",
          description: "Optional. Shown beneath the image, in the muted/italic style.",
          type: "string",
        }),
      ],
    }),
    defineArrayMember({ type: "keyTakeaways" }),
    defineArrayMember({ type: "faqBlock" }),
    defineArrayMember({ type: "relatedTopics" }),
    defineArrayMember({ type: "ctaBlock" }),
    defineArrayMember({ type: "conditionCard" }),
    defineArrayMember({ type: "treatmentCard" }),
    defineArrayMember({ type: "contentTable" }),
  ],
});
