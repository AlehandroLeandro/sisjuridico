import { useEffect, useRef, useState } from "react";

interface EnumSelectOption {
  value: string;
  label: string;
}

interface EnumSelectProps {
  label: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: EnumSelectOption[];
  placeholder?: string;
  fixed?: boolean;
  disabled?: boolean;
  error?: string;
}

/**
 * Closed-by-default combobox with a fixed-max-height, internally-scrollable
 * options list — for long enums (≥16 values) where a native <select> makes
 * the browser render an unwieldy dropdown. Same value/onChange contract as
 * SelectField (a synthetic `{ target: { value } }` event) so call sites swap
 * in without touching their onChange body. Visually matches EntityPicker's
 * dropdown panel. Per UXFIX-08..12.
 */
export function EnumSelect({ label, value, onChange, options, placeholder, fixed, disabled, error }: EnumSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected ? selected.label : (placeholder ?? "");

  function select(next: string) {
    onChange({ target: { value: next } });
    setOpen(false);
  }

  return (
    <div className={fixed ? "field field-fixed" : "field"} ref={containerRef} style={{ position: "relative" }}>
      <label>{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "9px 11px",
          border: "1px solid var(--color-border-strong)",
          background: "var(--color-bg)",
          fontSize: 13,
          color: selected ? "var(--color-text-strong)" : "var(--color-text-muted)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {displayLabel || " "}
      </button>
      {error && <div className="error">{error}</div>}
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 20,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {placeholder !== undefined && (
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              onClick={() => select("")}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 11px",
                background: value === "" ? "var(--color-bg)" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--color-border-row)",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => select(opt.value)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 11px",
                background: value === opt.value ? "var(--color-bg)" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--color-border-row)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
