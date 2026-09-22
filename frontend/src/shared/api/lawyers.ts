import { api } from "./client";
import type { Page, PageParams } from "./types";

/** Base Lawyer types + read access, shared by the Advogados module and the LawyerPicker. */
export interface Lawyer {
  id: number;
  name: string;
  cpfCnpj: string | null;
  oab: string | null;
}

export interface LawyerFilters extends PageParams {
  name?: string;
  cpfCnpj?: string;
  oab?: string;
}

export function listLawyers(params: LawyerFilters = {}) {
  return api.get<Page<Lawyer>>("lawyers", { params }).then((r) => r.data);
}

export function getLawyer(id: number) {
  return api.get<Lawyer>(`lawyers/${id}`).then((r) => r.data);
}

export function createLawyer(input: { name: string; cpfCnpj?: string; oab?: string }) {
  return api.post<Lawyer>("lawyers", input).then((r) => r.data);
}

export function updateLawyer(id: number, input: Partial<{ name: string; cpfCnpj: string; oab: string }>) {
  return api.patch<Lawyer>(`lawyers/${id}`, input).then((r) => r.data);
}

export function deleteLawyer(id: number) {
  return api.delete(`lawyers/${id}`);
}
