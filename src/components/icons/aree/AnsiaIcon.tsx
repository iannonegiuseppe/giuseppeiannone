// 01 — Ansia e disturbi d'ansia. Concentric circles: a small centre ring
// and a larger ring around it — abstract "something orbiting a fixed
// point," not a literal symbol. fill="none" throughout, including the
// centre (a small stroked ring rather than a solid dot), per this pass's
// own spec.
export function AnsiaIcon() {
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
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
}
