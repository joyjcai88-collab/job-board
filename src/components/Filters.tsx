"use client";

import { useState, useRef, useEffect } from "react";
import { REGIONS, CATEGORIES, SOURCES, JobFilters } from "@/lib/types";

interface FiltersProps {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  totalCount: number;
  filteredCount: number;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

function FilterDropdown({
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-full border transition-colors cursor-pointer ${
          hasSelection
            ? "bg-linkedin-blue text-white border-linkedin-blue"
            : "bg-surface text-text-primary border-border hover:bg-surface-hover"
        }`}
      >
        {label}
        {hasSelection && (
          <span className="ml-0.5 text-xs">({selected.length})</span>
        )}
        <svg
          className={`w-3.5 h-3.5 ml-0.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 min-w-[200px] py-1">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() => onToggle(opt.key)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-hover flex items-center gap-3 cursor-pointer transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-linkedin-blue border-linkedin-blue"
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
    filters.query || filters.regions.length > 0 || filters.categories.length > 0 || filters.sources.length > 0;

  return (
    <div className="bg-surface border-b border-border px-4 py-2.5">
      <div className="max-w-[1128px] mx-auto flex items-center gap-2 flex-wrap">
        <FilterDropdown
          label="Location"
          options={REGIONS}
          selected={filters.regions}
          onToggle={(key) => onChange({ ...filters, regions: toggleItem(filters.regions, key) })}
        />
        <FilterDropdown
          label="Role Type"
          options={CATEGORIES}
          selected={filters.categories}
          onToggle={(key) => onChange({ ...filters, categories: toggleItem(filters.categories, key) })}
        />
        <FilterDropdown
          label="Source"
          options={SOURCES}
          selected={filters.sources}
          onToggle={(key) => onChange({ ...filters, sources: toggleItem(filters.sources, key) })}
        />

        {hasAnyFilter && (
          <button
            onClick={() => onChange({ query: "", categories: [], regions: [], sources: [] })}
            className="text-sm text-linkedin-blue hover:text-linkedin-blue-hover font-medium ml-1 cursor-pointer"
          >
            Reset
          </button>
        )}

        <span className="ml-auto text-xs text-text-tertiary">
          {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} jobs
        </span>
      </div>
    </div>
  );
}
