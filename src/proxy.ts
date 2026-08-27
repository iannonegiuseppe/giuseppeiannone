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
  // Skip /studio (Sanity Studio), /api routes, /design-lab (standalone
  // design artifact route living outside the [locale] segment entirely —
  // its own layout.tsx supplies its own <html>/<body>, so it must never
  // be rewritten/redirected as if it needed locale handling), Next.js
  // internals, and any request for a file with an extension (static
  // assets: favicon.ico, images, etc). /design-preview was excluded here
  // too until its route tree was deleted pre-launch (tone-swatch, the one
  // /design-lab route kept, was restored — see reservedSlugs.ts's own
  // comment on the same restoration).
  matcher: ["/((?!api|studio|design-lab|_next|_vercel|.*\\..*).*)"],
};
