import Link from "next/link";
import styles from "./proposalBanner.module.scss";

// Internal-review chrome only — not part of any proposal's own design,
// exists so the three can be told apart and navigated between while
// reviewing. Would not ship if a proposal were promoted to the real page.
export function ProposalBanner({
  label,
  weak,
  hasRealHeader,
}: {
  label: string;
  weak: string;
  // Opt-in only — proposal C now renders the real, fixed-position site
  // Header above this banner (layout fix 1), which needs the banner
  // pushed down below it instead of both competing for the viewport's
  // true top:0. Left false/unset for A and B (still untouched, no real
  // Header there), so this is additive, not a shared-component behavior
  // change for proposals that never asked for one.
  hasRealHeader?: boolean;
}) {
  return (
    <div className={`${styles.banner} ${hasRealHeader ? styles.bannerBelowHeader : ""}`}>
      <p className={styles.bannerLabel}>
        <Link href="/design-lab/prezzi-proposals" className={styles.bannerBack}>
          ← Tutte le proposte
        </Link>
        <span className={styles.bannerTitle}>{label}</span>
      </p>
      <p className={styles.bannerWeak}>
        <strong>Punto debole:</strong> {weak}
      </p>
    </div>
  );
}
