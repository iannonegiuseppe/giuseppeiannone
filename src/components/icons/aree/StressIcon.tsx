// 05 — Stress e burnout. A vertical line with a chevron at the top —
// deliberately a chevron, not a dot, so it doesn't collapse into a
// literal exclamation-mark/warning-sign glyph.
export function StressIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 9 V20" />
      <path d="M7 9 L12 4 L17 9" />
    </svg>
  );
}
