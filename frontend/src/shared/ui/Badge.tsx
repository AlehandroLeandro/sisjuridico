export type BadgeTone = "success" | "success-soft" | "danger" | "warning" | "neutral";

const toneStyles: Record<BadgeTone, { bg: string; color: string }> = {
  success: { bg: "var(--color-success-bg)", color: "var(--color-success-text)" },
  "success-soft": { bg: "var(--color-success-soft-bg)", color: "var(--color-success-soft-text)" },
  danger: { bg: "var(--color-danger-bg)", color: "var(--color-danger-text)" },
  warning: { bg: "var(--color-success-soft-bg)", color: "var(--color-warning-text)" },
  neutral: { bg: "var(--color-bg)", color: "var(--color-text-muted)" },
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  const { bg, color } = toneStyles[tone];
  return (
    <span className="badge" style={{ background: bg, color }}>
      {children}
    </span>
  );
}
