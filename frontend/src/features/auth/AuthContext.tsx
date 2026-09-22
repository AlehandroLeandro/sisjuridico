import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { registerAuthExpiredHandler, api } from "../../shared/api/client";
import {
  clearAllTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../../shared/api/tokenStore";
import type { AuthenticatedUser, RefreshResponse } from "../../shared/api/types";
import * as authApi from "./api";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  status: "checking" | "authenticated" | "anonymous";
  login: (userName: string, password: string, keepSignedIn: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Refresh this many seconds before the access token actually expires (SHELL-* Assumptions).
const REFRESH_SKEW_SECONDS = 60;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("checking");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback((expiresInSeconds: number, persist: boolean) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const delayMs = Math.max((expiresInSeconds - REFRESH_SKEW_SECONDS) * 1000, 5_000);
    refreshTimer.current = setTimeout(async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return;
      try {
        const { data } = await api.post<RefreshResponse>("auth/refresh", { refreshToken });
        setAccessToken(data.accessToken, data.expiresIn);
        scheduleRefresh(data.expiresIn, persist);
      } catch {
        // interceptor's onAuthExpired handles the forced logout on the next failing call
      }
    }, delayMs);
  }, []);

  const clearSession = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    clearAllTokens();
    setUser(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    registerAuthExpiredHandler(clearSession);
  }, [clearSession]);

  // Bootstrap: try a silent refresh from a persisted/session refresh token.
  useEffect(() => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      setStatus("anonymous");
      return;
    }
    api
      .post<RefreshResponse>("auth/refresh", { refreshToken })
      .then(({ data }) => {
        setAccessToken(data.accessToken, data.expiresIn);
        // Session restored but we don't have `user` from /auth/refresh — fetch it lazily
        // via whatever the shell needs first; for now mark authenticated with unknown user
        // details refreshed on next login. In practice the app should re-derive user info
        // from a stored copy alongside the refresh token if this matters at bootstrap.
        scheduleRefresh(data.expiresIn, !!localStorage.getItem("sisjuridico.refreshToken"));
        const storedUser = sessionStorage.getItem("sisjuridico.user") ?? localStorage.getItem("sisjuridico.user");
        if (storedUser) setUser(JSON.parse(storedUser));
        setStatus("authenticated");
      })
      .catch(() => {
        clearSession();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (userName: string, password: string, keepSignedIn: boolean) => {
      const data = await authApi.login(userName, password);
      setAccessToken(data.accessToken, data.expiresIn);
      setRefreshToken(data.refreshToken, keepSignedIn);
      const store = keepSignedIn ? localStorage : sessionStorage;
      store.setItem("sisjuridico.user", JSON.stringify(data.user));
      setUser(data.user);
      setStatus("authenticated");
      scheduleRefresh(data.expiresIn, keepSignedIn);
    },
    [scheduleRefresh],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    localStorage.removeItem("sisjuridico.user");
    sessionStorage.removeItem("sisjuridico.user");
    // SHELL-* Assumptions: clear local session unconditionally — ACCOUNTING is
    // currently blocked from this endpoint server-side (AD-006), and a network
    // failure shouldn't strand any user in a logged-in-looking state.
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore — local session clears regardless
      }
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
