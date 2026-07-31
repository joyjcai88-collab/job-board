"use client";

import { useState, useRef, useEffect } from "react";
import { REGIONS, CATEGORIES, SOURCES, WORK_MODES, JobFilters } from "@/lib/types";

interface FiltersProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  totalCount: number;
  filteredCount: number;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

function FilterChip({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly { key: string; label: string }[];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasSelection = selected.length > 0;
  const displayLabel = hasSelection
    ? `${label} (${selected.length})`
    : label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-[7px] font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors cursor-pointer ${
          hasSelection
            ? "bg-text-primary text-surface hover:opacity-[.82]"
            : "bg-pill text-text-primary hover:bg-pill-hi"
        }`}
      >
        {displayLabel}
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-none z-50 min-w-[210px] py-1">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() => onToggle(opt.key)}
                className="w-full text-left px-3.5 py-2 hover:bg-tile flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <span
                  className={`w-3.5 h-3.5 rounded-none flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-text-primary border-text-primary"
                      : "border-text-tertiary"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="font-serif text-[15px] text-text-primary">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Filters({ filters, onChange, totalCount, filteredCount }: FiltersProps) {
  const hasAnyFilter =
    filters.query || filters.regions.length > 0 || filters.categories.length > 0 || filters.sources.length > 0 || (filters.workModes?.length ?? 0) > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterChip
        label="Location"
        options={REGIONS}
        selected={filters.regions}
        onToggle={(key) => onChange({ ...filters, regions: toggleItem(filters.regions, key) })}
      />
      <FilterChip
        label="Role Type"
        options={CATEGORIES}
        selected={filters.categories}
        onToggle={(key) => onChange({ ...filters, categories: toggleItem(filters.categories, key) })}
      />
      <FilterChip
        label="Work Mode"
        options={WORK_MODES}
        selected={filters.workModes}
        onToggle={(key) => onChange({ ...filters, workModes: toggleItem(filters.workModes, key) })}
      />
      <FilterChip
        label="Source"
        options={SOURCES}
        selected={filters.sources}
        onToggle={(key) => onChange({ ...filters, sources: toggleItem(filters.sources, key) })}
      />

      {hasAnyFilter && (
        <button
          onClick={() => onChange({ query: "", categories: [], regions: [], sources: [], workModes: [] })}
          className="ml-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          Reset
        </button>
      )}

      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
        {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} jobs
      </span>
    </div>
  );
}
