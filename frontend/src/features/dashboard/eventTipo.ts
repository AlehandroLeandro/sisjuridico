import type { EventoTipo } from "./api";

/**
 * tipo -> label/color map. Purely presentational and frontend-only per the
 * frontend-dashboard spec's Assumptions table: Evento.tipo has no stored
 * color server-side, so this mapping lives here rather than in
 * shared/enums/labels.ts (which covers only backend-rendered enum labels).
 */
export const EVENTO_TIPO_LABELS: Record<EventoTipo, string> = {
  AUDIENCIA: "Audiência",
  PRAZO_PROCESSUAL: "Prazo processual",
  VENCIMENTO: "Vencimento",
  RENOVACAO: "Renovação",
  AVISO_PRAZO: "Aviso de prazo",
};

export const EVENTO_TIPO_COLORS: Record<EventoTipo, string> = {
  AUDIENCIA: "#4da75f",
  PRAZO_PROCESSUAL: "#2f7d43",
  VENCIMENTO: "#dc2626",
  RENOVACAO: "#7fae2f",
  AVISO_PRAZO: "#a4c93f",
};

export const EVENTO_TIPO_LEGEND: EventoTipo[] = [
  "AUDIENCIA",
  "PRAZO_PROCESSUAL",
  "VENCIMENTO",
  "RENOVACAO",
  "AVISO_PRAZO",
];
