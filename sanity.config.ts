"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { PROTECTED_TYPES, SINGLETON_TYPES, structure } from "./src/sanity/structure";

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
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool()],
  document: {
    // Singletons and locationPage (exactly two: Milan, Monza) can't be
    // deleted or duplicated.
    actions: (prev, context) =>
      PROTECTED_TYPES.has(context.schemaType)
        ? prev.filter(
            ({ action }) => action !== "delete" && action !== "duplicate",
          )
        : prev,
    // Singletons don't show up in the global "+ Create" menu — they're
    // only reachable via their fixed pane in the desk structure, so an
    // editor can never spawn a second one.
    newDocumentOptions: (prev, context) =>
      context.creationContext.type === "global"
        ? prev.filter((item) => !SINGLETON_TYPES.has(item.templateId))
        : prev,
  },
});
