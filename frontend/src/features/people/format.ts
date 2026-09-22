import axios from "axios";

/** Strip everything but digits — how the backend stores/validates cpfCnpj and oab. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** `000.000.000-00` for 11 digits, `00.000.000/0000-00` for 14, raw digits otherwise (mid-typing). */
export function formatCpfCnpj(digits: string): string {
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return digits;
}

export type PersonDocKind = "fisica" | "juridica" | "sem-documento";

export function classifyDoc(cpfCnpj: string | null): PersonDocKind {
  if (!cpfCnpj) return "sem-documento";
  return cpfCnpj.length === 11 ? "fisica" : "juridica";
}

export function validateCpfCnpj(digits: string): string | undefined {
  if (digits.length === 0) return undefined;
  if (digits.length !== 11 && digits.length !== 14) {
    return "CPF deve ter 11 dígitos ou CNPJ 14 dígitos.";
  }
  return undefined;
}

export function validateOab(digits: string): string | undefined {
  if (digits.length === 0) return undefined;
  if (digits.length !== 6) return "OAB deve ter exatamente 6 dígitos.";
  return undefined;
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 100) {
    return "Nome deve ter entre 3 e 100 caracteres.";
  }
  return undefined;
}

/** Pulls a backend-returned message out of a rejected request, for surfacing 400/409 rejections verbatim. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
