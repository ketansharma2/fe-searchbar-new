"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FullPageSpinner } from "@/components/ui/spinner";

/**
 * Landing route. Sends users to the right place based on session/role.
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else {
      router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/recruiter/dashboard");
    }
  }, [user, loading, router]);

  return <FullPageSpinner label="Loading Maven Portal…" />;
}
