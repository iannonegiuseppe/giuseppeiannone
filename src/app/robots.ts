import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const indexingEnabled = process.env.NEXT_PUBLIC_ENABLE_INDEXING === "true";

  if (!indexingEnabled) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return { rules: { userAgent: "*", allow: "/" } };
}
