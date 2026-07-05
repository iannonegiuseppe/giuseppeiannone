import { defineField } from "sanity";

// Required on every schema type registered with @sanity/document-internationalization
// (see documentTypes in sanity.config.ts). The plugin writes to this field itself —
// it's read-only/hidden so editors never touch it directly.
export function languageField() {
  return defineField({
    name: "language",
    title: "Language",
    type: "string",
    readOnly: true,
    hidden: true,
  });
}
