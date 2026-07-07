import { Card } from "@/components/Card";
import { contactPath, locationPath, type Locale } from "@/sanity/paths";
import styles from "./LocationsStrip.module.scss";

interface Location {
  title: string;
  address?: string;
  slug?: string;
}

// Brief §6: "ONLINE / Milano / Monza as three quiet cards ... text-first."
// Online isn't a locationPage document (locationPage is protected to
// exactly two — Milan, Monza — see CLAUDE.md's schema guardrails), so it's
// fixed UI copy here rather than Sanity content, linking to the contact
// page (there's no dedicated "online" location to link to). Real location
// cards degrade gracefully to zero without leaving an empty section or a
// broken-looking hole — the Online card alone is still a complete section.
export function LocationsStrip({
  locale,
  heading,
  onlineTitle,
  onlineDescription,
  locations,
}: {
  locale: Locale;
  heading: string;
  onlineTitle: string;
  onlineDescription: string;
  locations: Location[];
}) {
  const realLocationCards = locations
    .filter((location): location is Location & { slug: string } =>
      Boolean(location.slug),
    )
    .map((location) => ({
      title: location.title,
      description: location.address,
      href: locationPath(locale, location.slug),
    }));

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.grid}>
        <li>
          <Card
            title={onlineTitle}
            description={onlineDescription}
            href={contactPath(locale)}
          />
        </li>
        {realLocationCards.map((card) => (
          <li key={card.href}>
            <Card
              title={card.title}
              description={card.description}
              href={card.href}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
