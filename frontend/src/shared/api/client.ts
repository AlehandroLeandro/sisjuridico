import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearAllTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "./tokenStore";
import type { RefreshResponse } from "./types";

/**
 * Base URL: root-level paths (no /api prefix) per the real backend — see
 * backend-cors-pagination spec's Assumptions table. Configurable via env so
 * dev can point at MSW (default, see src/mocks) or a real backend later.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

/** Called by AuthProvider once mounted, so the client can force a logout on an unrecoverable 401. */
let onAuthExpired: (() => void) | null = null;
export function registerAuthExpiredHandler(handler: () => void) {
  onAuthExpired = handler;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<RefreshResponse>(
      `${API_BASE_URL}auth/refresh`,
      { refreshToken },
    );
    setAccessToken(data.accessToken, data.expiresIn);
    return data.accessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retried && !original.url?.includes("/auth/")) {
      original._retried = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      clearAllTokens();
      onAuthExpired?.();
    }

    return Promise.reject(error);
  },
);
