export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return <div className="state-message">{label}</div>;
}

export function EmptyState({ label = "Nenhum registro encontrado." }: { label?: string }) {
  return <div className="state-message">{label}</div>;
}

export function ErrorState({ label = "Não foi possível carregar os dados." }: { label?: string }) {
  return <div className="state-message error">{label}</div>;
}

export function ForbiddenState({ label = "Você não tem permissão para acessar esta área." }: { label?: string }) {
  return <div className="state-message error">{label}</div>;
}
