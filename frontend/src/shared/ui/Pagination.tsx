import type { Page } from "../api/types";
import { Button } from "./Button";

interface PaginationProps {
  page: Page<unknown> | undefined;
  onPageChange: (nextPage: number) => void;
}

export function Pagination({ page, onPageChange }: PaginationProps) {
  if (!page || page.totalElements === 0) return null;

  const from = page.number * page.size + 1;
  const to = page.number * page.size + page.numberOfElements;

  return (
    <div className="pagination-footer">
      <div className="pagination-info">
        Exibindo {from}–{to} de {page.totalElements}
      </div>
      <div className="pagination-controls">
        <Button variant="outline" disabled={page.first} onClick={() => onPageChange(page.number - 1)}>
          Anterior
        </Button>
        <Button variant="outline" disabled={page.last} onClick={() => onPageChange(page.number + 1)}>
          Próxima
        </Button>
      </div>
    </div>
  );
}
