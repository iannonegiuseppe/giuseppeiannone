import { PreviewPlaceholder } from "./PreviewPlaceholder";
import styles from "./PreviewPlaceholder.module.scss";

// PREVIEW-GATE (temporary): the homepage-anchor variant — carries the
// SAME `id` the header/mobile nav's "Chi sono"/"Metodo" links now scroll
// to (see headerNavItems.ts's own PREVIEW-GATE block), so those anchors
// land somewhere real instead of nowhere. See page.tsx's own PREVIEW-GATE
// comment for the full list of what's gated and how to reverse it —
// removing this component's two call sites there (and restoring the
// commented-out real sections) is the entire reversal for this half of
// the gate.
export function PreviewPlaceholderSection({ id, locale }: { id: string; locale: string }) {
  return (
    <section id={id} className={styles.previewPlaceholderSection} data-lab-section={`preview-${id}`}>
      <PreviewPlaceholder locale={locale} />
    </section>
  );
}
