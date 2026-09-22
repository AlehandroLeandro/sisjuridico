import { useEffect, useRef, useState } from "react";

export interface PickerOption {
  id: number;
  label: string;
  sublabel?: string;
}

interface EntityPickerProps {
  label: string;
  placeholder?: string;
  value: number | null;
  valueLabel?: string; // display label for the currently-selected id, when known (e.g. loaded from an edit form)
  onChange: (id: number | null, option: PickerOption | null) => void;
  search: (query: string) => Promise<PickerOption[]>;
  error?: string;
  disabled?: boolean;
}

/**
 * Shared typeahead picker used by Lawsuits/Contracts/Documents to resolve a
 * Person or Lawyer id to a display name — per the Lawsuits and Contracts specs'
 * Assumptions tables: those responses carry raw FK ids with no name enrichment,
 * so the frontend must resolve names itself. This is the one reusable component
 * all three modules were told to build on instead of reinventing their own picker.
 */
export function EntityPicker({ label, placeholder, value, valueLabel, onChange, search, error, disabled }: EntityPickerProps) {
  const [query, setQuery] = useState(valueLabel ?? "");
  const [options, setOptions] = useState<PickerOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(valueLabel ?? "");
  }, [valueLabel]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      setLoading(true);
      setSearchError(false);
      search(query)
        .then(setOptions)
        .catch(() => {
          setOptions([]);
          setSearchError(true);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open, search]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="field" ref={containerRef} style={{ position: "relative" }}>
      <label>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value !== null) onChange(null, null);
        }}
      />
      {error && <div className="error">{error}</div>}
      {open && (
        <div
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
          {loading && <div style={{ padding: "9px 11px", fontSize: 12.5, color: "var(--color-text-muted)" }}>Buscando...</div>}
          {!loading && searchError && (
            <div style={{ padding: "9px 11px", fontSize: 12.5, color: "var(--color-danger-text)" }}>
              Não foi possível buscar. Tente novamente.
            </div>
          )}
          {!loading && !searchError && options.length === 0 && (
            <div style={{ padding: "9px 11px", fontSize: 12.5, color: "var(--color-text-muted)" }}>Nenhum resultado</div>
          )}
          {!loading &&
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id, opt);
                  setQuery(opt.label);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 11px",
                  background: value === opt.id ? "var(--color-bg)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--color-border-row)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <div>{opt.label}</div>
                {opt.sublabel && <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{opt.sublabel}</div>}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
