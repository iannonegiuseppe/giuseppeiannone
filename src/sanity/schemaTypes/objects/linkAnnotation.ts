import { defineField } from "sanity";

// Shared by both the rich (portableText) and simple (faqAnswer) block
// schemas. Rendering note (for the future Portable Text serializer, not
// stored here): external links (absolute http/https href) should get
// rel="noopener" automatically; append "nofollow" only when the field
// below is set. Internal (relative) links get no rel.
export function linkAnnotation() {
  return defineField({
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
  });
}
