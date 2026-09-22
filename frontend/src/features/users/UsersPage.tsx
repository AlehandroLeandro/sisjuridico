import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { enumOptions, roleLabel, ROLE_LABELS } from "../../shared/enums/labels";
import { Button } from "../../shared/ui/Button";
import { SelectField, TextField } from "../../shared/ui/Field";
import { ConfirmDialog, Modal } from "../../shared/ui/Modal";
import { Pagination } from "../../shared/ui/Pagination";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "../../shared/ui/States";
import { usePagedQuery } from "../../shared/hooks/usePagedQuery";
import type { Role } from "../../shared/api/types";
import {
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  updateUser,
  type User,
  type UserFilters,
} from "./api";

const NAME_LEN = { min: 3, max: 50 };
const USERNAME_LEN = { min: 5, max: 50 };
const PASSWORD_LEN = { min: 6, max: 100 };
const ROLE_OPTIONS = enumOptions(ROLE_LABELS);

function apiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const message = (err.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }
  return fallback;
}

type ModalState =
  | { kind: "create" }
  | { kind: "edit"; user: User }
  | { kind: "password"; user: User }
  | { kind: "delete"; user: User }
  | null;

export function UsersPage() {
  const { user: me, logout } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{ name: string; userName: string; role: Role | "" }>({
    name: "",
    userName: "",
    role: "",
  });
  const [modal, setModal] = useState<ModalState>(null);

  const appliedFilters: UserFilters = {
    name: filters.name || undefined,
    userName: filters.userName || undefined,
    role: filters.role || undefined,
  };

  const { data, isLoading, isError, error, setPage } = usePagedQuery(
    ["users", appliedFilters],
    appliedFilters,
    listUsers,
  );

  const forbidden = axios.isAxiosError(error) && error.response?.status === 403;

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: async (_data, id) => {
      await invalidateList();
      setModal(null);
      if (me?.id === id) await logout();
    },
  });

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-bar-row">
          <TextField
            label="Nome"
            placeholder="Buscar por nome"
            value={filters.name}
            onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Usuário"
            placeholder="Buscar por login"
            value={filters.userName}
            onChange={(e) => setFilters((f) => ({ ...f, userName: e.target.value }))}
          />
          <SelectField
            label="Papel"
            placeholder="Todos os papéis"
            options={ROLE_OPTIONS}
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value as Role | "" }))}
          />
        </div>
      </div>

      <div className="toolbar">
        <div />
        <Button onClick={() => setModal({ kind: "create" })}>Novo usuário</Button>
      </div>

      <div className="card">
        {isLoading ? (
          <LoadingState />
        ) : forbidden ? (
          <ForbiddenState />
        ) : isError ? (
          <ErrorState />
        ) : !data || data.content.length === 0 ? (
          <EmptyState label="Nenhum usuário encontrado." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Usuário</th>
                  <th>Papel</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.userName}</td>
                    <td>{roleLabel(u.role)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={() => setModal({ kind: "edit", user: u })}>
                          Editar
                        </Button>
                        <Button variant="outline" onClick={() => setModal({ kind: "password", user: u })}>
                          Redefinir senha
                        </Button>
                        <Button variant="danger" onClick={() => setModal({ kind: "delete", user: u })}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={data} onPageChange={setPage} />
      </div>

      {(modal?.kind === "create" || modal?.kind === "edit") && (
        <UserFormModal
          user={modal.kind === "edit" ? modal.user : undefined}
          onClose={() => setModal(null)}
          onSaved={() => {
            invalidateList();
            setModal(null);
          }}
        />
      )}

      {modal?.kind === "password" && (
        <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} />
      )}

      {modal?.kind === "delete" && (
        <ConfirmDialog
          title="Excluir usuário"
          message={`Tem certeza que deseja excluir "${modal.user.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onCancel={() => setModal(null)}
          onConfirm={() => deleteMutation.mutate(modal.user.id)}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
  onSaved,
}: {
  user?: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? "");
  const [userName, setUserName] = useState(user?.userName ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role ?? "USER");
  const [errors, setErrors] = useState<{ name?: string; userName?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updateUser(user.id, { name, userName, role })
        : createUser({ name, userName, password, role }),
    onSuccess: onSaved,
    onError: (err) => setFormError(apiErrorMessage(err, "Não foi possível salvar o usuário.")),
  });

  function validate() {
    const next: typeof errors = {};
    if (name.length < NAME_LEN.min || name.length > NAME_LEN.max) {
      next.name = `Nome deve ter entre ${NAME_LEN.min} e ${NAME_LEN.max} caracteres.`;
    }
    if (userName.length < USERNAME_LEN.min || userName.length > USERNAME_LEN.max) {
      next.userName = `Usuário deve ter entre ${USERNAME_LEN.min} e ${USERNAME_LEN.max} caracteres.`;
    }
    if (!isEdit && (password.length < PASSWORD_LEN.min || password.length > PASSWORD_LEN.max)) {
      next.password = `Senha deve ter entre ${PASSWORD_LEN.min} e ${PASSWORD_LEN.max} caracteres.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    mutation.mutate();
  }

  return (
    <Modal
      title={isEdit ? "Editar usuário" : "Novo usuário"}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {isEdit ? "Salvar" : "Criar usuário"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextField
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          hint={`${NAME_LEN.min}-${NAME_LEN.max} caracteres`}
        />
        <TextField
          label="Usuário"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          error={errors.userName}
          hint={`${USERNAME_LEN.min}-${USERNAME_LEN.max} caracteres`}
        />
        {!isEdit && (
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint={`${PASSWORD_LEN.min}-${PASSWORD_LEN.max} caracteres`}
            autoComplete="new-password"
          />
        )}
        <SelectField
          label="Papel"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        />
        {formError && <div className="error">{formError}</div>}
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => resetUserPassword(user.id, password),
    onSuccess: () => setDone(true),
    onError: (err) => setFormError(apiErrorMessage(err, "Não foi possível redefinir a senha.")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (password.length < PASSWORD_LEN.min || password.length > PASSWORD_LEN.max) {
      setError(`Senha deve ter entre ${PASSWORD_LEN.min} e ${PASSWORD_LEN.max} caracteres.`);
      return;
    }
    setError(undefined);
    mutation.mutate();
  }

  if (done) {
    return (
      <Modal title="Redefinir senha" onClose={onClose} footer={<Button onClick={onClose}>Fechar</Button>}>
        <p style={{ fontSize: 13, color: "var(--color-text-strong)", margin: 0 }}>
          Senha de "{user.name}" redefinida com sucesso.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={`Redefinir senha de "${user.name}"`}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            Redefinir senha
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: 0 }}>
          Esta ação substitui a senha atual de "{user.userName}" imediatamente.
        </p>
        <TextField
          label="Nova senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          hint={`${PASSWORD_LEN.min}-${PASSWORD_LEN.max} caracteres`}
          autoComplete="new-password"
        />
        {formError && <div className="error">{formError}</div>}
      </form>
    </Modal>
  );
}
