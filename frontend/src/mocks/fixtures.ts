// Seed data for the MSW mock backend. Field shapes mirror the real DTOs
// (see backend catalog in .specs/STATE.md / the three backend specs), using
// real enum literals — never the mockup's fictional short codes.

export interface MockPerson {
  id: number;
  name: string;
  cpfCnpj: string | null;
}

export interface MockLawyer {
  id: number;
  name: string;
  cpfCnpj: string | null;
  oab: string | null;
}

export interface MockLawsuit {
  id: number;
  /** String, not number: a 20-digit CNJ process number exceeds Number.MAX_SAFE_INTEGER and would silently lose precision as a JS number. The backend types it Long, but the frontend must treat it as an opaque numeric string end to end. */
  numProcesso: string;
  personId: number;
  lawyerId: number;
  counterPartPersonId: number;
  counterPartLawyerId: number;
  rit: string;
  court: string;
  initialOrganization: string;
  positionClient: string;
  nature: string;
  action: string;
  valorDaCausa: number | null;
  dataValorCausa: string | null;
  dataInicio: string;
  observacao: string | null;
}

export interface MockContractExtension {
  id: number;
  contractId: number;
  previousEndDate: string;
  newEndDate: string;
  extendedAt: string;
  obs: string | null;
}

export interface MockContract {
  id: number;
  file: string;
  startDate: string;
  endDate: string | null;
  originalEndDate: string | null;
  adviceLeftDays: number | null;
  value: number;
  obs: string | null;
  active: boolean;
  contractorId: number;
  contractedId: number;
  typeContract: string;
}

export interface MockDocument {
  id: number;
  fileName: string;
  contentType: string;
  storagePath: string;
  contractId: number | null;
  lawsuitId: number | null;
  createdAt: string;
}

export interface MockUser {
  id: number;
  name: string;
  userName: string;
  password: string; // mock-only, never returned by list/get handlers
  role: "ADMIN" | "USER" | "ACCOUNTING";
}

export interface MockEvento {
  id: number;
  titulo: string;
  tipo: "AUDIENCIA" | "PRAZO_PROCESSUAL" | "VENCIMENTO" | "RENOVACAO" | "AVISO_PRAZO";
  data: string;
  hora: string | null;
  responsavel: string | null;
  nota: string | null;
  lawsuitId: number | null;
  contractId: number | null;
}

export const people: MockPerson[] = [
  { id: 1, name: "Construtora Vale Verde Ltda.", cpfCnpj: "12345678000190" },
  { id: 2, name: "Nutrimix Alimentos S.A.", cpfCnpj: "23456789000101" },
  { id: 3, name: "Transportes Aurora Ltda.", cpfCnpj: "34567890000112" },
  { id: 4, name: "Beatriz Nogueira Faria", cpfCnpj: "12345678901" },
  { id: 5, name: "Roberto Salles Pinheiro", cpfCnpj: "23456789012" },
];

export const lawyers: MockLawyer[] = [
  { id: 1, name: "Marina Andrade", cpfCnpj: "34567890123", oab: "218440" },
  { id: 2, name: "Camila Rocha Lima", cpfCnpj: "45678901234", oab: "245187" },
  { id: 3, name: "Paulo Menezes", cpfCnpj: "56789012345", oab: "198320" },
  { id: 4, name: "Henrique Tavares", cpfCnpj: "67890123456", oab: "134902" },
];

export const lawsuits: MockLawsuit[] = [
  {
    id: 1, numProcesso: "10123456720258260100", personId: 1, lawyerId: 1, counterPartPersonId: 5, counterPartLawyerId: 4,
    rit: "PROCEDIMENTO_COMUM", court: "JUSTICA_ESTADUAL", initialOrganization: "VARA_CIVEL", positionClient: "AUTOR",
    nature: "DIREITO_CIVIL", action: "ACAO_DE_COBRANCA", valorDaCausa: 185000, dataValorCausa: "2025-08-26",
    dataInicio: "2025-08-26", observacao: null,
  },
  {
    id: 2, numProcesso: "00334218820245020035", personId: 2, lawyerId: 2, counterPartPersonId: 3, counterPartLawyerId: 3,
    rit: "SUMARISSIMO", court: "JUSTICA_DO_TRABALHO", initialOrganization: "VARA_DO_TRABALHO", positionClient: "REU",
    nature: "DIREITO_DO_TRABALHO", action: "ACAO_DE_INDENIZACAO", valorDaCausa: 42000, dataValorCausa: "2024-11-10",
    dataInicio: "2024-11-10", observacao: "Reclamatória trabalhista, testemunhas arroladas.",
  },
  {
    id: 3, numProcesso: "50098872120254036100", personId: 3, lawyerId: 3, counterPartPersonId: 2, counterPartLawyerId: 2,
    rit: "PROCEDIMENTO_COMUM", court: "JUSTICA_FEDERAL", initialOrganization: "VARA_DE_EXECUCOES_FISCAIS", positionClient: "EXECUTADO",
    nature: "DIREITO_TRIBUTARIO", action: "EXECUCAO_FISCAL", valorDaCausa: 96000, dataValorCausa: "2025-05-02",
    dataInicio: "2025-05-02", observacao: null,
  },
  {
    id: 4, numProcesso: "10045120920268260053", personId: 4, lawyerId: 1, counterPartPersonId: 1, counterPartLawyerId: 4,
    rit: "JUIZADO_ESPECIAL", court: "JUIZADO_ESPECIAL_CIVEL", initialOrganization: "JUIZADO_ESPECIAL", positionClient: "AUTOR",
    nature: "CONSUMIDOR", action: "ACAO_DE_INDENIZACAO", valorDaCausa: 15000, dataValorCausa: "2026-01-15",
    dataInicio: "2026-01-15", observacao: null,
  },
  {
    id: 5, numProcesso: "10239984420258260100", personId: 2, lawyerId: 3, counterPartPersonId: 1, counterPartLawyerId: 1,
    rit: "PROCEDIMENTO_COMUM", court: "JUSTICA_ESTADUAL", initialOrganization: "VARA_CIVEL", positionClient: "REU",
    nature: "EMPRESARIAL", action: "ACAO_RESCISORIA", valorDaCausa: 220000, dataValorCausa: "2025-06-20",
    dataInicio: "2025-06-20", observacao: null,
  },
  {
    id: 6, numProcesso: "00412771320255020011", personId: 1, lawyerId: 2, counterPartPersonId: 3, counterPartLawyerId: 3,
    rit: "PROCEDIMENTO_ESPECIAL", court: "JUSTICA_DO_TRABALHO", initialOrganization: "VARA_DO_TRABALHO", positionClient: "REU",
    nature: "DIREITO_DO_TRABALHO", action: "CUMPRIMENTO_DE_SENTENCA", valorDaCausa: 31000, dataValorCausa: "2025-03-14",
    dataInicio: "2025-03-14", observacao: null,
  },
];

export const contracts: MockContract[] = [
  {
    id: 1, file: "CT-2025-0148", startDate: "2025-09-26", endDate: "2026-09-26", originalEndDate: "2026-09-26",
    adviceLeftDays: 30, value: 18500, obs: "Reajuste anual pelo IPCA.", active: true, contractorId: 1, contractedId: 1,
    typeContract: "PRESTACAO_DE_SERVICOS",
  },
  {
    id: 2, file: "CT-2025-0152", startDate: "2025-10-03", endDate: "2026-10-03", originalEndDate: "2026-10-03",
    adviceLeftDays: 30, value: 9200, obs: null, active: true, contractorId: 2, contractedId: 1,
    typeContract: "PRESTACAO_DE_SERVICOS",
  },
  {
    id: 3, file: "CT-2026-0161", startDate: "2025-08-28", endDate: "2026-10-11", originalEndDate: "2026-10-11",
    adviceLeftDays: 30, value: 6400, obs: null, active: true, contractorId: 3, contractedId: 1,
    typeContract: "PRESTACAO_DE_SERVICOS",
  },
  {
    id: 4, file: "CT-2025-0155", startDate: "2025-01-14", endDate: "2026-10-14", originalEndDate: "2026-10-14",
    adviceLeftDays: 15, value: 42000, obs: "Parcela única vinculada ao êxito da ação.", active: true, contractorId: 4, contractedId: 1,
    typeContract: "MANDATO",
  },
  {
    id: 5, file: "CT-2024-0090", startDate: "2024-05-01", endDate: "2025-05-01", originalEndDate: "2025-05-01",
    adviceLeftDays: 30, value: 12000, obs: null, active: false, contractorId: 2, contractedId: 1,
    typeContract: "PRESTACAO_DE_SERVICOS",
  },
  {
    id: 6, file: "CT-2026-0170", startDate: "2026-02-01", endDate: null, originalEndDate: null,
    adviceLeftDays: null, value: 5400, obs: null, active: true, contractorId: 3, contractedId: 1,
    typeContract: "LOCACAO",
  },
];

export const contractExtensions: MockContractExtension[] = [
  {
    id: 1, contractId: 1, previousEndDate: "2026-03-26", newEndDate: "2026-09-26",
    extendedAt: "2026-03-14T00:00:00Z", obs: "Primeiro termo aditivo — reajuste IPCA.",
  },
];

export const documents: MockDocument[] = [
  { id: 1, fileName: "Contrato_CT-2025-0148_assinado.pdf", contentType: "application/pdf", storagePath: "documents/aaa1.pdf", contractId: 1, lawsuitId: null, createdAt: "2025-09-26T09:00:00Z" },
  { id: 2, fileName: "Aditivo_01_reajuste.pdf", contentType: "application/pdf", storagePath: "documents/aaa2.pdf", contractId: 1, lawsuitId: null, createdAt: "2026-03-14T09:00:00Z" },
  { id: 3, fileName: "Peticao_inicial_1012345.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", storagePath: "documents/aaa3.docx", contractId: null, lawsuitId: 1, createdAt: "2026-09-13T17:22:00Z" },
  { id: 4, fileName: "Procuracao_Nutrimix.pdf", contentType: "application/pdf", storagePath: "documents/aaa4.pdf", contractId: 2, lawsuitId: null, createdAt: "2026-09-11T10:00:00Z" },
  { id: 5, fileName: "Sentenca_TRT2_0033421.pdf", contentType: "application/pdf", storagePath: "documents/aaa5.pdf", contractId: null, lawsuitId: 2, createdAt: "2026-09-10T08:30:00Z" },
  { id: 6, fileName: "Comprovante_pagamento_08.jpg", contentType: "image/jpeg", storagePath: "documents/aaa6.jpg", contractId: 1, lawsuitId: null, createdAt: "2026-09-08T14:00:00Z" },
];

export const users: MockUser[] = [
  { id: 1, name: "Marina Andrade", userName: "m.andrade", password: "senhasegura", role: "ADMIN" },
  { id: 2, name: "Camila Rocha Lima", userName: "c.rocha", password: "senhasegura", role: "USER" },
  { id: 3, name: "Equipe Financeiro", userName: "financeiro", password: "senhasegura", role: "ACCOUNTING" },
];

export const eventos: MockEvento[] = [
  { id: 1, titulo: "Audiência de instrução — TRT-2", tipo: "AUDIENCIA", data: "2026-09-18", hora: "14:30", responsavel: "Camila Rocha Lima", nota: "Comparecimento obrigatório das testemunhas. Sala 7, 3º andar.", lawsuitId: 2, contractId: null },
  { id: 2, titulo: "Aviso de vencimento CT-2025-0148", tipo: "AVISO_PRAZO", data: "2026-09-22", hora: "08:00", responsavel: "Disparo automático do sistema", nota: "Configurado para 30 dias antes do vencimento.", lawsuitId: null, contractId: 1 },
  { id: 3, titulo: "Vencimento do contrato CT-2025-0148", tipo: "VENCIMENTO", data: "2026-09-26", hora: null, responsavel: "Marina Andrade", nota: "Sem termo aditivo novo registrado até o momento.", lawsuitId: null, contractId: 1 },
  { id: 4, titulo: "Assinatura do aditivo de renovação", tipo: "RENOVACAO", data: "2026-09-26", hora: "11:00", responsavel: "Marina Andrade", nota: "Minuta aguardando revisão do contratante.", lawsuitId: null, contractId: 1 },
  { id: 5, titulo: "Prazo final para contestação", tipo: "PRAZO_PROCESSUAL", data: "2026-09-29", hora: "23:59", responsavel: "Marina Andrade", nota: "Prazo fatal.", lawsuitId: 4, contractId: null },
  { id: 6, titulo: "Vencimento da consultoria tributária", tipo: "VENCIMENTO", data: "2026-10-03", hora: null, responsavel: "Paulo Menezes", nota: "Renovar até 28/09 para manter continuidade.", lawsuitId: null, contractId: 2 },
  { id: 7, titulo: "Vencimento da assessoria trabalhista", tipo: "VENCIMENTO", data: "2026-10-11", hora: null, responsavel: "Camila Rocha Lima", nota: "Cliente sinalizou intenção de renovar.", lawsuitId: null, contractId: 3 },
];
