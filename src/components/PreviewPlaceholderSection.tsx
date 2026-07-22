import { PreviewPlaceholder } from "./PreviewPlaceholder";
import styles from "./PreviewPlaceholder.module.scss";

// PREVIEW-GATE (temporary): the homepage-anchor variant of PreviewPlaceholder
// — a labeled <section id="..."> wrapper so a gated homepage section can
// still be a valid same-page anchor target while its real content isn't
// live yet. No current call site (the homepage's own "formazione" stand-in
// was removed in the placeholder-removal pass — see page.tsx's own
// PREVIEW-GATE comment; FormazioneBand/Pricing/Sedes stay gated but no
// longer show any visible placeholder). Left in place as the standard
// device for the next gated section that needs one.
export function PreviewPlaceholderSection({ id, locale }: { id: string; locale: string }) {
  return (
    <section id={id} className={styles.previewPlaceholderSection} data-lab-section={`preview-${id}`}>
      <PreviewPlaceholder locale={locale} />
    </section>
  );
}
