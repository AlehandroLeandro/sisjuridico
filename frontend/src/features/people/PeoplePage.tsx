import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPerson, deletePerson, listPeople, updatePerson, type Person, type PersonFilters } from "../../shared/api/people";
import { usePagedQuery } from "../../shared/hooks/usePagedQuery";
import { Button } from "../../shared/ui/Button";
import { TextField } from "../../shared/ui/Field";
import { ConfirmDialog, Modal } from "../../shared/ui/Modal";
import { Pagination } from "../../shared/ui/Pagination";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "../../shared/ui/States";
import {
  classifyDoc,
  formatCpfCnpj,
  getErrorMessage,
  getErrorStatus,
  onlyDigits,
  validateCpfCnpj,
  validateName,
  type PersonDocKind,
} from "./format";

type Tab = "all" | PersonDocKind;

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "fisica", label: "Pessoa física" },
  { value: "juridica", label: "Pessoa jurídica" },
  { value: "sem-documento", label: "Sem documento" },
];

interface PersonFormState {
  name: string;
  cpfCnpjDigits: string;
}

const emptyForm: PersonFormState = { name: "", cpfCnpjDigits: "" };

export function PeoplePage() {
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [cpfCnpjFilter, setCpfCnpjFilter] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const [editing, setEditing] = useState<Person | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PersonFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<{ name?: string; cpfCnpj?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<Person | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filters: PersonFilters = useMemo(
    () => ({
      name: nameFilter.trim() || undefined,
      cpfCnpj: cpfCnpjFilter.trim() ? onlyDigits(cpfCnpjFilter) : undefined,
    }),
    [nameFilter, cpfCnpjFilter],
  );

  const { data, isLoading, isError, error, setPage } = usePagedQuery(["people"], filters, listPeople);

  const forbidden = getErrorStatus(error) === 403;

  // PEOP-01 AC3/AC4: tab filter is derived client-side over the current page's rows, not a backend param.
  const rows = useMemo(() => {
    const content = data?.content ?? [];
    return tab === "all" ? content : content.filter((p) => classifyDoc(p.cpfCnpj) === tab);
  }, [data, tab]);

  const createMutation = useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      closeForm();
    },
    onError: (err) => setFormError(getErrorMessage(err, "Não foi possível salvar a pessoa.")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: { name: string; cpfCnpj?: string } }) => updatePerson(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      closeForm();
    },
    onError: (err) => setFormError(getErrorMessage(err, "Não foi possível salvar a pessoa.")),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      setDeleting(null);
      setDeleteError(null);
    },
    onError: (err) => setDeleteError(getErrorMessage(err, "Não foi possível excluir a pessoa.")),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(person: Person) {
    setEditing(person);
    setForm({ name: person.name, cpfCnpjDigits: person.cpfCnpj ?? "" });
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
    if (nameError || cpfCnpjError) {
      setFormErrors({ name: nameError, cpfCnpj: cpfCnpjError });
      return;
    }
    const input = { name: form.name.trim(), cpfCnpj: form.cpfCnpjDigits || undefined };
    if (editing) {
      updateMutation.mutate({ id: editing.id, input });
    } else {
      createMutation.mutate(input);
    }
  }

  function handleFilterChange(next: { name?: string; cpfCnpj?: string }) {
    if (next.name !== undefined) setNameFilter(next.name);
    if (next.cpfCnpj !== undefined) setCpfCnpjFilter(next.cpfCnpj);
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
          <div style={{ display: "flex", gap: 6, background: "var(--color-bg)", border: "1px solid var(--color-border-strong)", padding: 3 }}>
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                style={{
                  padding: "8px 13px",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: tab === t.value ? "var(--color-primary)" : "transparent",
                  color: tab === t.value ? "#fff" : "var(--color-text-faint)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button onClick={openCreate}>+ Cadastrar</Button>
        </div>
      </div>

      <div className="card">
        <div className="table-scroll">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState />
          ) : rows.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF/CNPJ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.cpfCnpj ? formatCpfCnpj(p.cpfCnpj) : "Sem documento"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 14, justifyContent: "flex-end" }}>
                        <Button variant="ghost" onClick={() => openEdit(p)}>
                          Editar
                        </Button>
                        <Button variant="ghost" style={{ color: "var(--color-danger-text)" }} onClick={() => setDeleting(p)}>
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

      {formOpen && (
        <Modal title={editing ? "Editar pessoa" : "Cadastrar pessoa"} onClose={closeForm}>
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
          title="Excluir pessoa"
          message={deleteError ?? `Confirma a exclusão de "${deleting.name}"?`}
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
