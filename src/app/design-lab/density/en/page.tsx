import type { Metadata } from "next";
import { resolveRobots } from "@/sanity/metadata";
import { DensityPage } from "../DensityPage";

// PREVIEW-GATE (temporary) — see ../page.tsx's own comment; same
// exemption, same reversal instructions, flagged in docs/pre-launch.md.
export const metadata: Metadata = {
  title: "Density direction — preview (internal)",
  robots: resolveRobots(true),
};

export default function DensityPreviewPageEn() {
  return <DensityPage locale="en" />;
}
