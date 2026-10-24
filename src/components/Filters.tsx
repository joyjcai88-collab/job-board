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

// Multi-select dropdown in the same style as joyjcai.com/adoptdontshop: a mono key, the
// current value and an underline; picked options get the cyan bar. Styles in site-chrome.css.
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
  const [active, setActive] = useState(0);
  const [right, setRight] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keep the menu on screen on phones.
  useEffect(() => {
    if (open && menu.current) setRight(menu.current.getBoundingClientRect().right > document.documentElement.clientWidth - 8);
  }, [open]);

  const value =
    selected.length === 0
      ? "Any"
      : selected.length === 1
        ? options.find((o) => o.key === selected[0])?.label ?? "1 selected"
        : `${selected.length} selected`;

  return (
    <div className={`sc-dd jb-filter${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        className="sc-dd-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setActive(0);
          setRight(false);
          setOpen(!open);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) return setOpen(true);
            setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
          } else if ((e.key === "Enter" || e.key === " ") && open) {
            e.preventDefault();
            onToggle(options[active].key);
          } else if (e.key === "Escape" && open) {
            e.preventDefault();
            setOpen(false);
          } else if (e.key === "Tab") {
            setOpen(false);
          }
        }}
      >
        <span className="sc-dd-key">{label}</span>
        <span className="sc-dd-label">{value}</span>
      </button>

      {open && (
        <ul ref={menu} role="listbox" aria-multiselectable="true" className={`sc-dd-menu${right ? " right" : ""}`} onMouseDown={(e) => e.preventDefault()}>
          {options.map((opt, i) => {
            const isSelected = selected.includes(opt.key);
            return (
              <li
                key={opt.key}
                role="option"
                aria-selected={isSelected}
                className={[isSelected && "on", i === active && "active"].filter(Boolean).join(" ")}
                onMouseMove={() => setActive(i)}
                onClick={() => onToggle(opt.key)}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Filters({ filters, onChange, totalCount, filteredCount }: FiltersProps) {
  const hasAnyFilter =
    filters.query || filters.regions.length > 0 || filters.categories.length > 0 || filters.sources.length > 0 || (filters.workModes?.length ?? 0) > 0;

  return (
    <div className="jb-toolbar">
      <label className="jb-search">
        <span className="sc-dd-key">Search</span>
        <input
          type="text"
          placeholder="Title or company"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          aria-label="Search by title or company"
        />
      </label>
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

      <span className="jb-count">
        {hasAnyFilter && (
          <button
            onClick={() => onChange({ query: "", categories: [], regions: [], sources: [], workModes: [] })}
            className="jb-reset"
          >
            Reset
          </button>
        )}
        {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} jobs
      </span>
    </div>
  );
}
