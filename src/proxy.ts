import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  // Hard rule: any *.vercel.app host is always noindex, regardless of
  // environment. This specifically catches the production deployment's
  // own auto-assigned vercel.app alias, which VERCEL_ENV alone can't
  // distinguish from the real custom domain (see src/sanity/metadata.ts).
  // Runs here (per-request, at the edge) rather than in generateMetadata
  // so it doesn't force pages to render dynamically.
  if (request.nextUrl.hostname.endsWith(".vercel.app")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  // Skip /studio (Sanity Studio), /api routes, /design-preview and
  // /design-lab (standalone design artifact routes living outside the
  // [locale] segment entirely — see src/app/design-preview/layout.tsx's
  // own comment — so they must never be rewritten/redirected as if they
  // needed locale handling), Next.js internals, and any request for a
  // file with an extension (static assets: favicon.ico, images, etc).
  matcher: ["/((?!api|studio|design-preview|design-lab|_next|_vercel|.*\\..*).*)"],
};
