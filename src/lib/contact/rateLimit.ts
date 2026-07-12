// Contact form pass — lightweight per-IP rate limit. In-memory only: no
// external store (Redis/Upstash) is wired up in this project, and adding
// one is a real infra decision (a new paid dependency) that doesn't
// belong bundled silently into a form feature — flagged per spec's own
// "report what's feasible" instruction. This Map is process-local, so it
// resets on every cold start and each concurrent serverless instance
// keeps its own counter — not a real distributed rate limit, just a
// speed bump against a naive script. Acceptable for this site's actual
// traffic (a solo practitioner's contact form).
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}
