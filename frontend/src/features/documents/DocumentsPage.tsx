import axios from "axios";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePagedQuery } from "../../shared/hooks/usePagedQuery";
import { Button } from "../../shared/ui/Button";
import { TextField } from "../../shared/ui/Field";
import { Modal, ConfirmDialog } from "../../shared/ui/Modal";
import { LoadingState, EmptyState, ErrorState } from "../../shared/ui/States";
import { Badge } from "../../shared/ui/Badge";
import { Pagination } from "../../shared/ui/Pagination";
import { EntityPicker, type PickerOption } from "../../shared/pickers/EntityPicker";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import {
  type Document,
  type DocumentFilters,
  type DocumentUpdateInput,
  type UploadDocumentInput,
  MAX_UPLOAD_BYTES,
  listDocuments,
  uploadDocument,
  getDownloadUrl,
  triggerBrowserDownload,
  updateDocument,
  deleteDocument,
  getContract,
  getLawsuit,
  contractLabel,
  lawsuitLabel,
  searchContracts,
  searchLawsuits,
} from "./api";

type OwnerType = "contract" | "lawsuit";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionLabel(doc: Document): string {
  const fromName = doc.fileName.includes(".") ? doc.fileName.split(".").pop() : undefined;
  const fromType = doc.contentType.includes("/") ? doc.contentType.split("/").pop() : undefined;
  return (fromName || fromType || "arquivo").toUpperCase();
}

function uploadErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Falha de conexão ao enviar o arquivo. Verifique sua internet e tente novamente.";
    if (error.response.status === 413) return "O arquivo excede o limite de 20 MB.";
    if (error.response.status === 400) {
      const data = error.response.data as { message?: string } | undefined;
      return data?.message ?? "Não foi possível enviar o arquivo: dados inválidos.";
    }
  }
  return "Não foi possível enviar o arquivo. Tente novamente.";
}

function updateErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return "Este documento não existe mais.";
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return "Não foi possível salvar as alterações. Tente novamente.";
}

// ---------- Contract/Lawsuit name resolution (id -> display label), shared by the
// table's owner column, the "Documentos de:" banner, and the edit form's transfer confirm.

function useContractRef(id: number | null) {
  return useQuery({
    queryKey: ["contract-ref", id],
    queryFn: () => getContract(id as number),
    enabled: id !== null,
    staleTime: 5 * 60_000,
  });
}

function useLawsuitRef(id: number | null) {
  return useQuery({
    queryKey: ["lawsuit-ref", id],
    queryFn: () => getLawsuit(id as number),
    enabled: id !== null,
    staleTime: 5 * 60_000,
  });
}

function useOwnerLabel(contractId: number | null, lawsuitId: number | null): string | undefined {
  const contractQuery = useContractRef(contractId);
  const lawsuitQuery = useLawsuitRef(lawsuitId);
  if (contractId !== null) return contractQuery.data ? contractLabel(contractQuery.data) : undefined;
  if (lawsuitId !== null) return lawsuitQuery.data ? lawsuitLabel(lawsuitQuery.data) : undefined;
  return undefined;
}

function OwnerCell({ doc }: { doc: Document }) {
  const label = useOwnerLabel(doc.contractId, doc.lawsuitId);
  return <span>{label ?? "Carregando..."}</span>;
}

// ---------- Contract/Lawsuit pickers — minimal, scoped to this module (no shared
// ContractPicker/LawsuitPicker exists yet), built the same way PersonPicker/LawyerPicker are.

interface OwnerPickerProps {
  label: string;
  value: number | null;
  valueLabel?: string;
  onChange: (id: number | null, option: PickerOption | null) => void;
  disabled?: boolean;
}

function ContractPicker(props: OwnerPickerProps) {
  return <EntityPicker {...props} placeholder="Buscar por número do contrato" search={searchContracts} />;
}

function LawsuitPicker(props: OwnerPickerProps) {
  return <EntityPicker {...props} placeholder="Buscar por número do processo" search={searchLawsuits} />;
}

function OwnerFields({
  ownerType,
  onOwnerTypeChange,
  ownerId,
  ownerLabel,
  onOwnerChange,
  disabled,
}: {
  ownerType: OwnerType;
  onOwnerTypeChange: (type: OwnerType) => void;
  ownerId: number | null;
  ownerLabel?: string;
  onOwnerChange: (id: number | null, option: PickerOption | null) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="field">
        <label>Vincular a</label>
        <div style={{ display: "flex", gap: 16, padding: "9px 0" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 400 }}>
            <input type="radio" checked={ownerType === "contract"} onChange={() => onOwnerTypeChange("contract")} disabled={disabled} />
            Contrato
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 400 }}>
            <input type="radio" checked={ownerType === "lawsuit"} onChange={() => onOwnerTypeChange("lawsuit")} disabled={disabled} />
            Processo
          </label>
        </div>
      </div>
      {ownerType === "contract" ? (
        <ContractPicker label="Número do contrato" value={ownerId} valueLabel={ownerLabel} onChange={onOwnerChange} disabled={disabled} />
      ) : (
        <LawsuitPicker label="Número do processo" value={ownerId} valueLabel={ownerLabel} onChange={onOwnerChange} disabled={disabled} />
      )}
    </div>
  );
}

// ---------- Upload ----------

function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [ownerType, setOwnerType] = useState<OwnerType>("contract");
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [ownerLabel, setOwnerLabel] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (input: UploadDocumentInput) => uploadDocument(input, setProgress),
    onSuccess: onUploaded,
  });

  function handleOwnerTypeChange(type: OwnerType) {
    setOwnerType(type);
    setOwnerId(null);
    setOwnerLabel(undefined);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (picked && picked.size > MAX_UPLOAD_BYTES) {
      setFormError(`O arquivo (${formatBytes(picked.size)}) excede o limite de 20 MB.`);
      setFile(null);
      e.target.value = "";
      return;
    }
    setFormError(null);
    setFile(picked);
  }

  function handleSubmit() {
    setFormError(null);
    if (!file) {
      setFormError("Selecione um arquivo.");
      return;
    }
    if (ownerId === null) {
      setFormError("Selecione um contrato ou processo para vincular o arquivo.");
      return;
    }
    mutation.mutate({ file, contractId: ownerType === "contract" ? ownerId : null, lawsuitId: ownerType === "lawsuit" ? ownerId : null });
  }

  const mutationError = mutation.isError ? uploadErrorMessage(mutation.error) : null;
  const isNetworkError = mutation.isError && axios.isAxiosError(mutation.error) && !mutation.error.response;

  return (
    <Modal
      title="Novo documento"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Enviando..." : "Enviar"}
          </Button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="document-file">Arquivo</label>
        <input id="document-file" type="file" onChange={handleFileChange} disabled={mutation.isPending} />
        <div className="hint">Tamanho máximo: 20 MB.</div>
      </div>
      <OwnerFields
        ownerType={ownerType}
        onOwnerTypeChange={handleOwnerTypeChange}
        ownerId={ownerId}
        ownerLabel={ownerLabel}
        onOwnerChange={(id, opt) => {
          setOwnerId(id);
          setOwnerLabel(opt?.label);
        }}
        disabled={mutation.isPending}
      />
      {mutation.isPending && progress !== null && <div className="hint">Enviando... {progress}%</div>}
      {(formError || mutationError) && (
        <div className="error" style={{ marginTop: 8 }}>
          {formError ?? mutationError}
          {isNetworkError && (
            <Button variant="outline" onClick={handleSubmit} style={{ marginLeft: 8 }}>
              Tentar novamente
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}

// ---------- Edit / ownership transfer ----------

function EditModal({ doc, onClose, onUpdated }: { doc: Document; onClose: () => void; onUpdated: () => void }) {
  const [fileName, setFileName] = useState(doc.fileName);
  const [ownerType, setOwnerType] = useState<OwnerType>(doc.contractId !== null ? "contract" : "lawsuit");
  const [ownerId, setOwnerId] = useState<number | null>(doc.contractId ?? doc.lawsuitId);
  const [ownerLabel, setOwnerLabel] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<{ body: DocumentUpdateInput; newLabel: string } | null>(null);

  const originalOwnerLabel = useOwnerLabel(doc.contractId, doc.lawsuitId);

  const mutation = useMutation({
    mutationFn: (body: DocumentUpdateInput) => updateDocument(doc.id, body),
    onSuccess: onUpdated,
  });

  function handleOwnerTypeChange(type: OwnerType) {
    setOwnerType(type);
    setOwnerId(null);
    setOwnerLabel(undefined);
  }

  function handleSubmit() {
    setFormError(null);
    const trimmed = fileName.trim();
    if (!trimmed) {
      setFormError("Informe o nome do arquivo.");
      return;
    }
    if (ownerId === null) {
      setFormError("Selecione um contrato ou processo — um documento sempre precisa de um vínculo.");
      return;
    }
    const body: DocumentUpdateInput = ownerType === "contract" ? { fileName: trimmed, contractId: ownerId } : { fileName: trimmed, lawsuitId: ownerId };
    const ownerChanged = ownerType === "contract" ? ownerId !== doc.contractId : ownerId !== doc.lawsuitId;
    if (ownerChanged) {
      setPendingTransfer({ body, newLabel: ownerLabel ?? (ownerType === "contract" ? "o contrato selecionado" : "o processo selecionado") });
    } else {
      mutation.mutate(body);
    }
  }

  const mutationError = mutation.isError ? updateErrorMessage(mutation.error) : null;

  return (
    <>
      <Modal
        title="Editar documento"
        onClose={onClose}
        footer={
          <>
            <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <TextField label="Nome do arquivo" value={fileName} onChange={(e) => setFileName(e.target.value)} disabled={mutation.isPending} />
        <OwnerFields
          ownerType={ownerType}
          onOwnerTypeChange={handleOwnerTypeChange}
          ownerId={ownerId}
          ownerLabel={ownerLabel ?? originalOwnerLabel}
          onOwnerChange={(id, opt) => {
            setOwnerId(id);
            setOwnerLabel(opt?.label);
          }}
          disabled={mutation.isPending}
        />
        {(formError || mutationError) && <div className="error" style={{ marginTop: 8 }}>{formError ?? mutationError}</div>}
      </Modal>
      {pendingTransfer && (
        <ConfirmDialog
          title="Transferir vínculo"
          message={`Mover documento de ${originalOwnerLabel ?? "vínculo atual"} para ${pendingTransfer.newLabel}?`}
          confirmLabel="Mover"
          onConfirm={() => {
            mutation.mutate(pendingTransfer.body);
            setPendingTransfer(null);
          }}
          onCancel={() => setPendingTransfer(null)}
        />
      )}
    </>
  );
}

// ---------- List page ----------

export function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [fileName, setFileName] = useState("");
  const [contentType, setContentType] = useState("");
  const [contractIdFilter, setContractIdFilter] = useState<number | null>(() => {
    const raw = searchParams.get("contractId");
    return raw ? Number(raw) : null;
  });
  const [contractFilterLabel, setContractFilterLabel] = useState<string | undefined>(undefined);
  const [lawsuitIdFilter, setLawsuitIdFilter] = useState<number | null>(() => {
    const raw = searchParams.get("lawsuitId");
    return raw ? Number(raw) : null;
  });
  const [lawsuitFilterLabel, setLawsuitFilterLabel] = useState<string | undefined>(undefined);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const filters = useMemo<DocumentFilters>(
    () => ({
      fileName: fileName.trim() || undefined,
      contentType: contentType.trim() || undefined,
      contractId: contractIdFilter ?? undefined,
      lawsuitId: lawsuitIdFilter ?? undefined,
    }),
    [fileName, contentType, contractIdFilter, lawsuitIdFilter],
  );
  const filtersKey = JSON.stringify(filters);

  const { data, isLoading, isError, setPage } = usePagedQuery(["documents", filters], filters, listDocuments);

  // Reset to page 0 whenever a filter changes (a stale deeper page for a new filter set would look empty/wrong).
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const contextLabel = useOwnerLabel(contractIdFilter, lawsuitIdFilter);

  function clearContextFilter() {
    setContractIdFilter(null);
    setContractFilterLabel(undefined);
    setLawsuitIdFilter(null);
    setLawsuitFilterLabel(undefined);
    const next = new URLSearchParams(searchParams);
    next.delete("contractId");
    next.delete("lawsuitId");
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    setFileName("");
    setContentType("");
    clearContextFilter();
  }

  function invalidateList() {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  }

  async function handleDownload(doc: Document) {
    setListError(null);
    try {
      const { url } = await getDownloadUrl(doc.id);
      triggerBrowserDownload(url, doc.fileName);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setListError("Este documento não existe mais.");
        invalidateList();
      } else {
        setListError("Não foi possível obter o link do arquivo. Tente novamente.");
      }
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      invalidateList();
      setDeletingDoc(null);
    },
    onError: (err) => {
      const notFound = axios.isAxiosError(err) && err.response?.status === 404;
      setListError(notFound ? "Este documento não existe mais." : "Não foi possível excluir o documento. Tente novamente.");
      setDeletingDoc(null);
      if (notFound) invalidateList();
    },
  });

  return (
    <div>
      <div className="toolbar">
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Documentos</h1>
        <Button onClick={() => setUploadOpen(true)}>Novo documento</Button>
      </div>

      {contextLabel && (contractIdFilter !== null || lawsuitIdFilter !== null) && (
        <div className="filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>
            Documentos de: <strong>{contextLabel}</strong>
          </span>
          <Button variant="outline" onClick={clearContextFilter}>
            Ver todos os documentos
          </Button>
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-bar-row">
          <TextField label="Nome do arquivo" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Buscar por nome" />
          <TextField label="Tipo de conteúdo" value={contentType} onChange={(e) => setContentType(e.target.value)} placeholder="ex.: application/pdf" />
          <ContractPicker
            label="Contrato"
            value={contractIdFilter}
            valueLabel={contractFilterLabel}
            onChange={(id, opt) => {
              setContractIdFilter(id);
              setContractFilterLabel(opt?.label);
            }}
          />
          <LawsuitPicker
            label="Processo"
            value={lawsuitIdFilter}
            valueLabel={lawsuitFilterLabel}
            onChange={(id, opt) => {
              setLawsuitIdFilter(id);
              setLawsuitFilterLabel(opt?.label);
            }}
          />
          <Button variant="soft" onClick={clearFilters}>
            Limpar
          </Button>
        </div>
      </div>

      {listError && (
        <div className="state-message error" style={{ textAlign: "left", padding: "0 0 12px" }}>
          {listError}
        </div>
      )}

      <div className="card">
        <div className="table-scroll">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState />
          ) : !data || data.content.length === 0 ? (
            <EmptyState label="Nenhum documento encontrado." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Tipo</th>
                  <th>Vinculado a</th>
                  <th>Enviado em</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.fileName}</td>
                    <td>
                      <Badge>{extensionLabel(doc)}</Badge>
                    </td>
                    <td>
                      <OwnerCell doc={doc} />
                    </td>
                    <td>{formatDate(doc.createdAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Button variant="ghost" onClick={() => setPreviewDoc(doc)}>
                          Visualizar
                        </Button>
                        <Button variant="ghost" onClick={() => void handleDownload(doc)}>
                          Baixar
                        </Button>
                        <Button variant="ghost" onClick={() => setEditingDoc(doc)}>
                          Editar
                        </Button>
                        <Button variant="danger" onClick={() => setDeletingDoc(doc)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={data} onPageChange={setPage} />
      </div>

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            invalidateList();
            setUploadOpen(false);
          }}
        />
      )}

      {editingDoc && (
        <EditModal
          doc={editingDoc}
          onClose={() => setEditingDoc(null)}
          onUpdated={() => {
            invalidateList();
            setEditingDoc(null);
          }}
        />
      )}

      {deletingDoc && (
        <ConfirmDialog
          title="Excluir documento"
          message={`Excluir "${deletingDoc.fileName}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => deleteMutation.mutate(deletingDoc.id)}
          onCancel={() => setDeletingDoc(null)}
        />
      )}

      {previewDoc && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
