import { defineField } from "sanity";

// Optional structured-data categorization for JSON-LD (Stage 2 Step 4).
// Only set this when the page clearly and specifically maps to one
// medical condition or one therapy/treatment approach — leave as None
// otherwise. Never set this just to make the markup richer.
export function medicalEntityTypeField() {
  return defineField({
    name: "medicalEntityType",
    title: "Medical entity type (structured data)",
    description:
      "Only set when this page is clearly about one specific condition or therapy. Leave as None otherwise.",
    type: "string",
    options: {
      list: [
        { title: "None", value: "none" },
        { title: "Medical condition", value: "condition" },
        { title: "Medical therapy / treatment", value: "therapy" },
      ],
      layout: "radio",
    },
    initialValue: "none",
  });
}
