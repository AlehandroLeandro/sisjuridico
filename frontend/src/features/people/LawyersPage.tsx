import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLawyer, deleteLawyer, listLawyers, reactivateLawyer, updateLawyer, type Lawyer, type LawyerFilters } from "../../shared/api/lawyers";
import { useAuth } from "../auth/AuthContext";
import { usePagedQuery } from "../../shared/hooks/usePagedQuery";
import { Button } from "../../shared/ui/Button";
import { TextField } from "../../shared/ui/Field";
import { ConfirmDialog, Modal } from "../../shared/ui/Modal";
import { Pagination } from "../../shared/ui/Pagination";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "../../shared/ui/States";
import { formatCpfCnpj, getErrorMessage, getErrorStatus, onlyDigits, validateCpfCnpj, validateName, validateOab } from "./format";

interface LawyerFormState {
  name: string;
  cpfCnpjDigits: string;
  oabDigits: string;
}

const emptyForm: LawyerFormState = { name: "", cpfCnpjDigits: "", oabDigits: "" };

export function LawyersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [nameFilter, setNameFilter] = useState("");
  const [cpfCnpjFilter, setCpfCnpjFilter] = useState("");
  const [oabFilter, setOabFilter] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [editing, setEditing] = useState<Lawyer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<LawyerFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<{ name?: string; cpfCnpj?: string; oab?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<Lawyer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reactivateError, setReactivateError] = useState<string | null>(null);

  const filters: LawyerFilters = useMemo(
    () => ({
      name: nameFilter.trim() || undefined,
      cpfCnpj: cpfCnpjFilter.trim() ? onlyDigits(cpfCnpjFilter) : undefined,
      oab: oabFilter.trim() ? onlyDigits(oabFilter) : undefined,
      active: !showInactive,
    }),
    [nameFilter, cpfCnpjFilter, oabFilter, showInactive],
  );

  const { data, isLoading, isError, error, setPage } = usePagedQuery(["lawyers"], filters, listLawyers);

  const forbidden = getErrorStatus(error) === 403;
  const rows = data?.content ?? [];

  const createMutation = useMutation({
    mutationFn: createLawyer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lawyers"] });
      closeForm();
    },
    onError: (err) => setFormError(getErrorMessage(err, "Não foi possível salvar o advogado.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: { name: string; cpfCnpj?: string; oab?: string } }) => updateLawyer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lawyers"] });
      closeForm();
    },
    onError: (err) => setFormError(getErrorMessage(err, "Não foi possível salvar o advogado.")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLawyer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lawyers"] });
      setDeleting(null);
      setDeleteError(null);
    },
    onError: (err) => setDeleteError(getErrorMessage(err, "Não foi possível excluir o advogado.")),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateLawyer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lawyers"] });
      setReactivateError(null);
    },
    onError: (err) => setReactivateError(getErrorMessage(err, "Não foi possível reativar o advogado.")),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(lawyer: Lawyer) {
    setEditing(lawyer);
    setForm({ name: lawyer.name, cpfCnpjDigits: lawyer.cpfCnpj ?? "", oabDigits: lawyer.oab ?? "" });
    setFormErrors({});
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nameError = validateName(form.name);
    const cpfCnpjError = validateCpfCnpj(form.cpfCnpjDigits);
    const oabError = validateOab(form.oabDigits);
    if (nameError || cpfCnpjError || oabError) {
      setFormErrors({ name: nameError, cpfCnpj: cpfCnpjError, oab: oabError });
      return;
    }
    const input = {
      name: form.name.trim(),
      cpfCnpj: form.cpfCnpjDigits || undefined,
      oab: form.oabDigits || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, input });
    } else {
      createMutation.mutate(input);
    }
  }

  function handleFilterChange(next: { name?: string; cpfCnpj?: string; oab?: string }) {
    if (next.name !== undefined) setNameFilter(next.name);
    if (next.cpfCnpj !== undefined) setCpfCnpjFilter(next.cpfCnpj);
    if (next.oab !== undefined) setOabFilter(next.oab);
    setPage(0);
  }

  function toggleInactive() {
    setShowInactive((v) => !v);
    setPage(0);
  }

  if (forbidden) return <ForbiddenState />;

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-bar-row">
          <TextField
            label="Nome"
            placeholder="Buscar por nome"
            value={nameFilter}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
          />
          <TextField
            label="CPF/CNPJ"
            placeholder="Buscar por CPF ou CNPJ"
            value={cpfCnpjFilter}
            onChange={(e) => handleFilterChange({ cpfCnpj: e.target.value })}
          />
          <TextField
            label="OAB"
            placeholder="Buscar por número da OAB"
            fixed
            value={oabFilter}
            onChange={(e) => handleFilterChange({ oab: e.target.value })}
          />
          <Button variant={showInactive ? "primary" : "soft"} onClick={toggleInactive}>
            Mostrar desabilitados
          </Button>
          <Button onClick={openCreate}>+ Cadastrar advogado</Button>
        </div>
      </div>

      <div className="card">
        {reactivateError && (
          <div style={{ padding: "12px 18px 0", color: "var(--color-danger-text)", fontSize: 13 }}>{reactivateError}</div>
        )}
        <div className="table-scroll">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState />
          ) : rows.length === 0 ? (
            <EmptyState label={showInactive ? "Nenhum advogado desabilitado." : undefined} />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF/CNPJ</th>
                  <th>OAB</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.cpfCnpj ? formatCpfCnpj(l.cpfCnpj) : "Sem documento"}</td>
                    <td>{l.oab ?? "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 14, justifyContent: "flex-end" }}>
                        <Button variant="ghost" onClick={() => openEdit(l)}>
                          Editar
                        </Button>
                        {showInactive ? (
                          user?.role === "ADMIN" && (
                            <Button variant="ghost" onClick={() => reactivateMutation.mutate(l.id)}>
                              Reativar
                            </Button>
                          )
                        ) : (
                          <Button variant="ghost" style={{ color: "var(--color-danger-text)" }} onClick={() => setDeleting(l)}>
                            Excluir
                          </Button>
                        )}
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

      {formOpen && (
        <Modal title={editing ? "Editar advogado" : "Cadastrar advogado"} onClose={closeForm}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={formErrors.name}
            />
            <TextField
              label="CPF/CNPJ"
              value={formatCpfCnpj(form.cpfCnpjDigits)}
              onChange={(e) => setForm((f) => ({ ...f, cpfCnpjDigits: onlyDigits(e.target.value).slice(0, 14) }))}
              error={formErrors.cpfCnpj}
              hint="Opcional. 11 dígitos para CPF ou 14 para CNPJ."
            />
            <TextField
              label="OAB"
              value={form.oabDigits}
              onChange={(e) => setForm((f) => ({ ...f, oabDigits: onlyDigits(e.target.value).slice(0, 6) }))}
              error={formErrors.oab}
              hint="Opcional. Exatamente 6 dígitos, sem seccional."
            />
            {formError && <div style={{ color: "var(--color-danger-text)", fontSize: 12, marginTop: 8 }}>{formError}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir advogado"
          message={deleteError ?? `Excluir "${deleting.name}"? O advogado deixará de aparecer na listagem.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => deleteMutation.mutate(deleting.id)}
          onCancel={() => {
            setDeleting(null);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}
