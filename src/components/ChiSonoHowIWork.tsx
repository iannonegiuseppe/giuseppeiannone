import { HowIWorkCards } from "@/components/HowIWorkCards";
import { HowIWorkColorBlocks } from "@/components/HowIWorkColorBlocks";
import { HowIWorkPath } from "@/components/HowIWorkPath";
import { HowIWorkSplit } from "@/components/HowIWorkSplit";
import { HowIWorkStagger } from "@/components/HowIWorkStagger";

export interface ChiSonoHowIWorkPart {
  title?: string;
  body?: string[];
}

export interface ChiSonoHowIWorkProps {
  kicker?: string;
  heading?: string;
  intro?: string;
  parts: ChiSonoHowIWorkPart[];
}

// Preview-only variant switch (?howiwork=stagger|cards|path|split|blocks,
// see page.tsx) — five proposed designs for "Come lavoro," all on the
// brand green (docs/design-direction.md §2's original pine-ink accent,
// #22423A — see ChiSonoHowIWorkVariants.module.scss's own comment for
// why it's revived here specifically), checked in the real page with
// real content before one is promoted to permanent. Same pattern the
// timeline's and publications' own variants used before promotion.
export type HowIWorkVariant = "stagger" | "cards" | "path" | "split" | "blocks";

export function ChiSonoHowIWork({
  variant,
  ...props
}: ChiSonoHowIWorkProps & { variant?: HowIWorkVariant }) {
  if (props.parts.length === 0) return null;

  switch (variant) {
    case "cards":
      return <HowIWorkCards {...props} />;
    case "path":
      return <HowIWorkPath {...props} />;
    case "split":
      return <HowIWorkSplit {...props} />;
    case "blocks":
      return <HowIWorkColorBlocks {...props} />;
    case "stagger":
    default:
      return <HowIWorkStagger {...props} />;
  }
}
