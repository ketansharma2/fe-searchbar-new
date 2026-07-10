import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 renamed `middleware.ts` → `proxy.ts` (same functionality).
 *
 * This performs an OPTIMISTIC auth check only: it verifies that the HttpOnly
 * refresh-token cookie is present and redirects unauthenticated users to
 * /login before they reach a protected route. It intentionally does NOT
 * verify the token or read the role — that would require a DB/secret and slow
 * every navigation. Definitive role authorization happens client-side in the
 * /admin and /recruiter layouts (RoleGuard) after fetching /auth/me.
 */
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? "refreshToken";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(REFRESH_COOKIE_NAME)?.value);

  // DEBUG-ONLY: visible in the Amplify SSR/function logs, not the browser.
  console.log("[cors-debug][proxy]", {
    pathname,
    cookieNamesSeen: request.cookies.getAll().map((c) => c.name),
    hasSession,
  });

  // Unauthenticated user hitting a protected route → send to login.
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    console.log("[cors-debug][proxy] redirecting to login — no refresh cookie found", { pathname });
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only guard the protected sections; RoleGuard handles per-role access.
  matcher: ["/admin/:path*", "/recruiter/:path*"],
};
