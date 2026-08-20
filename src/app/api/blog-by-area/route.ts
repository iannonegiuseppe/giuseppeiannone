import { NextResponse, type NextRequest } from "next/server";
import { getArticlesByArea, type ArticleListItem } from "@/sanity/articles";

// Blog category-chip pass — the on-demand fetch a chip click triggers
// (see CategoryChips.tsx). Deliberately separate from the page's own
// server-rendered fetch: shipping every article's cover+excerpt on every
// /blog load to power a filter most visitors never touch measured at
// +117% page weight (see the session's own payload measurement) for a
// corpus this size, so instead the default view stays exactly as
// server-rendered as it is today, and only a clicked filter's own
// articles get fetched, right here, still through sanityFetch — never a
// direct client → Sanity call, same rule as every other fetch in this
// codebase.
export const runtime = "nodejs";

interface BlogByAreaResponse {
  articles: ArticleListItem[];
  page: number;
  totalPages: number;
  totalCount: number;
}

const VALID_LOCALES = ["it", "en"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") ?? "";
  const areaId = searchParams.get("areaId") ?? "";
  const pageParam = searchParams.get("page") ?? "1";
  const page = Number.parseInt(pageParam, 10);

  if (!VALID_LOCALES.includes(locale)) {
    return NextResponse.json({ message: "Invalid locale." }, { status: 400 });
  }
  if (!areaId) {
    return NextResponse.json({ message: "Missing areaId." }, { status: 400 });
  }
  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json({ message: "Invalid page." }, { status: 400 });
  }

  const result = await getArticlesByArea(locale, areaId, page);
  const body: BlogByAreaResponse = result;

  return NextResponse.json(body);
}
