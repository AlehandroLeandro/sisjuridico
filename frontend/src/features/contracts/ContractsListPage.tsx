import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePagedQuery } from "../../shared/hooks/usePagedQuery";
import { PersonPicker } from "../../shared/pickers/PersonPicker";
import { SelectField } from "../../shared/ui/Field";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { Pagination } from "../../shared/ui/Pagination";
import { LoadingState, EmptyState, ErrorState } from "../../shared/ui/States";
import { TYPE_CONTRACT_LABELS, typeContractLabel, enumOptions } from "../../shared/enums/labels";
import { useAuth } from "../auth/AuthContext";
import { listContracts, deriveContractStatus, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_TONE, type ContractFilters } from "./api";
import { PersonName } from "./PersonName";
import { formatCurrency, formatDate } from "./format";

const TABS = [
  { key: "TODOS", label: "Todos" },
  { key: "ATIVOS", label: "Ativos" },
  { key: "A_VENCER", label: "A vencer" },
  { key: "INATIVOS", label: "Inativos" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ContractsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("TODOS");
  const [typeContract, setTypeContract] = useState("");
  const [contractorId, setContractorId] = useState<number | null>(null);
  const [contractorLabel, setContractorLabel] = useState<string | undefined>();
  const [contractedId, setContractedId] = useState<number | null>(null);
  const [contractedLabel, setContractedLabel] = useState<string | undefined>();

  const filters: ContractFilters = {
    active: tab === "ATIVOS" || tab === "A_VENCER" ? true : tab === "INATIVOS" ? false : undefined,
    typeContract: typeContract || undefined,
    contractorId: contractorId ?? undefined,
    contractedId: contractedId ?? undefined,
  };

  const { data, isLoading, isError, setPage } = usePagedQuery(["contracts"], filters, listContracts);

  function changeFilter<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  const rows = tab === "A_VENCER" ? (data?.content ?? []).filter((c) => deriveContractStatus(c) === "A_VENCER") : data?.content ?? [];

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-bar-row">
          <PersonPicker
            label="Contratante"
            value={contractorId}
            valueLabel={contractorLabel}
            onChange={(id, opt) => {
              changeFilter(setContractorId)(id);
              setContractorLabel(opt?.label);
            }}
          />
          <PersonPicker
            label="Contratado"
            value={contractedId}
            valueLabel={contractedLabel}
            onChange={(id, opt) => {
              changeFilter(setContractedId)(id);
              setContractedLabel(opt?.label);
            }}
          />
          <SelectField
            label="Tipo de contrato"
            value={typeContract}
            placeholder="Todos"
            options={enumOptions(TYPE_CONTRACT_LABELS)}
            onChange={(e) => changeFilter(setTypeContract)(e.target.value)}
            fixed
          />
        </div>
      </div>

      <div className="toolbar">
        <div style={{ display: "flex", gap: 6, background: "#fff", border: "1px solid var(--color-border-strong)", padding: 4 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setPage(0);
              }}
              style={{
                padding: "8px 14px",
                border: "none",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                background: tab === t.key ? "var(--color-success-soft-bg)" : "transparent",
                color: tab === t.key ? "var(--color-success-soft-text)" : "var(--color-text-faint)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        {user?.role !== "ACCOUNTING" && (
          <Button onClick={() => navigate("/contratos/novo")}>+ Novo contrato</Button>
        )}
      </div>

      <div className="card table-scroll">
        {isLoading && <LoadingState />}
        {isError && <ErrorState label="Não foi possível carregar os contratos." />}
        {!isLoading && !isError && rows.length === 0 && <EmptyState label="Nenhum contrato encontrado." />}
        {!isLoading && !isError && rows.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Tipo</th>
                <th>Contratante</th>
                <th>Contratado</th>
                <th style={{ textAlign: "right" }}>Valor</th>
                <th>Vigência</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const status = deriveContractStatus(c);
                return (
                  <tr key={c.id}>
                    <td>
                      <Badge tone={CONTRACT_STATUS_TONE[status]}>{CONTRACT_STATUS_LABELS[status]}</Badge>
                    </td>
                    <td>{typeContractLabel(c.typeContract)}</td>
                    <td style={{ fontWeight: 600 }}>
                      <PersonName id={c.contractorId} />
                    </td>
                    <td>
                      <PersonName id={c.contractedId} />
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{formatCurrency(c.value)}</td>
                    <td style={{ whiteSpace: "nowrap", color: "var(--color-text-muted)", fontSize: 12.5 }}>{formatDate(c.endDate)}</td>
                    <td style={{ textAlign: "right" }}>
                      <Button variant="ghost" onClick={() => navigate(`/contratos/${c.id}`)}>
                        Abrir
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {tab === "A_VENCER" && (
          <div style={{ padding: "0 18px 13px", fontSize: 11.5, color: "var(--color-text-muted)" }}>
            Contagem aproximada — baseada nos contratos ativos, filtrados localmente por vigência.
          </div>
        )}
        <Pagination page={data} onPageChange={setPage} />
      </div>
    </div>
  );
}
