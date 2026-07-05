import { getTranslations, setRequestLocale } from "next-intl/server";
import styles from "./page.module.scss";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.body}>{t("description")}</p>
    </main>
  );
}
