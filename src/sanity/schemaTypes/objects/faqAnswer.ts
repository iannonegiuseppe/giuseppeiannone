import { defineArrayMember, defineType } from "sanity";
import { linkAnnotation } from "./linkAnnotation";

// Deliberately simpler than portableText: paragraphs only (no headings,
// lists, blockquote), bold/italic, one link, no images, no custom
// objects. FAQ answers stay plain text so answer engines (AEO/GEO) can
// extract them directly.
export const faqAnswer = defineType({
  name: "faqAnswer",
  title: "Answer",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [linkAnnotation()],
      },
    }),
  ],
});
