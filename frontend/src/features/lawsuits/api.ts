import { api } from "../../shared/api/client";
import type { Page, PageParams } from "../../shared/api/types";

/**
 * Lawsuit shape mirrors MockLawsuit (src/mocks/fixtures.ts) / the real
 * LawsuitResponseDTO. numProcesso stays a string end to end — a 20-digit CNJ
 * number would lose precision as a JS number (see LAW-* Assumptions).
 */
export interface Lawsuit {
  id: number;
  numProcesso: string;
  personId: number;
  lawyerId: number;
  counterPartPersonId: number;
  counterPartLawyerId: number;
  rit: string;
  court: string;
  initialOrganization: string;
  positionClient: string;
  nature: string;
  action: string;
  valorDaCausa: number | null;
  dataValorCausa: string | null;
  dataInicio: string;
  observacao: string | null;
  /** Soft delete flag — DELETE sets this false instead of removing the record. Per frontend-soft-delete spec. Never set by the create/edit form (see LawsuitInput). */
  active: boolean;
}

/** active is deliberately excluded — the create/edit wizard never touches it; only delete/reactivate do. */
export type LawsuitInput = Omit<Lawsuit, "id" | "active">;

/** Quick-filter set per LAW-02 (numProcesso, personId, lawyerId, court, nature). */
export interface LawsuitFilters extends PageParams {
  numProcesso?: string;
  personId?: number;
  lawyerId?: number;
  court?: string;
  nature?: string;
  /** Defaults to true server-side when omitted — pass `false` to list disabled records instead. */
  active?: boolean;
}

export function listLawsuits(params: LawsuitFilters = {}) {
  return api.get<Page<Lawsuit>>("lawsuits", { params }).then((r) => r.data);
}

export function getLawsuit(id: number) {
  return api.get<Lawsuit>(`lawsuits/${id}`).then((r) => r.data);
}

export function createLawsuit(input: LawsuitInput) {
  return api.post<Lawsuit>("lawsuits", input).then((r) => r.data);
}

export function updateLawsuit(id: number, input: LawsuitInput) {
  return api.patch<Lawsuit>(`lawsuits/${id}`, input).then((r) => r.data);
}

/** Soft delete — the record is disabled, not removed. Per frontend-soft-delete spec. */
export function deleteLawsuit(id: number) {
  return api.delete(`lawsuits/${id}`);
}

/** ADMIN-only per SOFTDEL-08..10. */
export function reactivateLawsuit(id: number) {
  return api.patch<Lawsuit>(`lawsuits/${id}`, { active: true }).then((r) => r.data);
}

/** Strip everything but digits — what gets sent/stored, per LAW-* Assumptions on numProcesso. */
export function unmaskNumProcesso(value: string): string {
  return value.replace(/\D/g, "");
}

/** Display-only CNJ mask (0000000-00.0000.0.00.0000). Falls back to raw digits until there are enough of them. */
export function maskNumProcesso(digits: string): string {
  const d = unmaskNumProcesso(digits);
  if (d.length < 20) return d;
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16, 20)}`;
}

/** Plain "YYYY-MM-DD" -> "DD/MM/YYYY", no Date object involved so no timezone shift. */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}
