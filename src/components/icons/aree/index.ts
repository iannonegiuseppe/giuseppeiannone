// Aree card-grid pass — six abstract, geometric line-art marks, one per
// area, in the same order as AreeSection.tsx's own areas array (order
// 1-6). Deliberately NOT representational: no brains/hearts/heads/
// silhouettes/medical crosses/ribbons/award shapes (§9/register — see
// this pass's own report for the per-icon reasoning). Same inline-SVG/
// currentColor convention as ../social's icons — sized and colored by the
// wrapping element (AreeSection.module.scss's own .areeCardIcon), stroke
// only, aria-hidden (purely decorative; the card's real accessible name
// is its title).
export { AnsiaIcon } from "./AnsiaIcon";
export { PanicoIcon } from "./PanicoIcon";
export { DepressioneIcon } from "./DepressioneIcon";
export { SessualiIcon } from "./SessualiIcon";
export { StressIcon } from "./StressIcon";
export { RelazionaliIcon } from "./RelazionaliIcon";
