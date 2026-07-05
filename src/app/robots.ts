import type { MetadataRoute } from "next";
import { isProductionDeployment } from "@/sanity/metadata";

// Placeholder policy — replaced with the full bot-allow list (Stage 2 Step
// 5) and the *.vercel.app disallow-everything override. For now this just
// keeps non-production deployments (local dev, previews) fully disallowed,
// matching the meta-robots default in src/sanity/metadata.ts.
export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return { rules: { userAgent: "*", allow: "/" } };
}
