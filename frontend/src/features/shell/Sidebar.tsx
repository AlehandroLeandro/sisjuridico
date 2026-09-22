import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { navForRole } from "./nav";

export function Sidebar() {
  const { user } = useAuth();
  const items = user ? navForRole(user.role) : [];

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        flex: "0 0 var(--sidebar-width)",
        background: "var(--color-ink)",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "22px 20px",
          borderBottom: "1px solid var(--color-ink-border)",
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}
      >
        <div style={{ width: 30, height: 30, background: "var(--color-accent)", display: "grid", placeItems: "center", flex: "0 0 30px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth={2} strokeLinecap="round">
            <path d="M12 3v18M5 21h14M4 8h16" />
            <path d="M7 8l-3 6h6zM17 8l3 6h-6z" />
          </svg>
        </div>
        <div style={{ color: "var(--color-text-on-ink)", fontSize: 16, fontWeight: 700, letterSpacing: "-.02em" }}>Jurídico Carbocat</div>
      </div>

      <nav style={{ padding: "18px 12px", display: "flex", flexDirection: "column", gap: 2, flex: 1, overflow: "auto" }}>
        <div style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "#5c6f63", padding: "6px 10px 10px" }}>
          Módulos
        </div>
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "10px 11px",
              border: "none",
              textAlign: "left",
              fontSize: 13.5,
              fontWeight: 500,
              width: "100%",
              background: isActive ? "var(--color-ink-soft)" : "transparent",
              color: isActive ? "var(--color-text-on-ink)" : "#7f9186",
              borderLeft: `3px solid ${isActive ? "var(--color-accent)" : "transparent"}`,
            })}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 17px" }}>
              <path d={item.d1} />
              <path d={item.d2} />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "14px 12px", borderTop: "1px solid var(--color-ink-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px" }}>
          <div style={{ width: 32, height: 32, background: "var(--color-ink-soft)", color: "var(--color-accent)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, flex: "0 0 32px" }}>
            {initials(user?.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "var(--color-text-on-ink)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </div>
            <div style={{ color: "var(--color-text-on-ink-faint)", fontSize: 11.5 }}>{user && roleDisplay(user.role)}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function initials(name?: string) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function roleDisplay(role: string) {
  return role === "ADMIN" ? "Administrador" : role === "ACCOUNTING" ? "Contabilidade" : "Usuário";
}
