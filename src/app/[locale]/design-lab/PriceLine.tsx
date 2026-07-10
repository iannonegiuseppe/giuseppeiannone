import styles from "./design-lab.module.scss";

// Restaurant-menu price line: label, a dot leader, then price + unit on
// one baseline. The leader is a dotted border on an empty element (a
// border, not a run of "." characters) — it has no text content, so a
// screen reader has nothing to read there; the line as a whole reads as
// "label, price unit" in natural DOM order.
export function PriceLine({
  label,
  price,
  unit,
}: {
  label: string;
  price: string;
  unit: string;
}) {
  return (
    <li className={styles.priceLine}>
      <span className={styles.priceLineLabel}>{label}</span>
      <span className={styles.priceLineLeader} aria-hidden="true" />
      <span className={styles.priceLineValue}>
        <span className={styles.priceLinePrice}>{price}</span>{" "}
        <span className={styles.priceLineUnit}>{unit}</span>
      </span>
    </li>
  );
}
