"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, setOnRefreshFailed } from "@/services/api";
import { authApi } from "@/services/auth.service";
import { getAccessToken, setAccessToken } from "@/services/token";
import type { AuthResponse, LoginPayload, Role, User } from "@/types";

export interface AuthContextValue {
  user: User | null;
  role: Role | null;
  accessToken: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  fetchCurrentUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep React state in sync with the in-memory token store.
  const syncToken = useCallback((value: string | null) => {
    setAccessToken(value);
    setToken(value);
  }, []);

  /**
   * Exchange the HttpOnly refresh cookie for a new access token + user.
   * Returns true when a valid session was restored.
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    console.log('[AuthContext] Attempting to refresh token...');
    try {
      const { data } = await api.post<AuthResponse>("/auth/refresh");
      console.log('[AuthContext] Refresh successful:', { user: data.user, hasAccessToken: !!data.accessToken });
      syncToken(data.accessToken);
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('[AuthContext] Refresh failed:', error);
      syncToken(null);
      setUser(null);
      return false;
    }
  }, [syncToken]);

  const fetchCurrentUser = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<User> => {
      console.log('[AuthContext] Login attempt:', { email: payload.email, role: payload.role });
      const data = await authApi.login(payload);
      console.log('[AuthContext] Login successful:', { user: data.user, hasAccessToken: !!data.accessToken });
      syncToken(data.accessToken);
      setUser(data.user);
      console.log('[AuthContext] User state updated:', data.user);
      return data.user;
    },
    [syncToken]
  );

  const logout = useCallback(async () => {
    console.log('[AuthContext] Logout initiated');
    try {
      await authApi.logout();
      console.log('[AuthContext] Logout API call successful');
    } catch (error) {
      console.error('[AuthContext] Logout API call failed:', error);
      // ignore network errors on logout
    } finally {
      syncToken(null);
      setUser(null);
      console.log('[AuthContext] User state cleared, redirecting to login');
      router.replace("/login");
    }
  }, [router, syncToken]);

  // When the axios interceptor's refresh fails, force a clean logout.
  const logoutRef = useRef(logout);
  logoutRef.current = logout;
  useEffect(() => {
    setOnRefreshFailed(() => logoutRef.current());
    return () => setOnRefreshFailed(null);
  }, []);

  // Bootstrap: try to restore a session from the refresh cookie on first load.
  useEffect(() => {
    console.log('[AuthContext] Bootstrap: Attempting to restore session...');
    let active = true;
    (async () => {
      const restored = await refreshToken();
      console.log('[AuthContext] Bootstrap: Session restored?', restored);
      if (active && !restored) {
        syncToken(null);
      }
      if (active) {
        setLoading(false);
        console.log('[AuthContext] Bootstrap complete, loading=false');
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshToken, syncToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      accessToken: token ?? getAccessToken(),
      loading,
      login,
      logout,
      refreshToken,
      fetchCurrentUser,
    }),
    [user, token, loading, login, logout, refreshToken, fetchCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
