import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { usePagedQuery } from "../../shared/hooks/usePagedQuery";
import { Button } from "../../shared/ui/Button";
import { Badge } from "../../shared/ui/Badge";
import { SelectField, TextField } from "../../shared/ui/Field";
import { Pagination } from "../../shared/ui/Pagination";
import { ConfirmDialog } from "../../shared/ui/Modal";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "../../shared/ui/States";
import { PersonPicker } from "../../shared/pickers/PersonPicker";
import { LawyerPicker } from "../../shared/pickers/LawyerPicker";
import { COURT_LABELS, NATURE_LABELS, actionLabel, courtLabel, enumOptions, natureLabel, ritLabel } from "../../shared/enums/labels";
import { deleteLawsuit, listLawsuits, maskNumProcesso, unmaskNumProcesso, type Lawsuit, type LawsuitFilters } from "./api";
import { displayName, useLawyerNames, usePersonNames } from "./useEntityNames";

interface FilterDraft {
  numProcesso: string;
  personId: number | null;
  personLabel: string;
  lawyerId: number | null;
  lawyerLabel: string;
  court: string;
  nature: string;
}

const EMPTY_DRAFT: FilterDraft = { numProcesso: "", personId: null, personLabel: "", lawyerId: null, lawyerLabel: "", court: "", nature: "" };

export function LawsuitsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
  const [filters, setFilters] = useState<LawsuitFilters>({});
  const [deleteTarget, setDeleteTarget] = useState<Lawsuit | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError, error, setPage, refetch } = usePagedQuery(["lawsuits"], filters, listLawsuits, { size: 20 });

  const rows = data?.content ?? [];
  const personNames = usePersonNames(rows.map((r) => r.personId));
  const lawyerNames = useLawyerNames(rows.map((r) => r.lawyerId));

  function applyFilters() {
    setPage(0);
    setFilters({
      numProcesso: draft.numProcesso ? unmaskNumProcesso(draft.numProcesso) : undefined,
      personId: draft.personId ?? undefined,
      lawyerId: draft.lawyerId ?? undefined,
      court: draft.court || undefined,
      nature: draft.nature || undefined,
    });
  }

  function clearFilters() {
    setDraft(EMPTY_DRAFT);
    setPage(0);
    setFilters({});
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteLawsuit(deleteTarget.id);
      await queryClient.invalidateQueries({ queryKey: ["lawsuits"] });
      setDeleteTarget(null);
    } catch {
      setDeleteError("Não foi possível excluir o processo.");
    }
  }

  const forbidden = axios.isAxiosError(error) && error.response?.status === 403;

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-bar-row">
          <TextField
            label="Número do processo"
            placeholder="0000000-00.0000.0.00.0000"
            value={draft.numProcesso}
            onChange={(e) => setDraft((d) => ({ ...d, numProcesso: e.target.value }))}
          />
          <PersonPicker
            label="Cliente"
            value={draft.personId}
            valueLabel={draft.personLabel}
            onChange={(id, option) => setDraft((d) => ({ ...d, personId: id, personLabel: option?.label ?? "" }))}
          />
          <LawyerPicker
            label="Advogado"
            value={draft.lawyerId}
            valueLabel={draft.lawyerLabel}
            onChange={(id, option) => setDraft((d) => ({ ...d, lawyerId: id, lawyerLabel: option?.label ?? "" }))}
          />
          <SelectField
            label="Tribunal"
            placeholder="Todos"
            options={enumOptions(COURT_LABELS)}
            value={draft.court}
            onChange={(e) => setDraft((d) => ({ ...d, court: e.target.value }))}
          />
          <SelectField
            label="Natureza"
            placeholder="Todas"
            options={enumOptions(NATURE_LABELS)}
            value={draft.nature}
            onChange={(e) => setDraft((d) => ({ ...d, nature: e.target.value }))}
          />
          <Button onClick={applyFilters}>Filtrar</Button>
          <Button variant="soft" onClick={clearFilters}>
            Limpar
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ fontSize: 13.5, color: "var(--color-text-faint)" }}>
            <strong style={{ color: "var(--color-text)" }}>{data?.totalElements ?? 0}</strong> processos
          </div>
          <Button onClick={() => navigate("/processos/novo")}>+ Novo processo</Button>
        </div>

        {isLoading && <LoadingState />}
        {isError && forbidden && <ForbiddenState />}
        {isError && !forbidden && <ErrorState label="Não foi possível carregar os processos." />}
        {!isLoading && !isError && rows.length === 0 && <EmptyState label="Nenhum processo encontrado." />}

        {!isLoading && !isError && rows.length > 0 && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Advogado</th>
                  <th>Tribunal</th>
                  <th>Rito</th>
                  <th>Natureza</th>
                  <th>Ação</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{maskNumProcesso(row.numProcesso)}</td>
                    <td>{displayName(personNames.get(row.personId))}</td>
                    <td>{displayName(lawyerNames.get(row.lawyerId))}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{courtLabel(row.court)}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{ritLabel(row.rit)}</td>
                    <td>
                      <Badge>{natureLabel(row.nature)}</Badge>
                    </td>
                    <td>{actionLabel(row.action)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                        <Button variant="ghost" onClick={() => navigate(`/processos/${row.id}`)}>
                          Detalhes
                        </Button>
                        <Button variant="ghost" style={{ color: "var(--color-danger-text)" }} onClick={() => setDeleteTarget(row)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isError && !forbidden && (
          <div style={{ padding: "0 18px 18px" }}>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}

        <Pagination page={data} onPageChange={setPage} />
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir processo"
          message={`Excluir o processo ${maskNumProcesso(deleteTarget.numProcesso)}? Esta ação não pode ser desfeita.${deleteError ? ` ${deleteError}` : ""}`}
          confirmLabel="Excluir"
          danger
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}
