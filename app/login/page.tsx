"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/services/api";
import { Logo } from "@/components/brand/Logo";
import { RecruiterIllustration } from "@/components/brand/RecruiterIllustration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const roles: { value: Role; label: string; icon: React.ElementType }[] = [
  { value: "ADMIN", label: "Admin", icon: ShieldCheck },
  { value: "RECRUITER", label: "Recruiter", icon: UserRound },
];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [role, setRole] = useState<Role>("RECRUITER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dashboardFor = (r: Role) =>
    r === "ADMIN" ? "/admin/dashboard" : "/recruiter/dashboard";

  // Already authenticated → skip login.
  useEffect(() => {
    console.log('[LoginPage] Auth state:', { loading, user: user?.email, role: user?.role, submitting });
    // Don't redirect if we're in the middle of submitting the form
    if (!loading && user && !submitting) {
      const target = dashboardFor(user.role);
      console.log('[LoginPage] User already authenticated, redirecting to:', target);
      router.replace(target);
    }
  }, [user, loading, router, submitting]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    console.log('[LoginPage] Form submitted:', { email, role });
    try {
      const loggedIn = await login({ email, password, role });
      console.log('[LoginPage] Login returned user:', loggedIn);
      const from = params.get("from");
      const target =
        from && from.startsWith(loggedIn.role === "ADMIN" ? "/admin" : "/recruiter")
          ? from
          : dashboardFor(loggedIn.role);
      console.log('[LoginPage] Redirecting to:', target, { from, userRole: loggedIn.role });
      // Use push instead of replace to ensure navigation happens
      router.push(target);
    } catch (err) {
      console.error('[LoginPage] Login failed:', err);
      setError(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* ── Left brand panel ─────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 text-white lg:flex"
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

        <Logo variant="light" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 space-y-6"
        >
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight">
              Welcome back to your <br /> hiring command center.
            </h1>
            <p className="max-w-md text-blue-100/90">
              Manage recruiters, track candidates, and move great people through
              your pipeline — all in one secure portal.
            </p>
          </div>
          <RecruiterIllustration className="w-full max-w-md drop-shadow-xl" />
        </motion.div>

        <p className="relative z-10 text-sm text-blue-100/70">
          © {new Date().getFullYear()} Maven Jobs. All rights reserved.
        </p>
      </motion.aside>

      {/* ── Right login card ─────────────────────────────── */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo variant="dark" />
          </div>

          <div className="mb-8 space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Choose your role and enter your credentials to continue.
            </p>
          </div>

          {/* role selector */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            {roles.map((r) => {
              const active = role === r.value;
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "relative flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="role-pill"
                      className="absolute inset-0 rounded-md bg-background shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{r.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@mavenjobs.in"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() =>
                    setError("Please contact your administrator to reset your password.")
                  }
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4" /> Signing in…
                </>
              ) : (
                `Sign in as ${role === "ADMIN" ? "Admin" : "Recruiter"}`
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Demo — Admin: admin@mavenjobs.in · Recruiter: recruiter@mavenjobs.in ·
            Password: Maven@2026
          </p>
        </motion.div>
      </div>
    </div>
  );
}
