"use client";

import { useCallback, useEffect, useRef } from "react";

// Contact form hardening pass — shared by ContactForm.tsx and
// LibriForm.tsx, both of which post to the same /api/contact and both of
// which now need a token from /api/contact-token (see formToken.ts's own
// comment for what it encodes). Fetched once on mount so it's already in
// hand by the time a real visitor finishes filling the form; getToken()
// covers the rare case someone submits before that fetch resolves,
// refreshToken() is what a caller reaches for after the server reports
// the current one expired — never a NEW hook state a re-render could
// race, just a ref holding whatever the latest fetch returned.
export function useFormToken() {
  const tokenRef = useRef<string | null>(null);
  const pendingRef = useRef<Promise<string> | null>(null);

  const fetchToken = useCallback((): Promise<string> => {
    if (pendingRef.current) return pendingRef.current;
    const promise = fetch("/api/contact-token")
      .then((res) => {
        if (!res.ok) throw new Error(`contact-token request failed: ${res.status}`);
        return res.json();
      })
      .then((data: { token: string }) => {
        tokenRef.current = data.token;
        return data.token;
      })
      .finally(() => {
        pendingRef.current = null;
      });
    pendingRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    // Errors here are not fatal — a submit-time call to getToken() below
    // will simply try again; nothing needs to surface to the visitor just
    // because the on-mount prefetch itself failed once.
    fetchToken().catch(() => undefined);
  }, [fetchToken]);

  const getToken = useCallback((): Promise<string> => {
    if (tokenRef.current) return Promise.resolve(tokenRef.current);
    return fetchToken();
  }, [fetchToken]);

  const refreshToken = useCallback((): Promise<string> => {
    tokenRef.current = null;
    return fetchToken();
  }, [fetchToken]);

  return { getToken, refreshToken };
}
