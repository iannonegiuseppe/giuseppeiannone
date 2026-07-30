// 02 — Attacchi di panico e agorafobia. A flat line with one sharp spike
// — deliberately a SINGLE spike, not a repeating multi-bump wave, so it
// reads as an abstract "sudden change" mark rather than a literal
// heart-rate/EKG monitor glyph (a real medical-device cliché this pass's
// own §9/register brief excludes). Flagging this as the one icon most at
// risk of still reading as a heartbeat monitor once rendered — see this
// pass's own report.
export function PanicoIcon() {
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
      <path d="M3 15 H9 L12 5 L15 15 H21" />
    </svg>
  );
}
