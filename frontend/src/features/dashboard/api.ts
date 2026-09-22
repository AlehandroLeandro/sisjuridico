import { api } from "../../shared/api/client";
import type { Page, PageParams } from "../../shared/api/types";
import type { PickerOption } from "../../shared/pickers/EntityPicker";

/**
 * GET /dashboard + /eventos calls, typed against the shapes the mock backend
 * (src/mocks/handlers.ts) actually returns — see backend-dashboard-eventos
 * spec (DASHEVT-01..14) for the field-by-field contract.
 */

export type EventoTipo = "AUDIENCIA" | "PRAZO_PROCESSUAL" | "VENCIMENTO" | "RENOVACAO" | "AVISO_PRAZO";

export interface Evento {
  id: number;
  titulo: string;
  tipo: EventoTipo;
  data: string; // ISO date, YYYY-MM-DD
  hora: string | null; // "HH:mm"
  responsavel: string | null;
  nota: string | null;
  lawsuitId: number | null;
  contractId: number | null;
}

export interface EventoRangeFilters extends PageParams {
  from?: string;
  to?: string;
}

export function listEventos(params: EventoRangeFilters) {
  return api.get<Page<Evento>>("eventos", { params }).then((r) => r.data);
}

export interface EventoInput {
  titulo: string;
  tipo: EventoTipo;
  data: string;
  hora: string | null;
  responsavel: string | null;
  nota: string | null;
  lawsuitId: number | null;
  contractId: number | null;
}

export function createEvento(input: EventoInput) {
  return api.post<Evento>("eventos", input).then((r) => r.data);
}

export function updateEvento(id: number, input: EventoInput) {
  return api.patch<Evento>(`eventos/${id}`, input).then((r) => r.data);
}

export function deleteEvento(id: number) {
  return api.delete(`eventos/${id}`);
}

/**
 * Minimal Contract/Lawsuit read access scoped to this module, for the
 * create/edit form's Vínculo search-select and for resolving an event's
 * linked-record label — mirrors the same scoped-picker pattern the
 * documents module built (no shared ContractPicker/LawsuitPicker exists
 * yet; per that module's own notes, /contracts and /lawsuits have no text
 * search param, so this fetches one page and filters client-side).
 */
export interface ContractRef {
  id: number;
  file: string;
}

export interface LawsuitRef {
  id: number;
  numProcesso: string;
}

export function getContractRef(id: number) {
  return api.get<ContractRef>(`contracts/${id}`).then((r) => r.data);
}

export function getLawsuitRef(id: number) {
  return api.get<LawsuitRef>(`lawsuits/${id}`).then((r) => r.data);
}

export function contractRefLabel(ref: ContractRef): string {
  return `Contrato ${ref.file}`;
}

export function lawsuitRefLabel(ref: LawsuitRef): string {
  return `Processo ${ref.numProcesso}`;
}

export async function searchContractRefs(query: string): Promise<PickerOption[]> {
  const page = await api.get<Page<ContractRef>>("contracts", { params: { size: 50 } }).then((r) => r.data);
  const q = query.trim().toLowerCase();
  return page.content
    .filter((c) => !q || c.file.toLowerCase().includes(q))
    .map((c) => ({ id: c.id, label: contractRefLabel(c) }));
}

export async function searchLawsuitRefs(query: string): Promise<PickerOption[]> {
  const page = await api.get<Page<LawsuitRef>>("lawsuits", { params: { size: 50 } }).then((r) => r.data);
  const q = query.trim().toLowerCase();
  return page.content
    .filter((l) => !q || String(l.numProcesso).toLowerCase().includes(q))
    .map((l) => ({ id: l.id, label: lawsuitRefLabel(l) }));
}

export interface DashboardKpi {
  valor: number;
  deltaMes?: number;
}

export interface ContratoVencendo {
  contractId: number;
  contratante: string;
  /** TypeContract enum literal — render via typeContractLabel() from shared/enums/labels. */
  tipo: string;
  valor: number;
  diasRestantes: number;
  endDate: string;
}

export interface DocumentoRecente {
  documentId: number;
  fileName: string;
  createdAt: string;
  contractId: number | null;
  lawsuitId: number | null;
}

export interface NaturezaCount {
  /** Nature enum literal — render via natureLabel() from shared/enums/labels. */
  nature: string;
  count: number;
}

export interface DashboardResponse {
  kpis: {
    processosAtivos: DashboardKpi;
    contratosVigentes: DashboardKpi;
    contratosAVencer30d: DashboardKpi;
  };
  contratosVencendo: ContratoVencendo[];
  documentosRecentes: DocumentoRecente[];
  distribuicaoNatureza: NaturezaCount[];
  proximosEventos: Evento[];
}

export function getDashboard() {
  return api.get<DashboardResponse>("dashboard").then((r) => r.data);
}
