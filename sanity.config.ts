"use client";

import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from "@sanity/document-internationalization";
import { visionTool } from "@sanity/vision";
import type { DocumentActionComponent } from "sanity";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { PROTECTED_TYPES, structure, TRANSLATABLE_TYPES } from "./src/sanity/structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET",
  );
}

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Applies everywhere a document can be created from a template — the
    // global "+ Create" menu, a list pane's own "+" button, and inline
    // reference-field creation alike — since it removes the templates
    // from the pool itself rather than filtering per creation context.
    templates: (prev) =>
      prev.filter((template) => {
        // Singletons and locationPage: no creation via any template (bare
        // or language-tagged) — only reachable via their fixed pane in
        // the desk structure, so an editor can never spawn a stray one.
        if (PROTECTED_TYPES.has(template.schemaType)) return false;
        // Other translatable types: hide only the bare, language-less
        // template (id === schema type name) so creation always goes
        // through a language-tagged one — both Italiano and English stay
        // available, never a silent, unpaired document.
        if (TRANSLATABLE_TYPES.has(template.id)) return false;
        return true;
      }),
  },
  plugins: [
    structureTool({ structure }),
    visionTool(),
    documentInternationalization({
      supportedLanguages: [
        { id: "it", title: "Italiano" },
        { id: "en", title: "English" },
      ],
      schemaTypes: [...TRANSLATABLE_TYPES],
    }),
  ],
  document: {
    actions: (prev, context) => {
      // Singletons and locationPage (exactly two: Milan, Monza) can't be
      // deleted or duplicated — including via the translation-aware
      // versions of those actions.
      if (PROTECTED_TYPES.has(context.schemaType)) {
        return prev.filter(
          ({ action }) => action !== "delete" && action !== "duplicate",
        );
      }
      // Other translatable content (pillar/subtopic pages, articles,
      // services, FAQ items) gets translation-aware delete/duplicate so
      // deleting or duplicating a document also offers to handle its
      // it/en counterpart.
      if (TRANSLATABLE_TYPES.has(context.schemaType)) {
        // The plugin types `action` as `string` instead of the narrower
        // DocumentActionComponent["action"] literal union — a type
        // declaration gap in the library, not a real mismatch.
        return [
          ...prev,
          useDeleteTranslationAction as DocumentActionComponent,
          useDuplicateWithTranslationsAction as DocumentActionComponent,
        ];
      }
      return prev;
    },
  },
});
