import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Styling foundation wired up</h1>
      <p className={styles.body}>
        This placeholder proves the SCSS Modules + design-token pipeline
        works. It will be replaced by real pages once content, i18n, and
        Sanity are wired in.
      </p>
    </main>
  );
}
