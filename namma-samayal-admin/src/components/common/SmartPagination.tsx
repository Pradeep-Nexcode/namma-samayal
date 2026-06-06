import { useMemo } from "react";

/**
 * Smart paginator with ellipsis collapsing + page-size selector.
 *
 *   Layout:  [Size selector] [← Prev]  1 ... 4 5 6 ... 22  [Next →]   12-24 of 264
 *
 * Rules for visible page chunks:
 *  - Always show: page 1, last page, current page, current-1, current+1
 *  - Insert "…" wherever there's a gap
 *  - If total pages <= 7, show them all linearly (no ellipsis)
 *
 * When the user changes the page size, we try to keep them looking at roughly the
 * same first item. e.g. if they're on page 3 of size=12 (showing items 25-36) and
 * change to size=24, we jump to page 2 (items 25-48) instead of resetting to 1.
 */

export interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number, newPage: number) => void;
  /** Optional small label shown next to the totals (e.g. "ingredients", "recipes") */
  itemLabel?: string;
  className?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

/**
 * Builds the sequence of page numbers / ellipsis markers to display.
 * Returns a mixed array: numbers are pages, the string "…" is an ellipsis.
 */
export function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | "…"> = [];
  const showLeftEllipsis = currentPage > 4;
  const showRightEllipsis = currentPage < totalPages - 3;

  items.push(1);

  if (showLeftEllipsis) {
    items.push("…");
  }

  // Middle window around current
  const start = showLeftEllipsis ? Math.max(currentPage - 1, 2) : 2;
  const end = showRightEllipsis ? Math.min(currentPage + 1, totalPages - 1) : totalPages - 1;
  for (let i = start; i <= end; i += 1) {
    items.push(i);
  }

  if (showRightEllipsis) {
    items.push("…");
  }

  items.push(totalPages);
  return items;
}

export function SmartPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  itemLabel,
  className = "",
}: SmartPaginationProps) {
  const pageItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handleSizeChange = (newSize: number) => {
    // Keep user roughly anchored to the same first item across page-size changes
    const firstItemIndex = (currentPage - 1) * pageSize + 1;
    const newPage = Math.max(1, Math.ceil(firstItemIndex / newSize));
    onPageSizeChange(newSize, newPage);
  };

  // Compute the current visible range for the "X-Y of Z" label
  const rangeStart = totalItems && totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = totalItems ? Math.min(totalItems, currentPage * pageSize) : 0;

  // If there's only one page and we have no size selector worth showing, hide
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSizeOptions[0])) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl px-6 py-5 flex flex-col gap-4 mt-8 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />

      {/* Page-size selector */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
        <label htmlFor="page-size" className="whitespace-nowrap uppercase tracking-wider text-[10px] font-black text-gray-500">
          Show
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(e) => handleSizeChange(Number(e.target.value))}
          className="border border-white/10 rounded-lg px-2.5 py-1.5 text-sm font-semibold bg-white/[0.04] text-white focus:outline-none focus:border-[#e74c3c]/40 transition-all cursor-pointer hover:bg-white/[0.07] [&>option]:bg-[#0a0a0a]"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-gray-500">
          per page
        </span>
        {totalItems !== undefined && totalItems > 0 && (
          <span className="text-xs text-gray-500 ml-3 hidden sm:inline">
            <span className="font-bold text-gray-300">{rangeStart}–{rangeEnd}</span>
            <span className="text-gray-600"> of </span>
            <span className="font-bold text-gray-300">{totalItems}</span>
            {itemLabel ? <span className="text-gray-500"> {itemLabel}</span> : null}
          </span>
        )}
      </div>

      {/* Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/[0.03] text-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all"
            aria-label="Previous page"
          >
            ← Prev
          </button>

          {pageItems.map((item, idx) =>
            item === "…" ? (
              <span
                key={`gap-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-sm text-gray-600 select-none"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                aria-current={currentPage === item ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={`w-9 h-9 text-sm font-bold rounded-lg transition-all ${
                  currentPage === item
                    ? "bg-gradient-to-br from-[#e74c3c] to-[#c0392b] text-white shadow-[0_4px_18px_rgba(231,76,60,0.45)]"
                    : "border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white"
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/[0.03] text-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08] hover:border-white/20 hover:text-white transition-all"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default SmartPagination;
