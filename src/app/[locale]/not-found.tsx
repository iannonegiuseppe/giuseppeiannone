import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { homePath, type Locale } from "@/sanity/paths";

// not-found.js receives no props (confirmed against current Next.js docs),
// so unlike page.tsx we can't read `params.locale` — getLocale() reads the
// same request-scoped locale that the ancestor layout already established
// via setRequestLocale. Next.js injects the noindex robots meta tag and 404
// status automatically for this file; no manual robots handling needed.
export default async function NotFound() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations({ locale, namespace: "NotFound" });

  return (
    <main>
      <title>{`${t("title")} | Giuseppe Iannone`}</title>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <Link href={homePath(locale)}>{t("backHome")}</Link>
    </main>
  );
}
