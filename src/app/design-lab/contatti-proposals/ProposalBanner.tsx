import Link from "next/link";
import styles from "./proposalBanner.module.scss";

// Internal-review chrome only — not part of any proposal's own design,
// exists so the three can be told apart and navigated between while
// reviewing. Would not ship if a proposal were promoted to the real page.
// Copy-pasted from ../prezzi-proposals/ProposalBanner.tsx (same reasoning
// as shared.ts's own comment: each proposals folder stays self-contained,
// not cross-imported, since either could be deleted independently once
// reviewed) — back-link retargeted to this route's own index.
export function ProposalBanner({
  label,
  weak,
}: {
  label: string;
  weak: string;
}) {
  return (
    <div className={styles.banner}>
      <p className={styles.bannerLabel}>
        <Link href="/design-lab/contatti-proposals" className={styles.bannerBack}>
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
