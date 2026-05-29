import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}

export default function Pagination({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  if (totalPages <= 1 && total <= limit) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      {/* Results info */}
      <div className="flex items-center gap-3 text-sm text-dark-400">
        <span>
          Showing {startItem}–{endItem} of {total}
        </span>
        <select
          id="pagination-limit"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-dark-300 focus:outline-none focus:ring-1 focus:ring-accent-mid/50"
        >
          <option value="10" className="bg-dark-800">10</option>
          <option value="25" className="bg-dark-800">25</option>
          <option value="50" className="bg-dark-800">50</option>
        </select>
        <span>per page</span>
      </div>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        <button
          id="pagination-prev"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg p-2 text-dark-400 hover:bg-white/5 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((num, idx) =>
          num === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-dark-500">
              …
            </span>
          ) : (
            <button
              key={num}
              id={`pagination-page-${num}`}
              onClick={() => onPageChange(num)}
              className={`
                min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200
                ${
                  page === num
                    ? 'bg-gradient-to-r from-accent-start to-accent-mid text-white shadow-lg shadow-accent-start/20'
                    : 'text-dark-400 hover:bg-white/5 hover:text-dark-200'
                }
              `}
            >
              {num}
            </button>
          )
        )}

        <button
          id="pagination-next"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg p-2 text-dark-400 hover:bg-white/5 hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
