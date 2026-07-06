import { defineField, defineType } from "sanity";
import { languageField } from "../lib/languageField";

// Moved off the generic simplePage factory (Stage 3 Step 5) — the homepage
// is growing dedicated section fields (hero first) as each section is
// built, not a single generic body. `body` stays for now: later sections
// not yet converted to their own field still read from it.
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "Used for the browser tab / SEO fallback title, not shown on the page itself — the hero displays the author's name from Site settings instead.",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "hero",
      title: "Hero",
      description:
        "Name, credentials, and registration number come from Site settings' Author fields, not from here — kept in one place.",
      type: "object",
      fields: [
        defineField({
          name: "positioningStatement",
          title: "Positioning statement",
          description:
            "One sentence introducing the practice, shown under the name/title.",
          type: "text",
          rows: 2,
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "photo",
          title: "Photo",
          description:
            "Portrait or square crop — the hero layout is not a landscape box. Leave empty until a real photo is ready; a placeholder renders in its place. Always the fallback and video poster frame, even when a video is set below.",
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
        defineField({
          name: "video",
          title: "Background video (optional)",
          description:
            "Short, silent, looping clip layered over the photo — never the default. Small screens, reduced-motion preference, and data-saver connections all get the photo instead, no matter what's set here. Keep it short and well-compressed: a background loop, not a full video.",
          type: "file",
          options: { accept: "video/mp4,video/webm" },
        }),
      ],
    }),
    defineField({
      name: "credentialsStrip",
      title: "Credentials strip",
      description:
        "Factual credentials only (years in practice, training, supervision) as complete, plain phrases — never counters, never percentage or client-number claims.",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "body",
      title: "Body (legacy, being replaced section by section)",
      type: "portableText",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    languageField(),
  ],
});
