import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { getPerson, type Person } from "../../shared/api/people";
import { getLawyer, type Lawyer } from "../../shared/api/lawyers";

export interface ResolvedName {
  name: string;
  loading: boolean;
  /** Person/Lawyer id referenced by a lawsuit no longer resolves (404) — per LAW-38. */
  notFound: boolean;
}

/**
 * Resolves a batch of ids to display names via one GET /{resource}/{id} per
 * unique id (no batch-resolve endpoint exists — see LAW-* Assumptions).
 * React Query's cache means the same id resolved on one page/view is reused
 * everywhere else in the session (LAW-36), no bespoke cache needed.
 */
function useNamesByIds<T extends { name: string }>(
  ids: (number | null | undefined)[],
  kind: string,
  fetcher: (id: number) => Promise<T>,
): Map<number, ResolvedName> {
  const unique = Array.from(new Set(ids.filter((id): id is number => id != null)));
  const results = useQueries({
    queries: unique.map((id) => ({
      queryKey: [kind, id],
      queryFn: () => fetcher(id),
      staleTime: Infinity,
      retry: false,
    })),
  });

  const map = new Map<number, ResolvedName>();
  unique.forEach((id, i) => {
    const q = results[i];
    const notFound = axios.isAxiosError(q.error) && q.error.response?.status === 404;
    map.set(id, { name: q.data?.name ?? "", loading: q.isLoading, notFound });
  });
  return map;
}

export function usePersonNames(ids: (number | null | undefined)[]): Map<number, ResolvedName> {
  return useNamesByIds<Person>(ids, "person", getPerson);
}

export function useLawyerNames(ids: (number | null | undefined)[]): Map<number, ResolvedName> {
  return useNamesByIds<Lawyer>(ids, "lawyer", getLawyer);
}

/** "registro removido" placeholder per LAW-38, otherwise the resolved name or a loading dash. */
export function displayName(resolved: ResolvedName | undefined): string {
  if (!resolved) return "—";
  if (resolved.notFound) return "Registro removido";
  if (resolved.loading) return "Carregando...";
  return resolved.name || "—";
}
