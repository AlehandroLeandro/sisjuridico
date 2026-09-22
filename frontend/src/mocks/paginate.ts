import type { Page } from "../shared/api/types";

/** Slices an already-filtered in-memory array into a Page<T> envelope matching AD-002's contract. */
export function paginate<T>(items: T[], pageParam: string | null, sizeParam: string | null): Page<T> {
  const page = Math.max(0, Number(pageParam ?? 0) || 0);
  const size = Math.min(100, Math.max(1, Number(sizeParam ?? 20) || 20));
  const start = page * size;
  const content = items.slice(start, start + size);
  const totalPages = Math.max(1, Math.ceil(items.length / size));

  return {
    content,
    totalElements: items.length,
    totalPages: items.length === 0 ? 0 : totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

let idCounter = 10_000;
export function nextId(): number {
  idCounter += 1;
  return idCounter;
}

export function matchesText(haystack: string | null | undefined, needle: string | null): boolean {
  if (!needle) return true;
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/** Soft-delete list filter: `active` query param defaults to true (only active records) unless explicitly `active=false`. Per frontend-soft-delete SOFTDEL-04..07. */
export function matchesActive(itemActive: boolean, activeParam: string | null): boolean {
  const wantActive = activeParam !== "false";
  return itemActive === wantActive;
}
