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
}

export interface PersonFilters extends PageParams {
  name?: string;
  cpfCnpj?: string;
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

export function updatePerson(id: number, input: Partial<{ name: string; cpfCnpj: string }>) {
  return api.patch<Person>(`people/${id}`, input).then((r) => r.data);
}

export function deletePerson(id: number) {
  return api.delete(`people/${id}`);
}
