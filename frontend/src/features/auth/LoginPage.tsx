import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { landingPathForRole } from "../shell/nav";

export function LoginPage() {
  const { login, status, user } = useAuth();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated" && user) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? landingPathForRole(user.role);
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(userName, password, keepSignedIn);
    } catch {
      setError("Usuário ou senha inválidos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", background: "var(--color-bg)" }}>
      <div style={{ background: "var(--color-ink)", padding: "56px 56px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: "var(--color-accent)", display: "grid", placeItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth={2} strokeLinecap="round">
              <path d="M12 3v18M5 21h14M4 8h16" />
              <path d="M7 8l-3 6h6zM17 8l3 6h-6z" />
            </svg>
          </div>
          <div style={{ color: "var(--color-text-on-ink)", fontSize: 19, fontWeight: 700, letterSpacing: "-.02em" }}>Jurídico Carbocat</div>
        </div>
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-text-on-ink-muted)", marginBottom: 18 }}>
            Gestão jurídica integrada
          </div>
          <div style={{ fontSize: 38, lineHeight: 1.1, fontWeight: 600, color: "var(--color-text-on-ink)", letterSpacing: "-.03em" }}>
            Processos, contratos e documentos do escritório em um só lugar.
          </div>
          <div style={{ height: 2, background: "var(--color-ink-border)", margin: "28px 0" }} />
          <div style={{ color: "var(--color-text-on-ink-muted)", fontSize: 14, lineHeight: 1.6 }}>Acesso restrito a equipe jurídica.</div>
        </div>
        <div style={{ color: "var(--color-text-on-ink-faint)", fontSize: 12 }}>© 2026 Jurídico Carbocat</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", padding: 48, minHeight: "100vh" }}>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.02em", marginBottom: 6 }}>Entrar no sistema</div>
          <div style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 30 }}>Informe suas credenciais de acesso.</div>

          <label htmlFor="userName" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-strong)", marginBottom: 7 }}>
            Usuário
          </label>
          <input
            id="userName"
            type="text"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--color-border-strong)", background: "#fff", color: "var(--color-text-strong)", fontSize: 14, marginBottom: 18 }}
          />

          <label htmlFor="password" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-strong)", marginBottom: 7 }}>
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--color-border-strong)", background: "#fff", color: "var(--color-text-strong)", fontSize: 14, marginBottom: 16 }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-faint)" }}>
              <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} style={{ accentColor: "var(--color-primary)", width: 15, height: 15 }} />
              Manter conectado
            </label>
          </div>

          {error && <div style={{ color: "var(--color-danger-text)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{ width: "100%", padding: 13, background: "var(--color-primary)", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Entrando..." : "Acessar"}
          </button>

          <div style={{ height: 1, background: "var(--color-border)", margin: "26px 0" }} />
          <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>Problemas de acesso? Contate a equipe de TI</div>
        </form>
      </div>
    </div>
  );
}
