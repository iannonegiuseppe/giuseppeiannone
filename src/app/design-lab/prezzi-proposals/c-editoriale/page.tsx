import type { Metadata } from "next";
import { resolveRobots } from "@/sanity/metadata";
import { ProposalCContent } from "./ProposalCContent";

export const metadata: Metadata = {
  title: "Prezzi — proposta C, editoriale (interno)",
  robots: resolveRobots(true),
};

export default function ProposalCEditoriale() {
  return <ProposalCContent locale="it" />;
}
