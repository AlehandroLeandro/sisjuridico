import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Mirrors the mockup's TITULOS map (docs/mockup/dc-script.js) — breadcrumb + page title per route.
const TITLES: Record<string, [string, string]> = {
  dashboard: ["Visão geral", "Dashboard"],
  processos: ["Processos", "Listagem de processos"],
  contratos: ["Contratos", "Listagem de contratos"],
  pessoas: ["Cadastros", "Pessoas"],
  advogados: ["Cadastros", "Advogados"],
  documentos: ["Documentos", "Documentos"],
  usuarios: ["Administração", "Usuários do sistema"],
};

function titleFor(pathname: string): [string, string] {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return TITLES[segment] ?? ["Jurídico Carbocat", "Jurídico Carbocat"];
}

export function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [trilha, titulo] = titleFor(location.pathname);

  return (
    <header
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0 26px",
        height: "var(--header-height)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        position: "sticky",
        top: 0,
        zIndex: 5,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", letterSpacing: ".04em" }}>
          Jurídico Carbocat / {trilha}
        </div>
        <div style={{ fontSize: 16.5, fontWeight: 600, letterSpacing: "-.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {titulo}
        </div>
      </div>

      <div style={{ width: 1, height: 30, background: "var(--color-border)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right", lineHeight: 1.25 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{user && roleDisplay(user.role)}</div>
        </div>
        <div style={{ width: 32, height: 32, background: "var(--color-success-bg)", color: "var(--color-success-soft-text)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>
          {initials(user?.name)}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 12px",
            background: "var(--color-success-soft-bg)",
            border: "1px solid #cfe0c4",
            color: "var(--color-success-soft-text)",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sair
        </button>
      </div>
    </header>
  );
}

function initials(name?: string) {
  if (!name) return "";
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function roleDisplay(role: string) {
  return role === "ADMIN" ? "Administrador" : role === "ACCOUNTING" ? "Contabilidade" : "Usuário";
}
