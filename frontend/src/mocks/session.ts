import type { MockUser } from "./fixtures";
import { users } from "./fixtures";

// Ephemeral mock session store — not real JWTs, just opaque tokens mapped to a user.
const accessTokens = new Map<string, number>(); // token -> userId
const refreshTokens = new Map<string, number>(); // token -> userId

function randomToken(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function issueTokens(user: MockUser) {
  const accessToken = randomToken("access");
  const refreshToken = randomToken("refresh");
  accessTokens.set(accessToken, user.id);
  refreshTokens.set(refreshToken, user.id);
  return { accessToken, refreshToken, expiresIn: 900 };
}

export function refreshAccessToken(refreshToken: string) {
  const userId = refreshTokens.get(refreshToken);
  if (userId === undefined) return null;
  const accessToken = randomToken("access");
  accessTokens.set(accessToken, userId);
  return { accessToken, expiresIn: 900 };
}

export function revokeRefreshToken(refreshToken: string) {
  refreshTokens.delete(refreshToken);
}

export function userFromAuthHeader(authHeader: string | null): MockUser | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  const userId = accessTokens.get(token);
  if (userId === undefined) return null;
  return users.find((u) => u.id === userId) ?? null;
}

export function publicUser(user: MockUser) {
  const { password: _password, ...rest } = user;
  return rest;
}
