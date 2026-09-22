import { api } from "./client";
import type { Page, PageParams } from "./types";

/**
 * Base Person types + read access, shared by the Pessoas module (full CRUD,
 * built on top of this) and the PersonPicker used by Lawsuits/Contracts/Documents.
 * Per PersonCreateDTO: only `name` is required, `cpfCnpj` is optional (11 or 14 digits).
 */
export interface Person {
  id: number;
  name: string;
  cpfCnpj: string | null;
  /** Soft delete flag — DELETE sets this false instead of removing the record. Per frontend-soft-delete spec. */
  active: boolean;
}

export interface PersonFilters extends PageParams {
  name?: string;
  cpfCnpj?: string;
  /** Defaults to true server-side when omitted — pass `false` to list disabled records instead. */
  active?: boolean;
}

export function listPeople(params: PersonFilters = {}) {
  return api.get<Page<Person>>("people", { params }).then((r) => r.data);
}

export function getPerson(id: number) {
  return api.get<Person>(`people/${id}`).then((r) => r.data);
}

export function createPerson(input: { name: string; cpfCnpj?: string }) {
  return api.post<Person>("people", input).then((r) => r.data);
}

export function updatePerson(id: number, input: Partial<{ name: string; cpfCnpj: string; active: boolean }>) {
  return api.patch<Person>(`people/${id}`, input).then((r) => r.data);
}

/** Soft delete — the record is disabled, not removed. Per frontend-soft-delete spec. */
export function deletePerson(id: number) {
  return api.delete(`people/${id}`);
}

/** ADMIN-only per SOFTDEL-08..10. */
export function reactivatePerson(id: number) {
  return updatePerson(id, { active: true });
}
