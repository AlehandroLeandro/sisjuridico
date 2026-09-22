import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../shared/ui/Button";
import { SelectField, TextAreaField, TextField } from "../../shared/ui/Field";
import { ConfirmDialog } from "../../shared/ui/Modal";
import { ErrorState, ForbiddenState, LoadingState } from "../../shared/ui/States";
import { PersonPicker } from "../../shared/pickers/PersonPicker";
import { LawyerPicker } from "../../shared/pickers/LawyerPicker";
import {
  ACTION_LABELS,
  COURT_LABELS,
  INITIAL_ORGANIZATION_LABELS,
  NATURE_LABELS,
  POSITION_CLIENT_LABELS,
  RIT_LABELS,
  enumOptions,
} from "../../shared/enums/labels";
import {
  createLawsuit,
  deleteLawsuit,
  getLawsuit,
  maskNumProcesso,
  unmaskNumProcesso,
  updateLawsuit,
  type Lawsuit,
  type LawsuitInput,
} from "./api";
import { displayName, useLawyerNames, usePersonNames } from "./useEntityNames";

interface WizardState {
  numProcesso: string;
  dataInicio: string;
  observacao: string;
  rit: string;
  court: string;
  initialOrganization: string;
  nature: string;
  action: string;
  valorDaCausa: string;
  dataValorCausa: string;
  personId: number | null;
  lawyerId: number | null;
  positionClient: string;
  counterPartPersonId: number | null;
  counterPartLawyerId: number | null;
}

const EMPTY_FORM: WizardState = {
  numProcesso: "",
  dataInicio: "",
  observacao: "",
  rit: "",
  court: "",
  initialOrganization: "",
  nature: "",
  action: "",
  valorDaCausa: "",
  dataValorCausa: "",
  personId: null,
  lawyerId: null,
  positionClient: "",
  counterPartPersonId: null,
  counterPartLawyerId: null,
};

function fromLawsuit(l: Lawsuit): WizardState {
  return {
    numProcesso: l.numProcesso,
    dataInicio: l.dataInicio,
    observacao: l.observacao ?? "",
    rit: l.rit,
    court: l.court,
    initialOrganization: l.initialOrganization,
    nature: l.nature,
    action: l.action,
    valorDaCausa: l.valorDaCausa != null ? String(l.valorDaCausa) : "",
    dataValorCausa: l.dataValorCausa ?? "",
    personId: l.personId,
    lawyerId: l.lawyerId,
    positionClient: l.positionClient,
    counterPartPersonId: l.counterPartPersonId,
    counterPartLawyerId: l.counterPartLawyerId,
  };
}

function toInput(form: WizardState): LawsuitInput {
  return {
    numProcesso: unmaskNumProcesso(form.numProcesso),
    personId: form.personId as number,
    lawyerId: form.lawyerId as number,
    counterPartPersonId: form.counterPartPersonId as number,
    counterPartLawyerId: form.counterPartLawyerId as number,
    rit: form.rit,
    court: form.court,
    initialOrganization: form.initialOrganization,
    positionClient: form.positionClient,
    nature: form.nature,
    action: form.action,
    valorDaCausa: form.valorDaCausa ? Number(form.valorDaCausa) : null,
    dataValorCausa: form.dataValorCausa || null,
    dataInicio: form.dataInicio,
    observacao: form.observacao || null,
  };
}

type StepErrors = Record<string, string>;

function validateStep1(form: WizardState): StepErrors {
  const errors: StepErrors = {};
  const digits = unmaskNumProcesso(form.numProcesso);
  if (!digits || Number(digits) <= 0) errors.numProcesso = "Informe um número de processo válido.";
  if (!form.dataInicio) errors.dataInicio = "Informe a data de início.";
  if (form.observacao.length > 2000) errors.observacao = "Máximo de 2000 caracteres.";
  return errors;
}

function validateStep2(form: WizardState): StepErrors {
  const errors: StepErrors = {};
  if (!form.rit) errors.rit = "Selecione o rito.";
  if (!form.court) errors.court = "Selecione o tribunal.";
  if (!form.initialOrganization) errors.initialOrganization = "Selecione o órgão de origem.";
  if (!form.nature) errors.nature = "Selecione a natureza.";
  if (!form.action) errors.action = "Selecione a ação.";
  if (form.valorDaCausa) {
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(form.valorDaCausa) || Number(form.valorDaCausa) < 0.1) {
      errors.valorDaCausa = "Valor inválido (até 10 dígitos inteiros, 2 decimais, maior que zero).";
    }
  }
  return errors;
}

function validateStep3(form: WizardState): StepErrors {
  const errors: StepErrors = {};
  if (!form.personId) errors.personId = "Selecione o cliente.";
  if (!form.lawyerId) errors.lawyerId = "Selecione o advogado.";
  if (!form.positionClient) errors.positionClient = "Selecione a posição do cliente.";
  if (!form.counterPartPersonId) errors.counterPartPersonId = "Selecione a parte contrária.";
  if (!form.counterPartLawyerId) errors.counterPartLawyerId = "Selecione o advogado da parte contrária.";
  return errors;
}

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return "Não foi possível salvar o processo.";
}

const STEP_NAMES = ["Identificação", "Classificação", "Partes"] as const;

export function LawsuitFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mode: "create" | "edit" = id ? "edit" : "create";
  const lawsuitId = id ? Number(id) : null;

  const lawsuitQuery = useQuery({
    queryKey: ["lawsuit", lawsuitId],
    queryFn: () => getLawsuit(lawsuitId as number),
    enabled: mode === "edit" && lawsuitId != null,
    retry: false,
  });
  const lawsuit = lawsuitQuery.data ?? null;

  const [form, setForm] = useState<WizardState>(EMPTY_FORM);
  const [seededId, setSeededId] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<StepErrors>({});
  const [pickedLabels, setPickedLabels] = useState<Partial<Record<keyof WizardState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Seed the wizard once the existing lawsuit loads (edit mode) — LAW-18. Adjusting
  // state during render (not in an effect) per React's "you might not need an
  // effect" guidance: avoids an extra render pass on every load.
  if (lawsuit && lawsuit.id !== seededId) {
    setSeededId(lawsuit.id);
    setForm(fromLawsuit(lawsuit));
  }

  const personNames = usePersonNames([lawsuit?.personId, lawsuit?.counterPartPersonId]);
  const lawyerNames = useLawyerNames([lawsuit?.lawyerId, lawsuit?.counterPartLawyerId]);

  // A picker's label is whatever the user picked this session, falling back to the
  // name resolved for the id the lawsuit originally loaded with (LAW-18/38).
  const personLabel = pickedLabels.personId ?? (lawsuit && form.personId === lawsuit.personId ? displayName(personNames.get(lawsuit.personId)) : undefined);
  const lawyerLabel = pickedLabels.lawyerId ?? (lawsuit && form.lawyerId === lawsuit.lawyerId ? displayName(lawyerNames.get(lawsuit.lawyerId)) : undefined);
  const counterPersonLabel =
    pickedLabels.counterPartPersonId ??
    (lawsuit && form.counterPartPersonId === lawsuit.counterPartPersonId ? displayName(personNames.get(lawsuit.counterPartPersonId)) : undefined);
  const counterLawyerLabel =
    pickedLabels.counterPartLawyerId ??
    (lawsuit && form.counterPartLawyerId === lawsuit.counterPartLawyerId ? displayName(lawyerNames.get(lawsuit.counterPartLawyerId)) : undefined);

  if (mode === "edit") {
    if (lawsuitQuery.isLoading) return <LoadingState />;
    if (lawsuitQuery.isError) {
      const status = axios.isAxiosError(lawsuitQuery.error) ? lawsuitQuery.error.response?.status : undefined;
      if (status === 403) return <ForbiddenState />;
      if (status === 404) return <div className="state-message">Processo não encontrado.</div>;
      return <ErrorState label="Não foi possível carregar o processo." />;
    }
  }

  function goNext() {
    const stepErrors = step === 1 ? validateStep1(form) : validateStep2(form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  }

  function goBack() {
    setErrors({});
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }

  async function handleSave() {
    const e1 = validateStep1(form);
    const e2 = validateStep2(form);
    const e3 = validateStep3(form);
    if (Object.keys(e1).length > 0) {
      setStep(1);
      setErrors(e1);
      return;
    }
    if (Object.keys(e2).length > 0) {
      setStep(2);
      setErrors(e2);
      return;
    }
    if (Object.keys(e3).length > 0) {
      setStep(3);
      setErrors(e3);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);
    setSavedMessage(false);
    try {
      const input = toInput(form);
      if (mode === "edit" && lawsuitId != null) {
        const updated = await updateLawsuit(lawsuitId, input);
        queryClient.setQueryData(["lawsuit", lawsuitId], updated);
        setForm(fromLawsuit(updated));
        setSavedMessage(true);
      } else {
        const created = await createLawsuit(input);
        navigate(`/processos/${created.id}`, { replace: true });
      }
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (mode === "create") {
      navigate("/processos");
      return;
    }
    if (lawsuit) {
      setForm(fromLawsuit(lawsuit));
      setPickedLabels({});
      setErrors({});
      setSubmitError(null);
      setSavedMessage(false);
      setStep(1);
    }
  }

  async function confirmDelete() {
    if (lawsuitId == null) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteLawsuit(lawsuitId);
      navigate("/processos");
    } catch {
      setDeleteError("Não foi possível excluir o processo.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/processos")}
        style={{ background: "transparent", border: "none", color: "var(--color-primary-active)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 14 }}
      >
        ← Voltar para a listagem
      </button>

      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 4 }}>
              {mode === "edit" ? "Processo nº" : "Novo processo"}
            </div>
            {mode === "edit" && <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.02em" }}>{maskNumProcesso(form.numProcesso)}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {mode === "edit" && (
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                Excluir
              </Button>
            )}
            <Button variant="soft" onClick={handleCancel} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar processo"}
            </Button>
          </div>
        </div>

        {submitError && (
          <div style={{ padding: "12px 18px 0" }}>
            <div className="error">{submitError}</div>
          </div>
        )}
        {savedMessage && (
          <div style={{ padding: "12px 18px 0" }}>
            <div style={{ fontSize: 12.5, color: "var(--color-primary-active)" }}>Processo atualizado.</div>
          </div>
        )}

        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", padding: "0 18px", overflowX: "auto" }}>
          {STEP_NAMES.map((name, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = step === n;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setStep(n)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "14px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `3px solid ${active ? "var(--color-primary)" : "transparent"}`,
                  color: active ? "var(--color-text)" : "var(--color-text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    display: "grid",
                    placeItems: "center",
                    background: active ? "var(--color-primary)" : "var(--color-bg)",
                    color: active ? "#fff" : "var(--color-text-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {n}
                </span>
                {name}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "20px 18px" }}>
          {step === 1 && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 14 }}>
                Identificação
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px 16px" }}>
                <TextField
                  label="Número do processo"
                  placeholder="0000000-00.0000.0.00.0000"
                  value={form.numProcesso}
                  onChange={(e) => setForm((f) => ({ ...f, numProcesso: unmaskNumProcesso(e.target.value) }))}
                  error={errors.numProcesso}
                  hint={!errors.numProcesso ? maskNumProcesso(form.numProcesso) || "Digite apenas números." : undefined}
                />
                <TextField
                  label="Data de início"
                  type="date"
                  value={form.dataInicio}
                  onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))}
                  error={errors.dataInicio}
                />
              </div>
              <div style={{ marginTop: 14 }}>
                <TextAreaField
                  label="Observações"
                  rows={4}
                  maxLength={2000}
                  value={form.observacao}
                  onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                  error={errors.observacao}
                  hint={!errors.observacao ? `${form.observacao.length}/2000` : undefined}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 14 }}>
                Classificação
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px 16px" }}>
                <SelectField
                  label="Rito"
                  placeholder="Selecione"
                  options={enumOptions(RIT_LABELS)}
                  value={form.rit}
                  onChange={(e) => setForm((f) => ({ ...f, rit: e.target.value }))}
                  error={errors.rit}
                />
                <SelectField
                  label="Tribunal"
                  placeholder="Selecione"
                  options={enumOptions(COURT_LABELS)}
                  value={form.court}
                  onChange={(e) => setForm((f) => ({ ...f, court: e.target.value }))}
                  error={errors.court}
                />
                <SelectField
                  label="Órgão de origem"
                  placeholder="Selecione"
                  options={enumOptions(INITIAL_ORGANIZATION_LABELS)}
                  value={form.initialOrganization}
                  onChange={(e) => setForm((f) => ({ ...f, initialOrganization: e.target.value }))}
                  error={errors.initialOrganization}
                />
                <SelectField
                  label="Natureza"
                  placeholder="Selecione"
                  options={enumOptions(NATURE_LABELS)}
                  value={form.nature}
                  onChange={(e) => setForm((f) => ({ ...f, nature: e.target.value }))}
                  error={errors.nature}
                />
                <SelectField
                  label="Ação"
                  placeholder="Selecione"
                  options={enumOptions(ACTION_LABELS)}
                  value={form.action}
                  onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
                  error={errors.action}
                />
                <TextField
                  label="Valor da causa"
                  placeholder="0,00"
                  inputMode="decimal"
                  value={form.valorDaCausa}
                  onChange={(e) => setForm((f) => ({ ...f, valorDaCausa: e.target.value }))}
                  error={errors.valorDaCausa}
                  hint="Opcional"
                />
                <TextField
                  label="Data do valor da causa"
                  type="date"
                  value={form.dataValorCausa}
                  onChange={(e) => setForm((f) => ({ ...f, dataValorCausa: e.target.value }))}
                  hint="Opcional"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 14 }}>
                Partes do processo
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px 16px" }}>
                <PersonPicker
                  label="Cliente"
                  value={form.personId}
                  valueLabel={personLabel}
                  onChange={(pid, option) => {
                    setForm((f) => ({ ...f, personId: pid }));
                    setPickedLabels((p) => ({ ...p, personId: option?.label ?? "" }));
                  }}
                  error={errors.personId}
                />
                <LawyerPicker
                  label="Advogado do cliente"
                  value={form.lawyerId}
                  valueLabel={lawyerLabel}
                  onChange={(lid, option) => {
                    setForm((f) => ({ ...f, lawyerId: lid }));
                    setPickedLabels((p) => ({ ...p, lawyerId: option?.label ?? "" }));
                  }}
                  error={errors.lawyerId}
                />
                <SelectField
                  label="Posição do cliente"
                  placeholder="Selecione"
                  options={enumOptions(POSITION_CLIENT_LABELS)}
                  value={form.positionClient}
                  onChange={(e) => setForm((f) => ({ ...f, positionClient: e.target.value }))}
                  error={errors.positionClient}
                />
                <PersonPicker
                  label="Parte contrária"
                  value={form.counterPartPersonId}
                  valueLabel={counterPersonLabel}
                  onChange={(pid, option) => {
                    setForm((f) => ({ ...f, counterPartPersonId: pid }));
                    setPickedLabels((p) => ({ ...p, counterPartPersonId: option?.label ?? "" }));
                  }}
                  error={errors.counterPartPersonId}
                />
                <LawyerPicker
                  label="Advogado da parte contrária"
                  value={form.counterPartLawyerId}
                  valueLabel={counterLawyerLabel}
                  onChange={(lid, option) => {
                    setForm((f) => ({ ...f, counterPartLawyerId: lid }));
                    setPickedLabels((p) => ({ ...p, counterPartLawyerId: option?.label ?? "" }));
                  }}
                  error={errors.counterPartLawyerId}
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "14px 18px", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
            Etapa {step} de 3 · {STEP_NAMES[step - 1]}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" onClick={goBack} disabled={step === 1}>
              ← Voltar
            </Button>
            {step < 3 && <Button onClick={goNext}>Avançar</Button>}
          </div>
        </div>
      </div>

      {deleteOpen && (
        <ConfirmDialog
          title="Excluir processo"
          message={`Excluir o processo ${maskNumProcesso(form.numProcesso)}? Esta ação não pode ser desfeita.${deleteError ? ` ${deleteError}` : ""}`}
          confirmLabel={deleting ? "Excluindo..." : "Excluir"}
          danger
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteOpen(false);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}
