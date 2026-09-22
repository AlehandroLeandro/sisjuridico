import type { Role } from "../../shared/api/types";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  d1: string;
  d2: string;
  /** Roles allowed to see/use this item — the real 3-role matrix (AD-006), not the mockup's single admin flag. */
  roles: Role[];
}

// Icon paths lifted directly from docs/mockup/dc-script.js's NAV array.
export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    d1: "M3 3h8v7H3z",
    d2: "M14 3h7v11h-7zM3 14h8v7H3zM14 18h7v3h-7z",
    roles: ["ADMIN", "USER"],
  },
  {
    id: "processos",
    label: "Processos",
    path: "/processos",
    d1: "M12 3v18M5 21h14M4 8h16",
    d2: "M7 8l-3 6h6zM17 8l3 6h-6z",
    roles: ["ADMIN", "USER"],
  },
  {
    id: "contratos",
    label: "Contratos",
    path: "/contratos",
    d1: "M6 2h8l4 4v16H6z",
    d2: "M14 2v4h4M9 13h6M9 17h5",
    roles: ["ADMIN", "USER", "ACCOUNTING"],
  },
  {
    id: "pessoas",
    label: "Pessoas",
    path: "/pessoas",
    d1: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20",
    d2: "M9.5 5a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4M17 9h5M19.5 6.5v5",
    roles: ["ADMIN", "USER"],
  },
  {
    id: "advogados",
    label: "Advogados",
    path: "/advogados",
    d1: "M3 8h18v12H3z",
    d2: "M9 8V5h6v3M3 13h18",
    roles: ["ADMIN", "USER"],
  },
  {
    id: "documentos",
    label: "Documentos",
    path: "/documentos",
    d1: "M3 6h6l2 3h10v11H3z",
    d2: "M3 11h18",
    roles: ["ADMIN", "USER"],
  },
  {
    id: "usuarios",
    label: "Usuários",
    path: "/usuarios",
    d1: "M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z",
    d2: "M9 12l2 2 4-4",
    roles: ["ADMIN"],
  },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/** Where each role lands right after login. ACCOUNTING has no Dashboard access (AD-006). */
export function landingPathForRole(role: Role): string {
  return role === "ACCOUNTING" ? "/contratos" : "/dashboard";
}
