import { defineArrayMember, defineField, defineType } from "sanity";

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
        annotations: [
          defineField({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (Rule) =>
                  Rule.required().uri({
                    scheme: ["http", "https", "mailto", "tel"],
                    allowRelative: true,
                  }),
              }),
              defineField({
                name: "nofollow",
                title: 'Add rel="nofollow"',
                description:
                  "For sponsored or untrusted external links. Has no effect on internal (relative) links.",
                type: "boolean",
                initialValue: false,
              }),
            ],
          }),
          // Rendering note (for the future Portable Text serializer, not
          // stored here): external links (absolute http/https href) should
          // get rel="noopener" automatically; append "nofollow" only when
          // this field is set. Internal (relative) links get no rel.
        ],
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
