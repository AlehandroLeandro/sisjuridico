import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { RequireAuth, RequireRole } from "../features/auth/ProtectedRoute";
import { ShellLayout } from "../features/shell/ShellLayout";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { LawsuitsListPage } from "../features/lawsuits/LawsuitsListPage";
import { LawsuitFormPage } from "../features/lawsuits/LawsuitFormPage";
import { ContractsListPage } from "../features/contracts/ContractsListPage";
import { ContractDetailPage } from "../features/contracts/ContractDetailPage";
import { PeoplePage } from "../features/people/PeoplePage";
import { LawyersPage } from "../features/people/LawyersPage";
import { DocumentsPage } from "../features/documents/DocumentsPage";
import { UsersPage } from "../features/users/UsersPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ShellLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            element: <RequireRole roles={["ADMIN", "USER"]} />,
            children: [{ path: "dashboard", element: <DashboardPage /> }],
          },
          {
            element: <RequireRole roles={["ADMIN", "USER"]} />,
            children: [
              { path: "processos", element: <LawsuitsListPage /> },
              { path: "processos/novo", element: <LawsuitFormPage /> },
              { path: "processos/:id", element: <LawsuitFormPage /> },
            ],
          },
          {
            element: <RequireRole roles={["ADMIN", "USER", "ACCOUNTING"]} />,
            children: [
              { path: "contratos", element: <ContractsListPage /> },
              { path: "contratos/novo", element: <ContractDetailPage /> },
              { path: "contratos/:id", element: <ContractDetailPage /> },
            ],
          },
          {
            element: <RequireRole roles={["ADMIN", "USER"]} />,
            children: [
              { path: "pessoas", element: <PeoplePage /> },
              { path: "advogados", element: <LawyersPage /> },
              { path: "documentos", element: <DocumentsPage /> },
            ],
          },
          {
            element: <RequireRole roles={["ADMIN"]} />,
            children: [{ path: "usuarios", element: <UsersPage /> }],
          },
        ],
      },
    ],
  },
]);
