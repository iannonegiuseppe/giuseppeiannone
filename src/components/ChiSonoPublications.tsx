import { PublicationsCards } from "@/components/PublicationsCards";
import { PublicationsCardsTabs } from "@/components/PublicationsCardsTabs";
import { PublicationsGrid } from "@/components/PublicationsGrid";
import { PublicationsLedger } from "@/components/PublicationsLedger";
import { PublicationsTabs } from "@/components/PublicationsTabs";

// "cards-tabs" is the permanent, shipped design for "Lavori pubblicati"
// — page.tsx always passes this now, no query param. The other three
// were proposed alongside it and left wired up but unreachable from
// that one real call site — orphaned, not deleted, same precedent as
// the timeline's own case-file/pulse variants (see TimelineSection.tsx's
// own comment) and chiSonoSection.ts's superseded-field precedent
// before that.
export type PublicationsVariant = "grid" | "cards" | "tabs" | "ledger" | "cards-tabs";

export interface PublicationEntryData {
  authors?: string;
  title?: string;
  source?: string;
  url?: string;
}

export interface PublicationGroupData {
  group: string;
  label: string;
  items: PublicationEntryData[];
}

export interface ChiSonoPublicationsProps {
  kicker?: string;
  title?: string;
  note?: string;
  groups: PublicationGroupData[];
  variant?: PublicationsVariant;
  headingId: string;
}

export function ChiSonoPublications({ variant, ...props }: ChiSonoPublicationsProps) {
  if (props.groups.length === 0) return null;

  switch (variant) {
    case "cards":
      return <PublicationsCards {...props} />;
    case "tabs":
      return <PublicationsTabs {...props} />;
    case "ledger":
      return <PublicationsLedger {...props} />;
    case "grid":
      return <PublicationsGrid {...props} />;
    case "cards-tabs":
    default:
      return <PublicationsCardsTabs {...props} />;
  }
}
