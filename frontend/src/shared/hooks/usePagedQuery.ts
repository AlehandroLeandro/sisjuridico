import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Page, PageParams } from "../api/types";

const DEFAULT_SIZE = 10;

/**
 * Standard list-screen pattern: page state + a query keyed on filters+page,
 * with the previous page kept on screen while the next one loads (no flash
 * of a loading state on pagination clicks). Every list module uses this.
 */
export function usePagedQuery<TFilters extends PageParams, TItem>(
  queryKey: unknown[],
  filters: TFilters,
  fetcher: (params: TFilters) => Promise<Page<TItem>>,
  options?: { size?: number },
) {
  const [page, setPage] = useState(0);
  const size = options?.size ?? DEFAULT_SIZE;

  const query = useQuery({
    queryKey: [...queryKey, { ...filters, page, size }],
    queryFn: () => fetcher({ ...filters, page, size }),
    placeholderData: keepPreviousData,
  });

  return { ...query, page, setPage, size };
}
