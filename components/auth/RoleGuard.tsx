"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FullPageSpinner } from "@/components/ui/spinner";
import type { Role } from "@/types";

/**
 * Client-side authorization gate used by the /admin and /recruiter layouts.
 *
 * - While auth is resolving → spinner
 * - Not authenticated → redirect to /login
 * - Authenticated but wrong role → redirect to /403
 * - Authorized → render children
 *
 * This is the definitive role check (proxy.ts only does an optimistic
 * cookie-presence check and cannot read the role).
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[RoleGuard] Check:', { loading, user: user?.email, userRole: user?.role, allowedRole: allow });
    if (loading) return;
    if (!user) {
      console.log('[RoleGuard] No user, redirecting to /login');
      router.replace("/login");
    } else if (user.role !== allow) {
      console.log('[RoleGuard] Role mismatch, redirecting to /403');
      router.replace("/403");
    } else {
      console.log('[RoleGuard] Access granted');
    }
  }, [loading, user, allow, router]);

  if (loading) {
    return <FullPageSpinner label="Verifying your session…" />;
  }

  // Redirect is in-flight; avoid flashing protected content.
  if (!user || user.role !== allow) {
    return <FullPageSpinner label="Redirecting…" />;
  }

  return <>{children}</>;
}
