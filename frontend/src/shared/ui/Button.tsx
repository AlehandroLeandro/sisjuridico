import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "soft" | "ghost" | "outline" | "danger";

const styles: Record<Variant, React.CSSProperties> = {
  primary: { background: "var(--color-primary)", color: "#fff", border: "none" },
  soft: { background: "var(--color-success-soft-bg)", color: "var(--color-success-soft-text)", border: "1px solid #cfe0c4" },
  ghost: { background: "transparent", color: "var(--color-success-soft-text)", border: "none", padding: "0" },
  outline: { background: "var(--color-surface)", color: "var(--color-text-faint)", border: "1px solid var(--color-border-strong)" },
  danger: { background: "var(--color-surface)", color: "var(--color-danger-text)", border: "1px solid var(--color-danger-border)" },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", style, children, ...rest }: ButtonProps) {
  return (
    <button
      type={rest.type ?? "button"}
      style={{
        padding: variant === "ghost" ? undefined : "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: rest.disabled ? "not-allowed" : "pointer",
        opacity: rest.disabled ? 0.6 : 1,
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
