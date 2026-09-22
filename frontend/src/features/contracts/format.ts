const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(value: string | null): string {
  if (!value) return "Indeterminada";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR");
}
