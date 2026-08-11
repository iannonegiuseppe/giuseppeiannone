import type { Metadata } from "next";
import { resolveRobots } from "@/sanity/metadata";
import { ProposalCContent } from "../ProposalCContent";

// English mirror — same pattern as /design-lab/density/en/page.tsx: a
// literal /en subpath under this non-i18n-routed route tree, not
// next-intl. Exists specifically to verify this pass's structure holds up
// in English, per the brief's own "/en/pricing re-exports the Italian
// route" instruction — this scratch route has no such re-export mechanism
// of its own, so a real second page is the only way to actually check it.
export const metadata: Metadata = {
  title: "Prezzi — proposal C, editorial (EN preview, internal)",
  robots: resolveRobots(true),
};

export default function ProposalCEditorialeEn() {
  return <ProposalCContent locale="en" />;
}
