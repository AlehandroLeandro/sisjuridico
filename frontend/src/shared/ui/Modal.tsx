import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({ title, onClose, children, footer, width = 480 }: ModalProps) {
  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 35, 31, 0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 100,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "85vh",
          overflow: "auto",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="card-header">
          <div className="card-title">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, color: "var(--color-text-muted)" }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
        {footer && <div style={{ padding: "14px 18px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 8, justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: "10px 16px", background: "#fff", border: "1px solid var(--color-border-strong)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "10px 16px",
              border: danger ? "1px solid var(--color-danger-border)" : "none",
              background: danger ? "var(--color-danger-bg)" : "var(--color-primary)",
              color: danger ? "var(--color-danger-text)" : "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 13, color: "var(--color-text-strong)", margin: 0 }}>{message}</p>
    </Modal>
  );
}
