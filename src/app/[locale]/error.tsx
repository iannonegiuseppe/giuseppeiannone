"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { homePath, type Locale } from "@/sanity/paths";

// Error boundaries must be Client Components (confirmed against current
// Next.js docs) and, like not-found.tsx, receive no route params — the
// ancestor layout.tsx (same segment) is NOT wrapped by this boundary, so
// its NextIntlClientProvider still supplies context here, but params must
// come from useParams() instead of a prop.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");
  const params = useParams<{ locale: string }>();
  const locale: Locale = params.locale === "en" ? "en" : "it";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <button type="button" onClick={() => reset()}>
        {t("retry")}
      </button>
      <Link href={homePath(locale)}>{t("backHome")}</Link>
    </main>
  );
}
