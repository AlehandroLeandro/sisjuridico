import { api } from "./client";
import type { Page, PageParams } from "./types";

/** Base Lawyer types + read access, shared by the Advogados module and the LawyerPicker. */
export interface Lawyer {
  id: number;
  name: string;
  cpfCnpj: string | null;
  oab: string | null;
  /** Soft delete flag — DELETE sets this false instead of removing the record. Per frontend-soft-delete spec. */
  active: boolean;
}

export interface LawyerFilters extends PageParams {
  name?: string;
  cpfCnpj?: string;
  oab?: string;
  /** Defaults to true server-side when omitted — pass `false` to list disabled records instead. */
  active?: boolean;
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

export function updateLawyer(id: number, input: Partial<{ name: string; cpfCnpj: string; oab: string; active: boolean }>) {
  return api.patch<Lawyer>(`lawyers/${id}`, input).then((r) => r.data);
}

/** Soft delete — the record is disabled, not removed. Per frontend-soft-delete spec. */
export function deleteLawyer(id: number) {
  return api.delete(`lawyers/${id}`);
}

/** ADMIN-only per SOFTDEL-08..10. */
export function reactivateLawyer(id: number) {
  return updateLawyer(id, { active: true });
}
