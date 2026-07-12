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
//   pillarPage/subtopicPage/article — the only content types with a
//   working hrefFor() resolution today (see paths.ts). "service" is
//   deliberately excluded: this codebase has no servicePath() convention
//   yet, and inventing one here would mean either a broken link or a
//   new routing convention this pass wasn't asked to create.
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
          if (!value && !parent?.children?.length) {
            return "Required for a Site route item, unless it only holds submenu items (a grouping label).";
          }
          return true;
        }),
    }),
    defineField({
      name: "page",
      title: "Page",
      description: "Only used when link type is Page reference.",
      type: "reference",
      to: [{ type: "pillarPage" }, { type: "subtopicPage" }, { type: "article" }],
      hidden: ({ parent }: { parent?: NavLinkParent }) => parent?.linkType !== "reference",
      validation: (Rule) =>
        Rule.custom((value: { _ref?: string } | undefined, context) => {
          const parent = context.parent as NavLinkParent | undefined;
          if (parent?.linkType !== "reference") return true;
          if (!value?._ref && !parent?.children?.length) {
            return "Required for a Page reference item, unless it only holds submenu items (a grouping label).";
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
      description: 'For a top-level item that opens a submenu (e.g. "Aree") — leave the parent\'s own route/reference empty to make it a pure grouping label.',
      type: "array",
      of: [{ type: "navLink" }],
      validation: (Rule) => Rule.max(8),
    }),
  ],
  preview: {
    select: {
      customLabel: "customLabel",
      routeKey: "routeKey",
      linkType: "linkType",
      pageTitle: "page.title",
      childrenCount: "children.length",
    },
    prepare({
      customLabel,
      routeKey,
      linkType,
      pageTitle,
      childrenCount,
    }: {
      customLabel?: string;
      routeKey?: string;
      linkType?: string;
      pageTitle?: string;
      childrenCount?: number;
    }) {
      const title = customLabel || pageTitle || routeKey || "(untitled link)";
      const subtitleParts = [linkType === "reference" ? "Page reference" : `Route: ${routeKey ?? "—"}`];
      if (childrenCount) subtitleParts.push(`${childrenCount} submenu item(s)`);
      return { title, subtitle: subtitleParts.join(" · ") };
    },
  },
});
