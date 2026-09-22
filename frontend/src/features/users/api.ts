import { api } from "../../shared/api/client";
import type { Page, PageParams, Role } from "../../shared/api/types";

/** `UserResponseDTO` — never carries a password (frontend-users spec Assumptions). */
export interface User {
  id: number;
  name: string;
  userName: string;
  role: Role;
}

export interface UserFilters extends PageParams {
  name?: string;
  userName?: string;
  role?: Role;
}

export interface UserCreateInput {
  name: string;
  userName: string;
  password: string;
  role: Role;
}

/** `UserUpdateDTO` fields this frontend sends — `password` is intentionally never included (USR-09/11). */
export interface UserUpdateInput {
  name?: string;
  userName?: string;
  role?: Role;
}

export function listUsers(params: UserFilters = {}) {
  return api.get<Page<User>>("users", { params }).then((r) => r.data);
}

export function createUser(input: UserCreateInput) {
  return api.post<User>("users", input).then((r) => r.data);
}

export function updateUser(id: number, input: UserUpdateInput) {
  return api.patch<User>(`users/${id}`, input).then((r) => r.data);
}

/** Dedicated password-reset action — `PATCH /users/{id}/password`, kept separate from `updateUser` (USR-12). */
export function resetUserPassword(id: number, password: string) {
  return api.patch(`users/${id}/password`, { password });
}

export function deleteUser(id: number) {
  return api.delete(`users/${id}`);
}
