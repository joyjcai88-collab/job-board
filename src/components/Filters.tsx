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
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
          hasSelection
            ? "bg-primary text-white border-primary shadow-sm"
            : "bg-surface text-text-secondary border-border hover:border-text-tertiary hover:text-text-primary"
        }`}
      >
        {displayLabel}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-surface border border-border rounded-xl shadow-lg z-50 min-w-[200px] py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() => onToggle(opt.key)}
                className="w-full text-left px-3.5 py-2 text-sm hover:bg-surface-hover flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-text-tertiary"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="text-text-primary">{opt.label}</span>
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
          className="text-sm text-primary hover:text-primary-hover font-medium ml-1 cursor-pointer"
        >
          Reset
        </button>
      )}

      <span className="ml-auto text-sm text-text-tertiary font-medium">
        {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} jobs
      </span>
    </div>
  );
}
