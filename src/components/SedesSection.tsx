import { SedesStage, type SedeScene } from "./SedesStage";
import styles from "./SedesSection.module.scss";

interface SedeDoc {
  _id: string;
  city: string;
  isOnline?: boolean;
  onlineLine?: string;
  addresses?: SedeScene["addresses"];
}

// Single-block pass: rebuilds the old 3-card "Sedi" grid into sticky
// scroll scenes (desktop) / a scroll-snap slider (mobile-tablet) with a
// styled Leaflet map. The whole visual stage (scenes + map, rendered by
// SedesStage, a client component) is aria-hidden — this sr-only list is
// the canonical, scroll-independent version for screen readers, reading
// from the exact same sedeScenes array the stage uses for its markers
// and panels, so the two can never drift.
//
// CMS-wiring pass: scenes come from the new `sede` document type
// (replaces sediData.ts) — _id becomes the scene's id.
export function SedesSection({
  kicker,
  heading,
  paragraph,
  sedes,
}: {
  kicker: string;
  heading: string;
  paragraph: string;
  sedes?: SedeDoc[];
}) {
  const sedeScenes: SedeScene[] = (sedes ?? []).map((sede) => ({
    id: sede._id,
    city: sede.city,
    addresses: sede.isOnline ? [] : (sede.addresses ?? []),
    onlineLine: sede.isOnline ? sede.onlineLine : undefined,
  }));

  return (
    <section className={styles.sedesSection} data-lab-section="locations">
      <div className={styles.sedesSrOnly}>
        <h2>{heading}</h2>
        <ul>
          {sedeScenes.map((scene) => (
            <li key={scene.id}>
              <h3>{scene.city}</h3>
              {scene.addresses.length > 0 ? (
                <ul>
                  {scene.addresses.map((addr) => (
                    <li key={addr.address}>
                      {addr.centerName ? `${addr.centerName} — ${addr.address}` : addr.address}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{scene.onlineLine}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
      <SedesStage kicker={kicker} heading={heading} paragraph={paragraph} scenes={sedeScenes} />
    </section>
  );
}
