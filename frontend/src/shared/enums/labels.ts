/**
 * Display-label dictionaries for backend enums. The backend returns/accepts
 * only the long, uppercase, underscore-separated literal (source of truth:
 * src/main/java/sisjuridico/carbocat/enums/*.java) — these maps exist purely
 * for rendering short PT-BR labels client-side (per LAWS-01/CONT/PEOP
 * Assumptions: no backend endpoint provides display strings).
 *
 * humanize() is the fallback for any value that reaches the UI without an
 * entry here (e.g. a new enum literal added on the backend before this map
 * is updated) so the UI never renders a blank or throws.
 */

export function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function withFallback(map: Record<string, string>) {
  return (value: string) => map[value] ?? humanize(value);
}

export const COURT_LABELS: Record<string, string> = {
  STF: "STF",
  STJ: "STJ",
  TST: "TST",
  TSE: "TSE",
  STM: "STM",
  JUSTICA_ESTADUAL: "Justiça Estadual",
  JUSTICA_FEDERAL: "Justiça Federal",
  JUSTICA_DO_TRABALHO: "Justiça do Trabalho",
  JUSTICA_ELEITORAL: "Justiça Eleitoral",
  JUSTICA_MILITAR_ESTADUAL: "Justiça Militar Estadual",
  JUSTICA_MILITAR_DA_UNIAO: "Justiça Militar da União",
  JUIZADO_ESPECIAL_CIVEL: "Juizado Especial Cível",
  JUIZADO_ESPECIAL_CRIMINAL: "Juizado Especial Criminal",
  JUIZADO_ESPECIAL_FEDERAL: "Juizado Especial Federal",
  JUIZADO_ESPECIAL_DA_FAZENDA_PUBLICA: "Juizado Especial da Fazenda Pública",
  TURMA_RECURSAL: "Turma Recursal",
  TURMA_REGIONAL_DE_UNIFORMIZACAO: "Turma Regional de Uniformização",
  TURMA_NACIONAL_DE_UNIFORMIZACAO: "Turma Nacional de Uniformização",
  CNJ: "CNJ",
};
export const courtLabel = withFallback(COURT_LABELS);

export const NATURE_LABELS: Record<string, string> = {
  ADMINISTRATIVA: "Administrativa",
  AMBIENTAL: "Ambiental",
  DIREITO_CIVIL: "Cível",
  CONSUMIDOR: "Consumidor",
  CONTRATUAL: "Contratual",
  CRIMINAL: "Criminal",
  DIREITO_DE_FAMILIA: "Família",
  DIREITO_DO_TRABALHO: "Trabalhista",
  DIREITO_ELEITORAL: "Eleitoral",
  DIREITO_PREVIDENCIARIO: "Previdenciário",
  DIREITO_TRIBUTARIO: "Tributária",
  EMPRESARIAL: "Empresarial",
  FAZENDA_PUBLICA: "Fazenda Pública",
  IMOBILIARIA: "Imobiliária",
  INFANCIA_E_JUVENTUDE: "Infância e Juventude",
  MILITAR: "Militar",
  SUCESSOES: "Sucessões",
};
export const natureLabel = withFallback(NATURE_LABELS);

export const ACTION_LABELS: Record<string, string> = {
  ACAO_CIVIL_PUBLICA: "Ação Civil Pública",
  ACAO_CONSIGNATORIA: "Ação Consignatória",
  ACAO_DE_ALIMENTOS: "Ação de Alimentos",
  ACAO_DE_COBRANCA: "Cobrança",
  ACAO_DE_EXECUCAO: "Execução",
  ACAO_DE_EXIGIR_CONTAS: "Exigir Contas",
  ACAO_DE_INDENIZACAO: "Indenizatória",
  ACAO_DE_INVENTARIO: "Inventário",
  ACAO_DE_OBRIGACAO_DE_FAZER: "Obrigação de Fazer",
  ACAO_DE_REINTEGRACAO_DE_POSSE: "Reintegração de Posse",
  ACAO_DE_USUCAPIAO: "Usucapião",
  ACAO_DECLARATORIA: "Declaratória",
  ACAO_MONITORIA: "Monitória",
  ACAO_POPULAR: "Ação Popular",
  ACAO_RESCISORIA: "Rescisão contratual",
  BUSCA_E_APREENSAO: "Busca e Apreensão",
  CUMPRIMENTO_DE_SENTENCA: "Cumprimento de Sentença",
  DIVORCIO_LITIGIOSO: "Divórcio Litigioso",
  EMBARGOS_A_EXECUCAO: "Embargos à Execução",
  EMBARGOS_DE_TERCEIRO: "Embargos de Terceiro",
  EXECUCAO_DE_TITULO_EXTRAJUDICIAL: "Execução de Título Extrajudicial",
  EXECUCAO_FISCAL: "Execução Fiscal",
  HABEAS_CORPUS: "Habeas Corpus",
  MANDADO_DE_INJUNCAO: "Mandado de Injunção",
  MANDADO_DE_SEGURANCA: "Mandado de Segurança",
};
export const actionLabel = withFallback(ACTION_LABELS);

export const INITIAL_ORGANIZATION_LABELS: Record<string, string> = {
  PRIMEIRO_GRAU: "1º Grau",
  SEGUNDO_GRAU: "2º Grau",
  TRIBUNAL_SUPERIOR: "Tribunal Superior",
  JUIZADO_ESPECIAL: "Juizado Especial",
  TURMA_RECURSAL: "Turma Recursal",
  TURMA_REGIONAL_DE_UNIFORMIZACAO: "Turma Regional de Uniformização",
  TURMA_NACIONAL_DE_UNIFORMIZACAO: "Turma Nacional de Uniformização",
  VARA_CIVEL: "Vara Cível",
  VARA_CRIMINAL: "Vara Criminal",
  VARA_DE_FAMILIA: "Vara de Família",
  VARA_DA_INFANCIA_E_JUVENTUDE: "Vara da Infância e Juventude",
  VARA_DA_FAZENDA_PUBLICA: "Vara da Fazenda Pública",
  VARA_DE_EXECUCOES_FISCAIS: "Vara de Execuções Fiscais",
  VARA_DE_EXECUCOES_PENAIS: "Vara de Execuções Penais",
  VARA_DO_TRABALHO: "Vara do Trabalho",
  ZONA_ELEITORAL: "Zona Eleitoral",
  AUDITORIA_MILITAR: "Auditoria Militar",
  COMARCA: "Comarca",
  FORO: "Foro",
  SECAO_JUDICIARIA: "Seção Judiciária",
  SUBSECAO_JUDICIARIA: "Subseção Judiciária",
};
export const initialOrganizationLabel = withFallback(INITIAL_ORGANIZATION_LABELS);

export const POSITION_CLIENT_LABELS: Record<string, string> = {
  AUTOR: "Autor",
  REU: "Réu",
  REQUERENTE: "Requerente",
  REQUERIDO: "Requerido",
  EXEQUENTE: "Exequente",
  EXECUTADO: "Executado",
  IMPETRANTE: "Impetrante",
  IMPETRADO: "Impetrado",
  APELANTE: "Apelante",
  APELADO: "Apelado",
  AGRAVANTE: "Agravante",
  AGRAVADO: "Agravado",
  EMBARGANTE: "Embargante",
  EMBARGADO: "Embargado",
  RECORRENTE: "Recorrente",
  RECORRIDO: "Recorrido",
  RECLAMANTE: "Reclamante",
  RECLAMADO: "Reclamado",
  CREDOR: "Credor",
  DEVEDOR: "Devedor",
  INVENTARIANTE: "Inventariante",
  HERDEIRO: "Herdeiro",
  TERCEIRO_INTERESSADO: "Terceiro Interessado",
  ASSISTENTE: "Assistente",
  LITISCONSORTE: "Litisconsorte",
  AMICUS_CURIAE: "Amicus Curiae",
};
export const positionClientLabel = withFallback(POSITION_CLIENT_LABELS);

export const RIT_LABELS: Record<string, string> = {
  PROCEDIMENTO_COMUM: "Procedimento Comum",
  PROCEDIMENTO_ESPECIAL: "Procedimento Especial",
  JUIZADO_ESPECIAL: "Juizado Especial",
  SUMARIO: "Sumário",
  SUMARISSIMO: "Sumaríssimo",
  EXECUCAO: "Execução",
  CUMPRIMENTO_DE_SENTENCA: "Cumprimento de Sentença",
  TUTELA_PROVISORIA: "Tutela Provisória",
  PROCEDIMENTO_MONITORIO: "Procedimento Monitório",
  PROCEDIMENTO_DE_JURISDICAO_VOLUNTARIA: "Jurisdição Voluntária",
  PROCEDIMENTO_DE_INVENTARIO_E_PARTILHA: "Inventário e Partilha",
  PROCEDIMENTO_DE_ACOES_DE_FAMILIA: "Ações de Família",
  PROCEDIMENTO_DE_ACOES_POSSESSORIAS: "Ações Possessórias",
  PROCEDIMENTO_DE_CONSIGNACAO_EM_PAGAMENTO: "Consignação em Pagamento",
  PROCEDIMENTO_DE_EXIGIR_CONTAS: "Exigir Contas",
  PROCEDIMENTO_DE_EMBARGOS_DE_TERCEIRO: "Embargos de Terceiro",
};
export const ritLabel = withFallback(RIT_LABELS);

export const TYPE_CONTRACT_LABELS: Record<string, string> = {
  COMPRA_E_VENDA: "Compra e Venda",
  PRESTACAO_DE_SERVICOS: "Prestação de Serviços",
  LOCACAO: "Locação",
  COMODATO: "Comodato",
  MUTUO: "Mútuo",
  DOACAO: "Doação",
  EMPREITADA: "Empreitada",
  MANDATO: "Mandato",
  DEPOSITO: "Depósito",
  FIANCA: "Fiança",
  SEGURO: "Seguro",
  TRANSPORTE: "Transporte",
  SOCIEDADE: "Sociedade",
  FRANQUIA: "Franquia",
  LICENCIAMENTO: "Licenciamento",
  CESSAO_DE_DIREITOS: "Cessão de Direitos",
  CONFISSAO_DE_DIVIDA: "Confissão de Dívida",
  TRANSACAO: "Transação",
  CONTRATO_DE_TRABALHO: "Contrato de Trabalho",
  CONTRATO_ADMINISTRATIVO: "Contrato Administrativo",
  CONCESSAO: "Concessão",
  PERMISSAO: "Permissão",
  CONVENIO: "Convênio",
  TERMO_DE_FOMENTO: "Termo de Fomento",
  TERMO_DE_COLABORACAO: "Termo de Colaboração",
  ACORDO_DE_COOPERACAO: "Acordo de Cooperação",
};
export const typeContractLabel = withFallback(TYPE_CONTRACT_LABELS);

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  USER: "Usuário",
  ACCOUNTING: "Contabilidade",
};
export const roleLabel = withFallback(ROLE_LABELS);

/** Sorted alphabetically by label (PT-BR collation), never by the enum key's declaration order — per UXFIX-06/07. */
export const enumOptions = (labels: Record<string, string>) =>
  Object.entries(labels)
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
