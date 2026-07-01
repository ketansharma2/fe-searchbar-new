/**
 * In-memory access-token store.
 *
 * The access token is intentionally kept ONLY in a module-scoped variable —
 * never in localStorage/sessionStorage — so it is not readable by XSS-injected
 * scripts and is cleared on full page reload (a new one is minted from the
 * HttpOnly refresh cookie via /auth/refresh).
 */
let accessToken: string | null = null;

// Optional listener so React state can mirror the in-memory token.
let listener: ((token: string | null) => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  listener?.(token);
}

export function subscribeToken(fn: (token: string | null) => void): () => void {
  listener = fn;
  return () => {
    listener = null;
  };
}
