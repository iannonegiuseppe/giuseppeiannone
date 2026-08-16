import { defineField, defineType } from "sanity";
import { deontologyCheck } from "../lib/deontologyValidator";
import { NAV_ROUTE_KEYS } from "../../paths";

// CMS-driven header/footer pass: shared by headerSettings.navItems and
// footerSettings' own nav arrays (registered globally, not a per-file
// field-builder function, specifically so `children` can reference this
// SAME type by name — Sanity object types can only self-reference a
// registered type, not an anonymous inline shape).
//
// Two link types, per spec — never a free-text URL field, so an editor
// can't type a broken link:
// - "route": routeKey, constrained to NAV_ROUTE_KEYS (a Studio dropdown
//   sourced directly from paths.ts's own fixed-route functions — see
//   that file's own comment on why "aree" is deliberately absent from
//   this list).
// - "reference": a reference to a real page document. Restricted to
//   pillarPage/subtopicPage/article/page — the only content types with a
//   working hrefFor() resolution today (see paths.ts). Root-namespace
//   pass added `page` (the universal page type) so Giuseppe can put his
//   own new page in the header/footer himself, same self-serve reasoning
//   as the type itself. "service" is deliberately still excluded: this
//   codebase has no servicePath() convention yet, and inventing one here
//   would mean either a broken link or a new routing convention this
//   pass wasn't asked to create.
const ROUTE_KEY_OPTIONS = NAV_ROUTE_KEYS.map((entry) => ({
  title: entry.studioLabel,
  value: entry.key,
}));
const ALLOWED_ROUTE_KEYS = new Set(NAV_ROUTE_KEYS.map((entry) => entry.key));

interface NavLinkParent {
  linkType?: "route" | "reference";
  routeKey?: string;
  page?: { _ref?: string };
  children?: unknown[];
  isPillarTaxonomy?: boolean;
}

export const navLink = defineType({
  name: "navLink",
  title: "Nav link",
  type: "object",
  fields: [
    defineField({
      name: "linkType",
      title: "Link type",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Site route (default)", value: "route" },
          { title: "Page reference", value: "reference" },
        ],
      },
      initialValue: "route",
    }),
    defineField({
      name: "routeKey",
      title: "Route",
      description: "Only used when link type is Site route.",
      type: "string",
      options: { list: ROUTE_KEY_OPTIONS },
      hidden: ({ parent }: { parent?: NavLinkParent }) => parent?.linkType !== "route",
      validation: (Rule) =>
        Rule.custom((value: string | undefined, context) => {
          const parent = context.parent as NavLinkParent | undefined;
          if (parent?.linkType !== "route") return true;
          if (value && !ALLOWED_ROUTE_KEYS.has(value)) {
            return "Must be one of the predefined routes.";
          }
          if (!value && !parent?.children?.length && !parent?.isPillarTaxonomy) {
            return "Required for a Site route item, unless it only holds submenu items or is a pillar-taxonomy grouping label.";
          }
          return true;
        }),
    }),
    defineField({
      name: "page",
      title: "Page",
      description: "Only used when link type is Page reference.",
      type: "reference",
      to: [
        { type: "pillarPage" },
        { type: "subtopicPage" },
        { type: "article" },
        { type: "page" },
      ],
      hidden: ({ parent }: { parent?: NavLinkParent }) => parent?.linkType !== "reference",
      validation: (Rule) =>
        Rule.custom((value: { _ref?: string } | undefined, context) => {
          const parent = context.parent as NavLinkParent | undefined;
          if (parent?.linkType !== "reference") return true;
          if (!value?._ref && !parent?.children?.length && !parent?.isPillarTaxonomy) {
            return "Required for a Page reference item, unless it only holds submenu items or is a pillar-taxonomy grouping label.";
          }
          return true;
        }),
    }),
    defineField({
      name: "customLabel",
      title: "Custom label",
      description:
        "Leave empty to use the referenced page's own title (Page reference) or the route's default label (Site route). Required if this item is a submenu-only grouping label (no route/reference of its own) — see \"Aree\" for an example.",
      type: "string",
      validation: (Rule) =>
        Rule.custom((value: string | undefined, context) => {
          const parent = context.parent as NavLinkParent | undefined;
          const hasRoute = parent?.linkType === "route" && !!parent.routeKey;
          const hasReference = parent?.linkType === "reference" && !!parent.page?._ref;
          if (!hasRoute && !hasReference && !value) {
            return "Required when this item has no route or page reference (a submenu-only grouping label).";
          }
          if (value) return deontologyCheck(value);
          return true;
        }),
    }),
    defineField({
      name: "children",
      title: "Submenu items",
      description:
        'For a top-level item that also opens a submenu. Works two ways: leave the parent\'s own route/reference empty for a pure grouping label (dropdown-only, no navigation of its own — e.g. "Aree"), or set BOTH a route/reference AND submenu items so the item is a real link that ALSO opens a panel (e.g. "Chi sono" linking to /chi-sono with "Libri" beneath it) — clicking/tapping the label navigates, a separate arrow opens the panel. Not used for "Aree" — see "Populate from pillar/subtopic taxonomy" below.',
      type: "array",
      of: [{ type: "navLink" }],
      validation: (Rule) =>
        Rule.max(8).custom((value: unknown[] | undefined, context) => {
          const parent = context.parent as NavLinkParent | undefined;
          if (parent?.isPillarTaxonomy && value?.length) {
            return "Turn off pillar-taxonomy mode to author submenu items manually, or clear submenu items to use the taxonomy — not both.";
          }
          return true;
        }),
    }),
    // Header nav restructure pass — exactly one real use, "Aree": its 7
    // pillars x 3-6 subtopics (28 links, grouped) come from real
    // pillarPage/subtopicPage documents, queried and grouped in code
    // (see src/sanity/queries.ts's own areaTaxonomyQuery and
    // headerNavItems.ts's usesPillarTaxonomy). Typing that same list into
    // Submenu items above as a second copy is exactly the drift risk this
    // flag avoids — the two are mutually exclusive (see children's own
    // validation). customLabel is still required and still typed by the
    // editor as normal ("Aree") — only the ITEMS come from the taxonomy,
    // not the item's own label or position in the nav.
    defineField({
      name: "isPillarTaxonomy",
      title: "Populate from pillar/subtopic taxonomy (Aree)",
      description:
        'When enabled, this item\'s dropdown is generated automatically from the site\'s pillar/subtopic pages (grouped by pillar, three columns) instead of the Submenu items above. Used for exactly one item, "Aree" — leave off for every other item.',
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }: { parent?: NavLinkParent }) => Boolean(parent?.children?.length),
    }),
  ],
  preview: {
    select: {
      customLabel: "customLabel",
      routeKey: "routeKey",
      linkType: "linkType",
      pageTitle: "page.title",
      childrenCount: "children.length",
      isPillarTaxonomy: "isPillarTaxonomy",
    },
    prepare({
      customLabel,
      routeKey,
      linkType,
      pageTitle,
      childrenCount,
      isPillarTaxonomy,
    }: {
      customLabel?: string;
      routeKey?: string;
      linkType?: string;
      pageTitle?: string;
      childrenCount?: number;
      isPillarTaxonomy?: boolean;
    }) {
      const title = customLabel || pageTitle || routeKey || "(untitled link)";
      const subtitleParts = [linkType === "reference" ? "Page reference" : `Route: ${routeKey ?? "—"}`];
      if (childrenCount) subtitleParts.push(`${childrenCount} submenu item(s)`);
      if (isPillarTaxonomy) subtitleParts.push("Pillar taxonomy (auto)");
      return { title, subtitle: subtitleParts.join(" · ") };
    },
  },
});
