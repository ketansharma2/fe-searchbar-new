"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function ForbiddenPage() {
  const { user, logout } = useAuth();
  const home =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "RECRUITER"
        ? "/recruiter/dashboard"
        : "/login";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10"
      >
        <ShieldX className="h-10 w-10 text-destructive" />
      </motion.div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">403 — Access Denied</h1>
        <p className="max-w-md text-muted-foreground">
          You don&apos;t have permission to view this page. This area is
          restricted to a different role.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href={home}>Go to my dashboard</Link>
        </Button>
        <Button variant="outline" onClick={() => logout()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
