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
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== allow) {
      router.replace("/403");
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
