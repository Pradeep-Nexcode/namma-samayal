import { useState, useEffect, useRef } from "react";

/**
 * Generic admin filter bar with:
 *  - Search box (with clear button)
 *  - One or more dropdown filters
 *  - Sort dropdown
 *  - "More filters" expandable section for less-used filters
 *  - Active-filter chips with per-chip clear + "Clear all" reset
 *
 * Wires into URL params via a parent `updateUrl` callback so refresh / back /
 * forward / bookmarking all work the same as SmartPagination.
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  /** URL param key */
  key: string;
  /** Human label shown above the dropdown + on the chip */
  label: string;
  /** Current value (from URL) */
  value: string;
  /** Choices */
  options: FilterOption[];
  /** Show in the primary always-visible row (false = lives in "More filters") */
  primary?: boolean;
  /** Optional fn called when value changes. Lets parent reset dependent filters (e.g. clear subcategory when category changes). Receives the new value. Default behavior is just updateUrl({ [key]: newValue, page: 1 }). */
  onChange?: (newValue: string) => void;
}

export interface SortDef {
  key?: string; // defaults to "sort"
  options: FilterOption[];
  value: string;
}

export interface AdminFilterBarProps {
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (q: string) => void;
  filters: FilterDef[];
  sort?: SortDef;
  onFilterChange: (key: string, value: string) => void;
  onSortChange?: (value: string) => void;
  onClearAll: () => void;
  /** Number of records currently shown (for the "X total" label) */
  totalCount?: number;
  /** Optional plural label ("recipes", "ingredients", ...) for the count */
  countLabel?: string;
  /** Debounce ms for search input → onSearchChange. Default 350. */
  searchDebounceMs?: number;
  className?: string;
}

const SEARCH_DEBOUNCE_DEFAULT = 350;

export function AdminFilterBar({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  filters,
  sort,
  onFilterChange,
  onSortChange,
  onClearAll,
  totalCount,
  countLabel,
  searchDebounceMs = SEARCH_DEBOUNCE_DEFAULT,
  className = "",
}: AdminFilterBarProps) {
  // Local input value for instant typing UX; debounce to onSearchChange
  const [localSearch, setLocalSearch] = useState(searchValue);
  const lastEmittedRef = useRef(searchValue);
  const [moreOpen, setMoreOpen] = useState(false);

  // Sync external searchValue changes (e.g. clear-all, back button) into local input
  useEffect(() => {
    if (searchValue !== localSearch && searchValue !== lastEmittedRef.current) {
      setLocalSearch(searchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  useEffect(() => {
    const trimmed = localSearch.trim();
    if (trimmed === searchValue) return;
    const t = setTimeout(() => {
      lastEmittedRef.current = trimmed;
      onSearchChange(trimmed);
    }, searchDebounceMs);
    return () => clearTimeout(t);
  }, [localSearch, searchValue, onSearchChange, searchDebounceMs]);

  const primaryFilters = filters.filter((f) => f.primary !== false);
  const advancedFilters = filters.filter((f) => f.primary === false);

  // Active filter chips — anything not empty / not "all"
  const activeChips = filters
    .filter((f) => f.value && f.value !== "all" && f.value !== "")
    .map((f) => ({
      key: f.key,
      label: f.label,
      valueLabel: f.options.find((o) => o.value === f.value)?.label || f.value,
    }));

  const hasActiveFilters = activeChips.length > 0 || (searchValue?.trim().length ?? 0) > 0;

  const handleFilterChange = (filter: FilterDef, newValue: string) => {
    if (filter.onChange) filter.onChange(newValue);
    else onFilterChange(filter.key, newValue);
  };

  const selectClass =
    "rounded-lg border border-white/[0.12] bg-white/[0.03] text-gray-200 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#e74c3c]/50 focus:bg-white/[0.06] transition-all min-w-[150px] appearance-none cursor-pointer hover:border-white/20 hover:bg-white/[0.06] [&>option]:bg-[#0a0a0a] [&>option]:text-gray-200";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)] ${className}`}
    >
      {/* Subtle inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />

      {/* Top row: search + primary filters + sort */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-[#e74c3c] transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] pl-10 pr-9 py-2.5 text-sm font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e74c3c]/50 focus:bg-white/[0.06] transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Primary filters */}
        {primaryFilters.map((filter) => (
          <select
            key={filter.key}
            value={filter.value}
            onChange={(e) => handleFilterChange(filter, e.target.value)}
            className={selectClass}
            aria-label={filter.label}
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {/* Sort */}
        {sort && onSortChange && (
          <select
            value={sort.value}
            onChange={(e) => onSortChange(e.target.value)}
            className={selectClass}
            aria-label="Sort"
          >
            {sort.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                ⇅ {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* More filters toggle */}
        {advancedFilters.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
              moreOpen
                ? "border-[#e74c3c]/50 bg-[#e74c3c]/10 text-[#e74c3c] shadow-[0_0_20px_rgba(231,76,60,0.18)]"
                : "border-white/[0.12] bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] hover:border-white/20 hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            More
          </button>
        )}
      </div>

      {/* Advanced filters (collapsible) */}
      {moreOpen && advancedFilters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedFilters.map((filter) => (
            <div key={filter.key} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">
                {filter.label}
              </label>
              <select
                value={filter.value}
                onChange={(e) => handleFilterChange(filter, e.target.value)}
                className={selectClass}
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Active filter chips + total count */}
      {(hasActiveFilters || totalCount !== undefined) && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          {totalCount !== undefined && (
            <span className="text-xs font-medium text-gray-400 mr-2">
              <span className="font-black text-white">{totalCount}</span>
              {countLabel ? ` ${countLabel}` : ""}
              {hasActiveFilters ? " match" : " total"}
            </span>
          )}

          {searchValue?.trim() && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#e74c3c]/10 text-[#e74c3c] border border-[#e74c3c]/25 px-2.5 py-1 text-xs font-semibold hover:bg-[#e74c3c]/20 hover:border-[#e74c3c]/40 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span>&quot;{searchValue}&quot;</span>
              <span aria-hidden className="ml-0.5">×</span>
            </button>
          )}

          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onFilterChange(chip.key, "")}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] text-gray-200 border border-white/[0.12] px-2.5 py-1 text-xs font-semibold hover:bg-white/[0.08] hover:border-white/20 transition-all"
            >
              <span>
                <span className="text-gray-500 font-medium">{chip.label}:</span> {chip.valueLabel}
              </span>
              <span aria-hidden className="ml-0.5">×</span>
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onClearAll();
              }}
              className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#e74c3c] hover:text-[#ff6b5b] transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminFilterBar;
