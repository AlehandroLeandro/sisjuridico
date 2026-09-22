import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "../../shared/ui/States";
import { Modal, ConfirmDialog } from "../../shared/ui/Modal";
import { Button } from "../../shared/ui/Button";
import { TextField, SelectField, TextAreaField } from "../../shared/ui/Field";
import { EntityPicker, type PickerOption } from "../../shared/pickers/EntityPicker";
import { natureLabel, typeContractLabel } from "../../shared/enums/labels";
import {
  getDashboard,
  listEventos,
  createEvento,
  updateEvento,
  deleteEvento,
  getContractRef,
  getLawsuitRef,
  contractRefLabel,
  lawsuitRefLabel,
  searchContractRefs,
  searchLawsuitRefs,
  type ContratoVencendo,
  type DashboardResponse,
  type DocumentoRecente,
  type Evento,
  type EventoInput,
  type EventoTipo,
  type NaturezaCount,
} from "./api";
import { EVENTO_TIPO_COLORS, EVENTO_TIPO_LABELS, EVENTO_TIPO_LEGEND } from "./eventTipo";
import "./dashboard.css";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

interface CalendarCell {
  key: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

interface MonthGrid {
  label: string;
  from: string;
  to: string;
  cells: CalendarCell[];
}

/** Ports the mockup's diasCalendario generation logic (dc-script.js ~L138-159): pad to complete weeks. */
function buildMonthGrid(monthOffset: number): MonthGrid {
  const today = new Date();
  const todayKey = toISODate(today);
  const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const start = new Date(year, month, 1 - firstWeekday);

  const cells: CalendarCell[] = Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = toISODate(date);
    return { key, day: date.getDate(), inMonth: date.getMonth() === month, isToday: key === todayKey };
  });

  return {
    label: `${MONTHS[month].charAt(0).toUpperCase()}${MONTHS[month].slice(1)} de ${year}`,
    from: cells[0].key,
    to: cells[cells.length - 1].key,
    cells,
  };
}

interface SelectedEvents {
  dateLabel: string;
  events: Evento[];
}

interface FormState {
  mode: "create" | "edit";
  initial?: Evento;
  prefilledDate?: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<SelectedEvents | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [deletingEvento, setDeletingEvento] = useState<Evento | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const dashboardQuery = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  const forbidden = isAxiosError(dashboardQuery.error) && dashboardQuery.error.response?.status === 403;

  const grid = useMemo(() => buildMonthGrid(monthOffset), [monthOffset]);

  // Gated on the dashboard call having succeeded (DASH-37/38): never fire /eventos
  // once /dashboard is known to be a 403 for this session.
  const eventosQuery = useQuery({
    queryKey: ["eventos", grid.from, grid.to],
    queryFn: () => listEventos({ from: grid.from, to: grid.to, size: 100 }),
    enabled: dashboardQuery.isSuccess,
  });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Evento[]>();
    for (const e of eventosQuery.data?.content ?? []) {
      const list = map.get(e.data) ?? [];
      list.push(e);
      map.set(e.data, list);
    }
    return map;
  }, [eventosQuery.data]);

  function openRecord(e: Evento) {
    if (e.contractId != null) navigate(`/contratos/${e.contractId}`);
    else if (e.lawsuitId != null) navigate(`/processos/${e.lawsuitId}`);
  }

  // A create/edit/delete always touches the same two reads: the calendar's
  // current range and the dashboard's proximosEventos (DASH-27/32/34).
  function refreshEventos() {
    queryClient.invalidateQueries({ queryKey: ["eventos"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  // DASH-35: an edit/delete that 404s means someone else already removed the
  // event — drop any stale modal state and refetch instead of showing it.
  function handleGone() {
    refreshEventos();
    setFormState(null);
    setSelected(null);
    setDeletingEvento(null);
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEvento(id),
    onSuccess: () => {
      refreshEventos();
      setDeletingEvento(null);
      setSelected(null);
    },
    onError: (err) => {
      const notFound = isAxiosError(err) && err.response?.status === 404;
      setDeletingEvento(null);
      setDeleteError(notFound ? "Este evento já foi removido." : "Não foi possível excluir o evento. Tente novamente.");
      if (notFound) handleGone();
    },
  });

  if (forbidden) {
    return (
      <ForbiddenState label="Você não tem permissão para acessar o painel. Volte para a área liberada para o seu usuário." />
    );
  }

  if (dashboardQuery.isLoading) {
    return <LoadingState label="Carregando painel..." />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div>
        <ErrorState label="Não foi possível carregar o painel." />
        <div style={{ textAlign: "center" }}>
          <button type="button" className="link-button" onClick={() => dashboardQuery.refetch()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <div>
      {deleteError && (
        <div className="state-message error" style={{ textAlign: "left", padding: "0 0 12px" }}>
          {deleteError}
        </div>
      )}

      <KpiSection dashboard={dashboard} />

      <div className="dashboard-panels" style={{ marginBottom: 16 }}>
        <ContratosVencendoPanel items={dashboard.contratosVencendo} onVerTodos={() => navigate("/contratos")} />
        <DocumentosRecentesPanel items={dashboard.documentosRecentes} onVerTodos={() => navigate("/documentos")} />
        <NaturezaPanel items={dashboard.distribuicaoNatureza} />
      </div>

      <div className="dashboard-calendar-row">
        <CalendarCard
          grid={grid}
          eventsByDate={eventsByDate}
          isLoading={eventosQuery.isLoading}
          isError={eventosQuery.isError}
          onPrev={() => setMonthOffset((v) => v - 1)}
          onNext={() => setMonthOffset((v) => v + 1)}
          onToday={() => setMonthOffset(0)}
          onOpenDay={(dateKey, events) => setSelected({ dateLabel: formatDateLong(dateKey), events })}
          onNewEvent={() => setFormState({ mode: "create" })}
          onCreateForDate={(dateKey) => setFormState({ mode: "create", prefilledDate: dateKey })}
          onRetry={() => eventosQuery.refetch()}
        />
        <AgendaCard
          items={dashboard.proximosEventos}
          onOpen={(dateLabel, events) => setSelected({ dateLabel, events })}
        />
      </div>

      {selected && (
        <EventoDetailModal
          dateLabel={selected.dateLabel}
          events={selected.events}
          onClose={() => setSelected(null)}
          onOpenRecord={openRecord}
          onEdit={(e) => {
            setSelected(null);
            setFormState({ mode: "edit", initial: e });
          }}
          onDelete={(e) => {
            setDeleteError(null);
            setDeletingEvento(e);
          }}
        />
      )}

      {formState && (
        <EventoFormModal
          mode={formState.mode}
          initial={formState.initial}
          prefilledDate={formState.prefilledDate}
          onClose={() => setFormState(null)}
          onSaved={() => {
            refreshEventos();
            setFormState(null);
          }}
          onGone={handleGone}
        />
      )}

      {deletingEvento && (
        <ConfirmDialog
          title="Excluir evento"
          message={`Excluir "${deletingEvento.titulo}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => deleteMutation.mutate(deletingEvento.id)}
          onCancel={() => setDeletingEvento(null)}
        />
      )}
    </div>
  );
}

function KpiSection({ dashboard }: { dashboard: DashboardResponse }) {
  const { processosAtivos, contratosVigentes, contratosAVencer30d } = dashboard.kpis;
  return (
    <div className="dashboard-kpis">
      <KpiCard label="Processos ativos" value={processosAtivos.valor} delta={processosAtivos.deltaMes} note="neste mês" />
      <KpiCard label="Contratos vigentes" value={contratosVigentes.valor} delta={contratosVigentes.deltaMes} note="assinados" />
      <KpiCard
        label="Contratos a vencer em 30 dias"
        value={contratosAVencer30d.valor}
        note={contratosAVencer30d.valor > 0 ? "requerem atenção" : "nenhum no período"}
        warning
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  note,
  warning,
}: {
  label: string;
  value: number;
  delta?: number;
  note: string;
  warning?: boolean;
}) {
  const isWarning = warning || (delta !== undefined && delta < 0);
  const pillLabel = delta !== undefined ? `${delta >= 0 ? "+" : ""}${delta}` : "Atenção";
  return (
    <div className="card kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: isWarning ? "var(--color-danger-text)" : "var(--color-text)" }}>
        {value}
      </div>
      <div className="kpi-pill-row">
        <span
          className="kpi-pill"
          style={{
            background: isWarning ? "var(--color-danger-bg)" : "var(--color-success-bg)",
            color: isWarning ? "var(--color-danger-text)" : "var(--color-success-text)",
          }}
        >
          {pillLabel}
        </span>
        <span className="kpi-pill-note">{note}</span>
      </div>
    </div>
  );
}

function ContratosVencendoPanel({ items, onVerTodos }: { items: ContratoVencendo[]; onVerTodos: () => void }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Contratos próximos do vencimento</div>
        <button type="button" className="link-button" onClick={onVerTodos}>Ver todos</button>
      </div>
      {items.length === 0 ? (
        <EmptyState label="Nenhum contrato a vencer nos próximos 30 dias." />
      ) : (
        items.map((c) => {
          const color = c.diasRestantes <= 15 ? "var(--color-danger-text)" : "var(--color-warning-text)";
          return (
            <div key={c.contractId} className="panel-row">
              <div className="panel-row-accent" style={{ background: color }} />
              <div className="panel-row-main">
                <div className="panel-row-title">{c.contratante}</div>
                <div className="panel-row-sub">{typeContractLabel(c.tipo)} · {currency.format(c.valor)}</div>
              </div>
              <div className="panel-row-end">
                <div className="panel-row-title" style={{ color }}>{c.diasRestantes} dias</div>
                <div className="panel-row-sub">{formatDateBR(c.endDate)}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function linkedEntityLabel(d: DocumentoRecente): string {
  if (d.contractId != null) return `Contrato #${d.contractId}`;
  if (d.lawsuitId != null) return `Processo #${d.lawsuitId}`;
  return "Sem vínculo";
}

function DocumentosRecentesPanel({ items, onVerTodos }: { items: DocumentoRecente[]; onVerTodos: () => void }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Documentos recentes</div>
        <button type="button" className="link-button" onClick={onVerTodos}>Ver todos</button>
      </div>
      {items.length === 0 ? (
        <EmptyState label="Nenhum documento recente." />
      ) : (
        items.map((d) => (
          <div key={d.documentId} className="panel-row">
            <div className="panel-doc-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={1.8} strokeLinejoin="round">
                <path d="M6 2h8l4 4v16H6z" />
                <path d="M14 2v4h4" />
              </svg>
            </div>
            <div className="panel-row-main">
              <div className="panel-row-title">{d.fileName}</div>
              <div className="panel-row-sub">{linkedEntityLabel(d)}</div>
            </div>
            <div className="panel-row-sub" style={{ whiteSpace: "nowrap" }}>{formatDateBR(d.createdAt)}</div>
          </div>
        ))
      )}
    </div>
  );
}

const NATURE_CHART_LIMIT = 5;

/**
 * Zero-count natures never compete for a slot; the remaining ones rank by
 * count descending (ties broken alphabetically by label, matching the app's
 * alphabetization rule), top 5 shown individually, the rest summed into a
 * single static "Outros" row — never shown if 5 or fewer natures qualify.
 * Per UXFIX-01..05.
 */
function rankNatureChart(items: NaturezaCount[]): { key: string; label: string; count: number }[] {
  const ranked = items
    .filter((n) => n.count > 0)
    .map((n) => ({ key: n.nature, label: natureLabel(n.nature), count: n.count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));

  if (ranked.length <= NATURE_CHART_LIMIT) return ranked;

  const top = ranked.slice(0, NATURE_CHART_LIMIT);
  const rest = ranked.slice(NATURE_CHART_LIMIT);
  const outros = { key: "__outros__", label: "Outros", count: rest.reduce((sum, n) => sum + n.count, 0) };
  return [...top, outros];
}

function NaturezaPanel({ items }: { items: NaturezaCount[] }) {
  const chartItems = rankNatureChart(items);
  const max = Math.max(1, ...chartItems.map((n) => n.count));
  const total = items.reduce((sum, n) => sum + n.count, 0);
  return (
    <div className="nature-panel">
      <div className="nature-panel-title">Distribuição por natureza</div>
      {chartItems.length === 0 ? (
        <EmptyState label="Nenhum processo cadastrado." />
      ) : (
        chartItems.map((n) => (
          <div key={n.key} className="nature-row">
            <div className="nature-row-labels">
              <span>{n.label}</span>
              <span className="nature-row-count">{n.count}</span>
            </div>
            <div className="nature-bar-track">
              <div className="nature-bar-fill" style={{ width: `${(n.count / max) * 100}%`, background: "var(--color-accent)" }} />
            </div>
          </div>
        ))
      )}
      <div className="nature-panel-total" />
      <div className="nature-panel-footer">
        <span>Total de processos ativos</span>
        <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>{total}</span>
      </div>
    </div>
  );
}

function CalendarCard({
  grid,
  eventsByDate,
  isLoading,
  isError,
  onPrev,
  onNext,
  onToday,
  onOpenDay,
  onNewEvent,
  onCreateForDate,
  onRetry,
}: {
  grid: MonthGrid;
  eventsByDate: Map<string, Evento[]>;
  isLoading: boolean;
  isError: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenDay: (dateKey: string, events: Evento[]) => void;
  onNewEvent: () => void;
  onCreateForDate: (dateKey: string) => void;
  onRetry: () => void;
}) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Agenda de vencimentos e renovações</div>
          <div className="panel-row-sub">{grid.label}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={onNewEvent}>+ Novo evento</Button>
          <div className="calendar-nav">
            <button type="button" className="calendar-nav-btn" onClick={onPrev} aria-label="Mês anterior">‹</button>
            <button type="button" className="calendar-nav-today" onClick={onToday}>Hoje</button>
            <button type="button" className="calendar-nav-btn" onClick={onNext} aria-label="Próximo mês">›</button>
          </div>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-weekday">{w}</div>
        ))}
      </div>

      {isError ? (
        <div>
          <ErrorState label="Não foi possível carregar os eventos deste mês." />
          <div style={{ textAlign: "center", paddingBottom: 14 }}>
            <button type="button" className="link-button" onClick={onRetry}>Tentar novamente</button>
          </div>
        </div>
      ) : isLoading ? (
        <LoadingState label="Carregando eventos..." />
      ) : (
        <div className="calendar-grid">
          {grid.cells.map((cell) => {
            const events = cell.inMonth ? (eventsByDate.get(cell.key) ?? []) : [];
            // DASH-13/14/39: every in-month cell is clickable — a populated day opens
            // the detail modal, an empty one opens the create form pre-filled to that date.
            const clickable = cell.inMonth;
            const activate = () => (events.length > 0 ? onOpenDay(cell.key, events) : onCreateForDate(cell.key));
            return (
              <div
                key={cell.key}
                className={[
                  "calendar-cell",
                  cell.inMonth ? "" : "out-of-month",
                  clickable ? "clickable" : "",
                ].filter(Boolean).join(" ")}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? activate : undefined}
                onKeyDown={
                  clickable
                    ? (ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          activate();
                        }
                      }
                    : undefined
                }
              >
                <div className={["calendar-cell-num", cell.isToday ? "today" : "", cell.inMonth ? "" : "out-of-month"].filter(Boolean).join(" ")}>
                  {cell.day}
                </div>
                {events.map((e) => (
                  <div key={e.id} className="calendar-event-marker" style={{ borderLeftColor: EVENTO_TIPO_COLORS[e.tipo] }}>
                    <span>{e.titulo}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="calendar-legend">
        {EVENTO_TIPO_LEGEND.map((tipo) => (
          <div key={tipo} className="calendar-legend-item">
            <span className="calendar-legend-swatch" style={{ background: EVENTO_TIPO_COLORS[tipo] }} />
            {EVENTO_TIPO_LABELS[tipo]}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgendaCard({
  items,
  onOpen,
}: {
  items: Evento[];
  onOpen: (dateLabel: string, events: Evento[]) => void;
}) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Próximos compromissos</div>
      </div>
      {items.length === 0 ? (
        <EmptyState label="Nenhum compromisso agendado." />
      ) : (
        items.map((e) => {
          const [, m, d] = e.data.split("-");
          const open = () => onOpen(formatDateLong(e.data), [e]);
          return (
            <div
              key={e.id}
              className="agenda-row"
              role="button"
              tabIndex={0}
              onClick={open}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  open();
                }
              }}
            >
              <div className="panel-row-accent" style={{ background: EVENTO_TIPO_COLORS[e.tipo] }} />
              <div className="agenda-date">
                <div className="agenda-date-day">{d}</div>
                <div className="agenda-date-month">{MONTHS[Number(m) - 1].slice(0, 3)}</div>
              </div>
              <div className="panel-row-main">
                <div className="agenda-body-title">{e.titulo}</div>
                <div className="agenda-body-detail">{[e.responsavel, e.hora].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/** Resolves an event's linked Contract/Lawsuit id to its real display label (DASH-19/24's "Vinculado a"). */
function useLinkedLabel(contractId: number | null, lawsuitId: number | null): string | undefined {
  const contractQuery = useQuery({
    queryKey: ["contract-ref", contractId],
    queryFn: () => getContractRef(contractId as number),
    enabled: contractId !== null,
    staleTime: 5 * 60_000,
  });
  const lawsuitQuery = useQuery({
    queryKey: ["lawsuit-ref", lawsuitId],
    queryFn: () => getLawsuitRef(lawsuitId as number),
    enabled: lawsuitId !== null,
    staleTime: 5 * 60_000,
  });
  if (contractId !== null) return contractQuery.data ? contractRefLabel(contractQuery.data) : undefined;
  if (lawsuitId !== null) return lawsuitQuery.data ? lawsuitRefLabel(lawsuitQuery.data) : undefined;
  return undefined;
}

function EventoDetailModal({
  dateLabel,
  events,
  onClose,
  onOpenRecord,
  onEdit,
  onDelete,
}: {
  dateLabel: string;
  events: Evento[];
  onClose: () => void;
  onOpenRecord: (e: Evento) => void;
  onEdit: (e: Evento) => void;
  onDelete: (e: Evento) => void;
}) {
  return (
    <Modal title={dateLabel} onClose={onClose} width={520}>
      {events.map((e) => (
        <EventoDetailRow key={e.id} evento={e} onOpenRecord={onOpenRecord} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Modal>
  );
}

function EventoDetailRow({
  evento: e,
  onOpenRecord,
  onEdit,
  onDelete,
}: {
  evento: Evento;
  onOpenRecord: (e: Evento) => void;
  onEdit: (e: Evento) => void;
  onDelete: (e: Evento) => void;
}) {
  const hasLink = e.lawsuitId != null || e.contractId != null;
  const linkedLabel = useLinkedLabel(e.contractId, e.lawsuitId);
  const fallbackLabel = e.contractId != null ? `Contrato #${e.contractId}` : e.lawsuitId != null ? `Processo #${e.lawsuitId}` : undefined;
  return (
    <div className="evento-detail" style={{ borderLeftColor: EVENTO_TIPO_COLORS[e.tipo] }}>
      <div className="evento-detail-tipo" style={{ color: EVENTO_TIPO_COLORS[e.tipo] }}>
        {EVENTO_TIPO_LABELS[e.tipo]}
      </div>
      <div className="evento-detail-titulo">{e.titulo}</div>
      {e.hora && <div className="evento-detail-meta">Horário: {e.hora}</div>}
      {e.responsavel && <div className="evento-detail-meta">Responsável: {e.responsavel}</div>}
      {hasLink && <div className="evento-detail-meta">Vinculado a: {linkedLabel ?? fallbackLabel}</div>}
      {e.nota && <div className="evento-detail-nota">{e.nota}</div>}
      <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap" }}>
        {hasLink && (
          <button type="button" className="link-button" onClick={() => onOpenRecord(e)}>
            Abrir registro
          </button>
        )}
        <button type="button" className="link-button" onClick={() => onEdit(e)}>
          Editar
        </button>
        <button type="button" className="link-button" style={{ color: "var(--color-danger-text)" }} onClick={() => onDelete(e)}>
          Excluir
        </button>
      </div>
    </div>
  );
}

type VinculoType = "nenhum" | "processo" | "contrato";

function VinculoField({
  type,
  onTypeChange,
  id,
  idLabel,
  onIdChange,
  disabled,
}: {
  type: VinculoType;
  onTypeChange: (t: VinculoType) => void;
  id: number | null;
  idLabel?: string;
  onIdChange: (id: number | null, option: PickerOption | null) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="field">
        <label>Vínculo</label>
        <div style={{ display: "flex", gap: 16, padding: "9px 0" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 400 }}>
            <input type="radio" checked={type === "nenhum"} onChange={() => onTypeChange("nenhum")} disabled={disabled} />
            Nenhum
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 400 }}>
            <input type="radio" checked={type === "processo"} onChange={() => onTypeChange("processo")} disabled={disabled} />
            Processo
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 400 }}>
            <input type="radio" checked={type === "contrato"} onChange={() => onTypeChange("contrato")} disabled={disabled} />
            Contrato
          </label>
        </div>
      </div>
      {type === "processo" && (
        <EntityPicker label="Processo" placeholder="Buscar por número do processo" value={id} valueLabel={idLabel} onChange={onIdChange} search={searchLawsuitRefs} disabled={disabled} />
      )}
      {type === "contrato" && (
        <EntityPicker label="Contrato" placeholder="Buscar por número do contrato" value={id} valueLabel={idLabel} onChange={onIdChange} search={searchContractRefs} disabled={disabled} />
      )}
    </div>
  );
}

function eventoErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 404) return "Este evento já foi removido.";
    if (!error.response) return "Falha de conexão. Verifique sua internet e tente novamente.";
    const data = error.response.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return "Não foi possível salvar o evento. Tente novamente.";
}

const TIPO_OPTIONS = EVENTO_TIPO_LEGEND.map((t) => ({ value: t, label: EVENTO_TIPO_LABELS[t] }));

function EventoFormModal({
  mode,
  initial,
  prefilledDate,
  onClose,
  onSaved,
  onGone,
}: {
  mode: "create" | "edit";
  initial?: Evento;
  prefilledDate?: string;
  onClose: () => void;
  onSaved: () => void;
  onGone: () => void;
}) {
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [tipo, setTipo] = useState<EventoTipo | "">(initial?.tipo ?? "");
  const [data, setData] = useState(initial?.data ?? prefilledDate ?? "");
  const [hora, setHora] = useState(initial?.hora ?? "");
  const [responsavel, setResponsavel] = useState(initial?.responsavel ?? "");
  const [nota, setNota] = useState(initial?.nota ?? "");
  const [vinculoType, setVinculoType] = useState<VinculoType>(
    initial?.contractId != null ? "contrato" : initial?.lawsuitId != null ? "processo" : "nenhum",
  );
  const [vinculoId, setVinculoId] = useState<number | null>(initial?.contractId ?? initial?.lawsuitId ?? null);
  const [vinculoLabel, setVinculoLabel] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  // Resolves the display label for a link the event already had when opening the edit form.
  const initialVinculoLabel = useLinkedLabel(initial?.contractId ?? null, initial?.lawsuitId ?? null);

  const mutation = useMutation({
    mutationFn: (input: EventoInput) => (mode === "create" ? createEvento(input) : updateEvento(initial!.id, input)),
    onSuccess: onSaved,
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 404) onGone();
    },
  });

  function handleVinculoTypeChange(t: VinculoType) {
    setVinculoType(t);
    setVinculoId(null);
    setVinculoLabel(undefined);
  }

  function handleSubmit() {
    setFormError(null);
    const trimmedTitulo = titulo.trim();
    const trimmedNota = nota.trim();
    if (!trimmedTitulo) return setFormError("Informe o título.");
    if (trimmedTitulo.length > 150) return setFormError("O título deve ter no máximo 150 caracteres.");
    if (!tipo) return setFormError("Selecione o tipo do evento.");
    if (!data) return setFormError("Informe a data.");
    if (trimmedNota.length > 1000) return setFormError("A nota deve ter no máximo 1000 caracteres.");

    mutation.mutate({
      titulo: trimmedTitulo,
      tipo,
      data,
      hora: hora || null,
      responsavel: responsavel.trim() || null,
      nota: trimmedNota || null,
      lawsuitId: vinculoType === "processo" ? vinculoId : null,
      contractId: vinculoType === "contrato" ? vinculoId : null,
    });
  }

  const mutationError = mutation.isError ? eventoErrorMessage(mutation.error) : null;

  return (
    <Modal
      title={mode === "create" ? "Novo evento" : "Editar evento"}
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
      <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={150} disabled={mutation.isPending} />
      <SelectField
        label="Tipo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value as EventoTipo)}
        options={TIPO_OPTIONS}
        placeholder="Selecione"
        disabled={mutation.isPending}
      />
      <div className="filter-bar-row" style={{ padding: 0 }}>
        <TextField label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} disabled={mutation.isPending} />
        <TextField label="Hora (opcional)" type="time" value={hora} onChange={(e) => setHora(e.target.value)} disabled={mutation.isPending} />
      </div>
      <TextField label="Responsável (opcional)" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} disabled={mutation.isPending} />
      <TextAreaField label="Nota (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} maxLength={1000} rows={3} disabled={mutation.isPending} />
      <VinculoField
        type={vinculoType}
        onTypeChange={handleVinculoTypeChange}
        id={vinculoId}
        idLabel={vinculoLabel ?? initialVinculoLabel}
        onIdChange={(id, opt) => {
          setVinculoId(id);
          setVinculoLabel(opt?.label);
        }}
        disabled={mutation.isPending}
      />
      {(formError || mutationError) && <div className="error" style={{ marginTop: 8 }}>{formError ?? mutationError}</div>}
    </Modal>
  );
}
