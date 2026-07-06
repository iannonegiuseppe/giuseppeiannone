import styles from "./WhoIAm.module.scss";

// Reuses siteSettings.author.bio rather than a separate homePage field —
// same identity already centralized there for the hero and Person JSON-LD.
export function WhoIAm({ heading, bio }: { heading: string; bio?: string }) {
  if (!bio) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <p className={styles.bio}>{bio}</p>
    </section>
  );
}
