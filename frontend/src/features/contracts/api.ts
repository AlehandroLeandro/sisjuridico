import { api } from "../../shared/api/client";
import type { Page, PageParams } from "../../shared/api/types";
import type { BadgeTone } from "../../shared/ui/Badge";

/**
 * Contract / ContractExtension types + CRUD, per the real backend DTOs
 * (verified against ContractResponseDTO / ContractCreateDTO / ContractUpdateDTO /
 * ContractExtensionCreateDTO — see frontend-contracts spec's Assumptions table).
 * `endDate` is only settable at creation; every later change goes through
 * `createContractExtension` (CTR-19 / CTR-21..28).
 */
export interface Contract {
  id: number;
  file: string;
  startDate: string;
  endDate: string | null;
  originalEndDate: string | null;
  adviceLeftDays: number | null;
  value: number;
  obs: string | null;
  active: boolean;
  contractorId: number;
  contractedId: number;
  typeContract: string;
}

export interface ContractExtension {
  id: number;
  contractId: number;
  previousEndDate: string;
  newEndDate: string;
  extendedAt: string;
  obs: string | null;
}

export interface ContractFilters extends PageParams {
  active?: boolean;
  typeContract?: string;
  contractorId?: number;
  contractedId?: number;
}

export function listContracts(params: ContractFilters = {}) {
  return api.get<Page<Contract>>("contracts", { params }).then((r) => r.data);
}

export function getContract(id: number) {
  return api.get<Contract>(`contracts/${id}`).then((r) => r.data);
}

export interface ContractCreateInput {
  file: string;
  startDate: string;
  endDate?: string | null;
  adviceLeftDays?: number | null;
  value: number;
  obs?: string | null;
  active: boolean;
  contractorId: number;
  contractedId: number;
  typeContract: string;
}

export function createContract(input: ContractCreateInput) {
  return api.post<Contract>("contracts", input).then((r) => r.data);
}

// endDate intentionally excluded — the general edit form never sends it (CTR-19).
export type ContractUpdateInput = Partial<Omit<ContractCreateInput, "endDate">>;

export function updateContract(id: number, input: ContractUpdateInput) {
  return api.patch<Contract>(`contracts/${id}`, input).then((r) => r.data);
}

export function deleteContract(id: number) {
  return api.delete(`contracts/${id}`);
}

export function listContractExtensions(contractId: number) {
  return api.get<ContractExtension[]>(`contracts/${contractId}/extensions`).then((r) => r.data);
}

export function createContractExtension(contractId: number, input: { newEndDate: string; obs?: string }) {
  return api.post<ContractExtension>(`contracts/${contractId}/extensions`, input).then((r) => r.data);
}

/**
 * Derived status — no such field exists on `Contract` (only `active:boolean`).
 * Rule mirrors the dashboard module's confirmed 30-day near-expiry window
 * (frontend-contracts spec's Assumptions table), including already-past-due
 * active contracts, which fold into "A vencer" rather than a 4th bucket.
 */
export type ContractStatus = "ATIVO" | "A_VENCER" | "INATIVO";

const NEAR_EXPIRY_DAYS = 30;

export function deriveContractStatus(contract: Pick<Contract, "active" | "endDate">): ContractStatus {
  if (!contract.active) return "INATIVO";
  if (contract.endDate) {
    const daysLeft = (new Date(contract.endDate).getTime() - Date.now()) / 86_400_000;
    if (daysLeft <= NEAR_EXPIRY_DAYS) return "A_VENCER";
  }
  return "ATIVO";
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  ATIVO: "Ativo",
  A_VENCER: "A vencer",
  INATIVO: "Inativo",
};

export const CONTRACT_STATUS_TONE: Record<ContractStatus, BadgeTone> = {
  ATIVO: "success",
  A_VENCER: "warning",
  INATIVO: "neutral",
};
