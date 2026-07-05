import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip /studio (Sanity Studio, added in a later step), /api routes,
  // Next.js internals, and any request for a file with an extension
  // (static assets: favicon.ico, images, etc).
  matcher: ["/((?!api|studio|_next|_vercel|.*\\..*).*)"],
};
