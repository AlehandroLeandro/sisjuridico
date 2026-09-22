import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../../shared/api/types";
import { ForbiddenState } from "../../shared/ui/States";
import { useAuth } from "./AuthContext";

export function RequireAuth() {
  const { status } = useAuth();

  if (status === "checking") return null; // could render a splash/spinner
  if (status === "anonymous") return <Navigate to="/login" replace />;

  return <Outlet />;
}

/** Route-level role gate — per SHELL-* every nav item/route is gated by the real 3-role matrix (AD-006), not just Usuários. */
export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  if (!user) return null;
  if (!roles.includes(user.role)) return <ForbiddenState />;
  return <Outlet />;
}
