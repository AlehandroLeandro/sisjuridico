import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface WrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  fixed?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, hint, fixed, children }: WrapperProps) {
  return (
    <div className={fixed ? "field field-fixed" : "field"}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <div className="error">{error}</div> : hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  fixed?: boolean;
}

export function TextField({ label, error, hint, fixed, id, ...rest }: TextFieldProps) {
  const htmlId = id ?? `field-${label}`;
  return (
    <FieldWrapper label={label} htmlFor={htmlId} error={error} hint={hint} fixed={fixed}>
      <input id={htmlId} {...rest} />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  fixed?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({ label, error, hint, fixed, id, options, placeholder, ...rest }: SelectFieldProps) {
  const htmlId = id ?? `field-${label}`;
  return (
    <FieldWrapper label={label} htmlFor={htmlId} error={error} hint={hint} fixed={fixed}>
      <select id={htmlId} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextAreaField({ label, error, hint, id, ...rest }: TextAreaFieldProps) {
  const htmlId = id ?? `field-${label}`;
  return (
    <FieldWrapper label={label} htmlFor={htmlId} error={error} hint={hint}>
      <textarea id={htmlId} {...rest} />
    </FieldWrapper>
  );
}
