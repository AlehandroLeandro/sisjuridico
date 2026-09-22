import { api } from "../../shared/api/client";
import type { LoginResponse } from "../../shared/api/types";

export function login(userName: string, password: string) {
  return api.post<LoginResponse>("auth/login", { userName, password }).then((r) => r.data);
}

export function logout(refreshToken: string) {
  // SHELL-* Assumptions: ACCOUNTING is currently blocked from this endpoint by the
  // backend's catch-all rule (AD-006). Callers must clear local session state
  // regardless of whether this call succeeds.
  return api.post("auth/logout", { refreshToken });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return api.patch("auth/change-password", { currentPassword, newPassword });
}
