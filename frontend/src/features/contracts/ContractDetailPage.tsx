import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getPerson } from "../../shared/api/people";
import { PersonPicker } from "../../shared/pickers/PersonPicker";
import { TextField, TextAreaField } from "../../shared/ui/Field";
import { EnumSelect } from "../../shared/ui/EnumSelect";
import { Button } from "../../shared/ui/Button";
import { Badge } from "../../shared/ui/Badge";
import { Modal, ConfirmDialog } from "../../shared/ui/Modal";
import { LoadingState, ErrorState } from "../../shared/ui/States";
import { TYPE_CONTRACT_LABELS, typeContractLabel, enumOptions } from "../../shared/enums/labels";
import { useAuth } from "../auth/AuthContext";
import {
  getContract,
  createContract,
  updateContract,
  deleteContract,
  listContractExtensions,
  createContractExtension,
  deriveContractStatus,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_TONE,
  type Contract,
  type ContractExtension,
  type ContractCreateInput,
} from "./api";
import { formatDate, formatDateTime } from "./format";

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) return "Acesso negado. Seu perfil não permite esta ação.";
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

interface FormState {
  file: string;
  startDate: string;
  endDate: string; // create-only
  adviceLeftDays: string;
  value: string;
  obs: string;
  active: boolean;
  contractorId: number | null;
  contractedId: number | null;
  typeContract: string;
}

function buildForm(contract: Contract | undefined): FormState {
  if (!contract) {
    return {
      file: "",
      startDate: "",
      endDate: "",
      adviceLeftDays: "",
      value: "",
      obs: "",
      active: true,
      contractorId: null,
      contractedId: null,
      typeContract: "",
    };
  }
  return {
    file: contract.file,
    startDate: contract.startDate,
    endDate: contract.endDate ?? "",
    adviceLeftDays: contract.adviceLeftDays != null ? String(contract.adviceLeftDays) : "",
    value: String(contract.value),
    obs: contract.obs ?? "",
    active: contract.active,
    contractorId: contract.contractorId,
    contractedId: contract.contractedId,
    typeContract: contract.typeContract,
  };
}

/**
 * Wrapper: fetches the contract (+ extension history) and gates on loading/404,
 * then mounts the actual form keyed on the contract id. The key forces a full
 * remount (and fresh local form state) whenever the id changes — e.g. right
 * after create navigates from /contratos/novo to /contratos/{newId} — instead
 * of syncing local state from a query result via an effect.
 */
export function ContractDetailPage() {
  const { id } = useParams();
  const contractId = id ? Number(id) : null;
  const isCreate = contractId === null;

  const contractQuery = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => getContract(contractId!),
    enabled: !isCreate,
  });
  const extensionsQuery = useQuery({
    queryKey: ["contract-extensions", contractId],
    queryFn: () => listContractExtensions(contractId!),
    enabled: !isCreate,
  });

  if (!isCreate && contractQuery.isLoading) return <LoadingState />;
  if (!isCreate && contractQuery.isError) {
    const status = isAxiosError(contractQuery.error) ? contractQuery.error.response?.status : undefined;
    return <ErrorState label={status === 404 ? "Contrato não encontrado." : "Não foi possível carregar o contrato."} />;
  }

  return (
    <ContractDetailForm
      key={contractId ?? "new"}
      contractId={contractId}
      isCreate={isCreate}
      contract={contractQuery.data}
      extensions={extensionsQuery.data ?? []}
      extensionsLoading={extensionsQuery.isLoading}
    />
  );
}

interface ContractDetailFormProps {
  contractId: number | null;
  isCreate: boolean;
  contract: Contract | undefined;
  extensions: ContractExtension[];
  extensionsLoading: boolean;
}

function ContractDetailForm({ contractId, isCreate, contract, extensions, extensionsLoading }: ContractDetailFormProps) {
  const { user } = useAuth();
  const canWrite = user?.role !== "ACCOUNTING";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const contractorNameQuery = useQuery({
    queryKey: ["person", contract?.contractorId],
    queryFn: () => getPerson(contract!.contractorId),
    enabled: !!contract,
  });
  const contractedNameQuery = useQuery({
    queryKey: ["person", contract?.contractedId],
    queryFn: () => getPerson(contract!.contractedId),
    enabled: !!contract,
  });

  const [form, setForm] = useState<FormState>(() => buildForm(contract));
  const [contractorLabel, setContractorLabel] = useState<string | undefined>();
  const [contractedLabel, setContractedLabel] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmEncerrar, setConfirmEncerrar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendForm, setExtendForm] = useState({ newEndDate: "", obs: "" });
  const [extendError, setExtendError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (input: ContractCreateInput) => createContract(input),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      navigate(`/contratos/${created.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: Omit<ContractCreateInput, "endDate">) => updateContract(contractId!, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(["contract", contractId], updated);
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => updateContract(contractId!, { active: false }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["contract", contractId], updated);
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteContract(contractId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      navigate("/contratos");
    },
  });

  const extendMutation = useMutation({
    mutationFn: (input: { newEndDate: string; obs?: string }) => createContractExtension(contractId!, input),
    onSuccess: (created) => {
      queryClient.setQueryData<Contract | undefined>(["contract", contractId], (old) =>
        old ? { ...old, endDate: created.newEndDate, active: true } : old,
      );
      queryClient.setQueryData<ContractExtension[] | undefined>(["contract-extensions", contractId], (old) =>
        old ? [created, ...old] : [created],
      );
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      setExtendOpen(false);
      setExtendForm({ newEndDate: "", obs: "" });
      setExtendError(null);
    },
  });

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!form.file.trim()) next.file = "Informe o código/referência do contrato.";
    if (!form.startDate) next.startDate = "Informe a data de início.";
    const value = Number(form.value);
    if (!form.value || Number.isNaN(value) || value < 0.1) next.value = "Informe um valor de ao menos 0,1.";
    if (!form.contractorId) next.contractorId = "Selecione o contratante.";
    if (!form.contractedId) next.contractedId = "Selecione o contratado.";
    if (!form.typeContract) next.typeContract = "Selecione o tipo de contrato.";
    if (form.obs.length > 255) next.obs = "Observação deve ter no máximo 255 caracteres.";
    if (isCreate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      next.endDate = "A vigência final deve ser posterior à data de início.";
    }
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (isCreate) {
      createMutation.mutate({
        file: form.file.trim(),
        startDate: form.startDate,
        endDate: form.endDate || null,
        adviceLeftDays: form.adviceLeftDays ? Number(form.adviceLeftDays) : null,
        value: Number(form.value),
        obs: form.obs.trim() || null,
        active: form.active,
        contractorId: form.contractorId!,
        contractedId: form.contractedId!,
        typeContract: form.typeContract,
      });
    } else {
      updateMutation.mutate({
        file: form.file.trim(),
        adviceLeftDays: form.adviceLeftDays ? Number(form.adviceLeftDays) : null,
        value: Number(form.value),
        obs: form.obs.trim() || null,
        active: form.active,
        startDate: form.startDate,
        contractorId: form.contractorId!,
        contractedId: form.contractedId!,
        typeContract: form.typeContract,
      });
    }
  }

  function handleExtendSubmit(e: FormEvent) {
    e.preventDefault();
    if (!contract) return;
    if (!extendForm.newEndDate) {
      setExtendError("Informe a nova data de vigência.");
      return;
    }
    if (contract.endDate && new Date(extendForm.newEndDate) <= new Date(contract.endDate)) {
      setExtendError("A nova vigência deve ser posterior à vigência atual.");
      return;
    }
    if (extendForm.obs.length > 255) {
      setExtendError("Observação deve ter no máximo 255 caracteres.");
      return;
    }
    setExtendError(null);
    extendMutation.mutate({ newEndDate: extendForm.newEndDate, obs: extendForm.obs.trim() || undefined });
  }

  const status = contract ? deriveContractStatus(contract) : null;
  const wasRenewed = contract && contract.originalEndDate !== contract.endDate;
  const submitError = createMutation.error ?? updateMutation.error;
  const sortedExtensions = [...extensions].sort((a, b) => b.extendedAt.localeCompare(a.extendedAt));

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/contratos")}
        style={{ background: "transparent", border: "none", color: "var(--color-success-soft-text)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 14 }}
      >
        ← Voltar para contratos
      </button>

      {!canWrite && (
        <div style={{ background: "var(--color-success-soft-bg)", border: "1px solid #cfe0c4", color: "var(--color-success-soft-text)", padding: "10px 14px", fontSize: 12.5, marginBottom: 14 }}>
          Seu perfil (Contabilidade) tem acesso somente leitura a contratos.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, alignItems: "start" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 4 }}>
                {isCreate ? "Novo contrato" : `Contrato ${contract?.file}`}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {isCreate ? "Cadastrar contrato" : typeContractLabel(contract!.typeContract)}
              </div>
            </div>
            {status && <Badge tone={CONTRACT_STATUS_TONE[status]}>{CONTRACT_STATUS_LABELS[status]}</Badge>}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "20px 18px" }}>
            {!isCreate && contract && (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16, fontSize: 12.5 }}>
                <div>
                  <div style={{ color: "var(--color-text-muted)", marginBottom: 2 }}>Vigência</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(contract.endDate)}</div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-muted)", marginBottom: 2 }}>Vigência original</div>
                  <div style={{ fontWeight: 600 }}>{formatDate(contract.originalEndDate)}</div>
                </div>
                {wasRenewed && <Badge tone="success-soft">Prorrogado</Badge>}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "14px 16px" }}>
              <TextField label="Contrato (referência)" value={form.file} disabled={!canWrite} error={errors.file} onChange={(e) => setForm((f) => ({ ...f, file: e.target.value }))} />
              <TextField label="Data de início" type="date" value={form.startDate} disabled={!canWrite} error={errors.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              {isCreate && (
                <TextField
                  label="Vigência final"
                  type="date"
                  value={form.endDate}
                  disabled={!canWrite}
                  hint="Deixe em branco para vigência indeterminada."
                  error={errors.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              )}
              <TextField
                label="Valor"
                type="number"
                step="0.01"
                min="0.1"
                value={form.value}
                disabled={!canWrite}
                error={errors.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
              <TextField
                label="Avisar antes do vencimento (dias)"
                type="number"
                min="0"
                step="1"
                value={form.adviceLeftDays}
                disabled={!canWrite}
                onChange={(e) => setForm((f) => ({ ...f, adviceLeftDays: e.target.value }))}
              />
              <EnumSelect
                label="Tipo de contrato"
                value={form.typeContract}
                placeholder="Selecione"
                options={enumOptions(TYPE_CONTRACT_LABELS)}
                disabled={!canWrite}
                error={errors.typeContract}
                onChange={(e) => setForm((f) => ({ ...f, typeContract: e.target.value }))}
              />
              <PersonPicker
                label="Contratante"
                value={form.contractorId}
                valueLabel={contractorLabel ?? contractorNameQuery.data?.name}
                disabled={!canWrite}
                error={errors.contractorId}
                onChange={(idValue, opt) => {
                  setForm((f) => ({ ...f, contractorId: idValue }));
                  setContractorLabel(opt?.label);
                }}
              />
              <PersonPicker
                label="Contratado"
                value={form.contractedId}
                valueLabel={contractedLabel ?? contractedNameQuery.data?.name}
                disabled={!canWrite}
                error={errors.contractedId}
                onChange={(idValue, opt) => {
                  setForm((f) => ({ ...f, contractedId: idValue }));
                  setContractedLabel(opt?.label);
                }}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <TextAreaField
                label="Observações"
                rows={4}
                maxLength={255}
                value={form.obs}
                disabled={!canWrite}
                error={errors.obs}
                onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
              />
            </div>

            {submitError && (
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-danger-text)" }}>{extractErrorMessage(submitError)}</div>
            )}

            {canWrite && (
              <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  Salvar alterações
                </Button>
                {!isCreate && contract && (
                  <>
                    <Button
                      variant="soft"
                      type="button"
                      disabled={!contract.endDate}
                      title={!contract.endDate ? "Contratos com vigência indefinida não podem ser prorrogados." : undefined}
                      onClick={() => setExtendOpen(true)}
                    >
                      Renovar vigência
                    </Button>
                    <Button variant="danger" type="button" disabled={!contract.active} onClick={() => setConfirmEncerrar(true)}>
                      Encerrar contrato
                    </Button>
                  </>
                )}
              </div>
            )}
            {!canWrite && !contract?.endDate && !isCreate && (
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--color-text-muted)" }}>
                Contratos com vigência indefinida não podem ser prorrogados.
              </div>
            )}
          </form>

          {!isCreate && (
            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <Button variant="outline" type="button" onClick={() => navigate(`/documentos?contractId=${contractId}`)}>
                Ver documentos vinculados
              </Button>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  style={{ background: "transparent", border: "none", color: "var(--color-danger-text)", fontSize: 12, cursor: "pointer" }}
                >
                  Excluir contrato
                </button>
              )}
            </div>
          )}
          {deleteMutation.isError && (
            <div style={{ padding: "0 18px 14px", fontSize: 12, color: "var(--color-danger-text)" }}>{extractErrorMessage(deleteMutation.error)}</div>
          )}
          {deactivateMutation.isError && (
            <div style={{ padding: "0 18px 14px", fontSize: 12, color: "var(--color-danger-text)" }}>{extractErrorMessage(deactivateMutation.error)}</div>
          )}
        </div>

        {!isCreate && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">Histórico de renovações</div>
            </div>
            {extensionsLoading && <LoadingState />}
            {sortedExtensions.length === 0 && !extensionsLoading && (
              <div className="state-message">Nenhuma renovação registrada.</div>
            )}
            {sortedExtensions.map((ext) => (
              <div key={ext.id} style={{ padding: "13px 18px", borderBottom: "1px solid var(--color-border-row)" }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {formatDate(ext.previousEndDate)} → {formatDate(ext.newEndDate)}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{formatDateTime(ext.extendedAt)}</div>
                {ext.obs && <div style={{ fontSize: 12.5, marginTop: 6 }}>{ext.obs}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {extendOpen && contract && (
        <Modal title="Renovar vigência" onClose={() => setExtendOpen(false)}>
          <form onSubmit={handleExtendSubmit}>
            {!contract.active && (
              <div style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)", padding: "10px 12px", fontSize: 12.5, marginBottom: 14 }}>
                Este contrato está Inativo. Confirmar a renovação irá reativá-lo (status voltará a Ativo).
              </div>
            )}
            <TextField
              label="Nova vigência"
              type="date"
              value={extendForm.newEndDate}
              onChange={(e) => setExtendForm((f) => ({ ...f, newEndDate: e.target.value }))}
            />
            <div style={{ marginTop: 14 }}>
              <TextAreaField
                label="Observações"
                rows={3}
                maxLength={255}
                value={extendForm.obs}
                onChange={(e) => setExtendForm((f) => ({ ...f, obs: e.target.value }))}
              />
            </div>
            {(extendError || extendMutation.isError) && (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--color-danger-text)" }}>{extendError ?? extractErrorMessage(extendMutation.error)}</div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <Button variant="outline" type="button" onClick={() => setExtendOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={extendMutation.isPending}>
                Confirmar renovação
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmEncerrar && (
        <ConfirmDialog
          title="Encerrar contrato"
          message="Confirma o encerramento deste contrato? Ele passará a ser exibido como Inativo."
          confirmLabel="Encerrar"
          danger
          onCancel={() => setConfirmEncerrar(false)}
          onConfirm={() => {
            setConfirmEncerrar(false);
            deactivateMutation.mutate();
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir contrato"
          message="Esta ação é permanente e não pode ser desfeita. Confirma a exclusão deste contrato?"
          confirmLabel="Excluir"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            deleteMutation.mutate();
          }}
        />
      )}
    </div>
  );
}
