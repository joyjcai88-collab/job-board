"use client";

import { REGIONS, CATEGORIES, SOURCES, JobFilters } from "@/lib/types";

interface FiltersProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  totalCount: number;
  filteredCount: number;
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-150 cursor-pointer ${
        active
          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
          : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
      }`}
    >
      {label}
    </button>
  );
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export default function Filters({ filters, onChange, totalCount, filteredCount }: FiltersProps) {
  return (
    <div className="space-y-5">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search jobs, companies, keywords..."
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Location</p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <ToggleChip
                key={r.key}
                label={r.label}
                active={filters.regions.includes(r.key)}
                onClick={() => onChange({ ...filters, regions: toggleItem(filters.regions, r.key) })}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Role Type</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <ToggleChip
                key={c.key}
                label={c.label}
                active={filters.categories.includes(c.key)}
                onClick={() => onChange({ ...filters, categories: toggleItem(filters.categories, c.key) })}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Source</p>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <ToggleChip
                key={s.key}
                label={s.label}
                active={filters.sources.includes(s.key)}
                onClick={() => onChange({ ...filters, sources: toggleItem(filters.sources, s.key) })}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Showing {filteredCount} of {totalCount} listings
      </p>
    </div>
  );
}
