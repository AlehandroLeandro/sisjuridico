/**
 * Token storage per SHELL-* (frontend-shell-auth spec, Assumptions table):
 * - access token: memory only, never persisted (cleared on full page reload by design)
 * - refresh token: sessionStorage by default, localStorage when the user checks
 *   "Manter conectado" at login — this is what gives that checkbox real behavior
 *   instead of being decorative (backend has no separate "remember me" concept).
 */

const REFRESH_TOKEN_KEY = "sisjuridico.refreshToken";

let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null; // epoch ms

export function setAccessToken(token: string, expiresInSeconds: number) {
  accessToken = token;
  accessTokenExpiresAt = Date.now() + expiresInSeconds * 1000;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getAccessTokenExpiresAt(): number | null {
  return accessTokenExpiresAt;
}

export function clearAccessToken() {
  accessToken = null;
  accessTokenExpiresAt = null;
}

export function setRefreshToken(token: string, persist: boolean) {
  if (persist) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearAllTokens() {
  clearAccessToken();
  clearRefreshToken();
}
