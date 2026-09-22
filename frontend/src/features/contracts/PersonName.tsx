import { useQuery } from "@tanstack/react-query";
import { getPerson } from "../../shared/api/people";

/** Resolves a Person id to its display name (Contract only carries raw FK ids). */
export function PersonName({ id }: { id: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["person", id],
    queryFn: () => getPerson(id),
    staleTime: 5 * 60_000,
  });
  if (isLoading) return <span>…</span>;
  return <span>{data?.name ?? `Pessoa #${id}`}</span>;
}
