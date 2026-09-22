import { api } from "../../shared/api/client";
import type { PickerOption } from "../../shared/pickers/EntityPicker";
import type { Page, PageParams } from "../../shared/api/types";

/** Mirrors DocumentResponseDTO (backend-document-storage spec). `sizeBytes` isn't rendered anywhere yet, kept optional. */
export interface Document {
  id: number;
  fileName: string;
  contentType: string;
  storagePath: string;
  sizeBytes?: number;
  createdAt: string;
  contractId: number | null;
  lawsuitId: number | null;
}

export interface DocumentFilters extends PageParams {
  fileName?: string;
  contentType?: string;
  contractId?: number;
  lawsuitId?: number;
}

export function listDocuments(params: DocumentFilters = {}) {
  return api.get<Page<Document>>("documents", { params }).then((r) => r.data);
}

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export interface UploadDocumentInput {
  file: File;
  contractId: number | null;
  lawsuitId: number | null;
}

/** POST /documents as multipart/form-data — axios sets the boundary itself from the FormData instance. */
export function uploadDocument(input: UploadDocumentInput, onProgress?: (percent: number | null) => void) {
  const form = new FormData();
  form.append("file", input.file);
  if (input.contractId !== null) form.append("contractId", String(input.contractId));
  if (input.lawsuitId !== null) form.append("lawsuitId", String(input.lawsuitId));
  return api
    .post<Document>("documents", form, {
      onUploadProgress: (evt) => onProgress?.(evt.total ? Math.round((evt.loaded / evt.total) * 100) : null),
    })
    .then((r) => r.data);
}

export function getDownloadUrl(id: number) {
  return api.get<{ url: string; expiresAt: string }>(`documents/${id}/download`).then((r) => r.data);
}

export interface DocumentUpdateInput {
  fileName?: string;
  contractId?: number | null;
  lawsuitId?: number | null;
}

export function updateDocument(id: number, input: DocumentUpdateInput) {
  return api.patch<Document>(`documents/${id}`, input).then((r) => r.data);
}

export function deleteDocument(id: number) {
  return api.delete(`documents/${id}`);
}

/**
 * Minimal Contract/Lawsuit read access scoped to this module — no shared
 * ContractPicker/LawsuitPicker exists yet (per spec, this module builds its
 * own rather than waiting on that cross-cutting work). Reuses the same
 * EntityPicker the Person/Lawyer pickers are built on.
 */
export interface ContractRef {
  id: number;
  file: string;
}

export interface LawsuitRef {
  id: number;
  numProcesso: number | string;
}

export function getContract(id: number) {
  return api.get<ContractRef>(`contracts/${id}`).then((r) => r.data);
}

export function getLawsuit(id: number) {
  return api.get<LawsuitRef>(`lawsuits/${id}`).then((r) => r.data);
}

export function contractLabel(ref: ContractRef): string {
  return `Contrato ${ref.file}`;
}

export function lawsuitLabel(ref: LawsuitRef): string {
  return `Processo ${ref.numProcesso}`;
}

// ponytail: neither /contracts nor /lawsuits supports a text search param (only exact
// id/enum filters — verified in ContractController/LawsuitController) so this fetches one
// page and filters client-side; fine at this app's scale, revisit with a real search param
// if contract/lawsuit counts grow past a page.
export async function searchContracts(query: string): Promise<PickerOption[]> {
  const page = await api.get<Page<ContractRef>>("contracts", { params: { size: 50 } }).then((r) => r.data);
  const q = query.trim().toLowerCase();
  return page.content
    .filter((c) => !q || c.file.toLowerCase().includes(q))
    .map((c) => ({ id: c.id, label: contractLabel(c) }));
}

export async function searchLawsuits(query: string): Promise<PickerOption[]> {
  const page = await api.get<Page<LawsuitRef>>("lawsuits", { params: { size: 50 } }).then((r) => r.data);
  const q = query.trim().toLowerCase();
  return page.content
    .filter((l) => !q || String(l.numProcesso).toLowerCase().includes(q))
    .map((l) => ({ id: l.id, label: lawsuitLabel(l) }));
}
