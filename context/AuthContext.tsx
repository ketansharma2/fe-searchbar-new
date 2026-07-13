"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/auth.service";
import type { LoginPayload, Role, User } from "@/types";

export interface AuthContextValue {
  user: User | null;
  role: Role | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const data = await authApi.login(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  // Bootstrap: ask the backend who (if anyone) the request's cookies belong
  // to. The backend transparently rotates an expired access token using the
  // refresh cookie, so a single call is enough to both restore the session
  // and keep it alive.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await authApi.me();
        if (active) setUser(me);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      login,
      logout,
      fetchCurrentUser,
    }),
    [user, loading, login, logout, fetchCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
