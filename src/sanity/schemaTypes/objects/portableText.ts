import { defineArrayMember, defineField, defineType } from "sanity";
import { linkAnnotation } from "./linkAnnotation";

// Restricted rich text: H2/H3 only (H1 always comes from the document
// title), paragraphs, bold/italic, links, lists, blockquote, images with
// required alt text, plus the custom content objects below. Nothing else —
// don't add marks/styles/blocks here without deliberately revisiting this
// rule in CLAUDE.md.
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
      ],
    }),
    defineArrayMember({ type: "keyTakeaways" }),
    defineArrayMember({ type: "faqBlock" }),
    defineArrayMember({ type: "relatedTopics" }),
    defineArrayMember({ type: "ctaBlock" }),
    defineArrayMember({ type: "conditionCard" }),
    defineArrayMember({ type: "treatmentCard" }),
  ],
});
