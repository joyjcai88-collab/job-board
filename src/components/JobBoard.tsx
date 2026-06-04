"use client";

import { useState, useMemo } from "react";
import { Job, JobFilters } from "@/lib/types";
import JobCard from "./JobCard";
import Filters from "./Filters";

const PAGE_SIZE = 25;

export default function JobBoard({ initialJobs }: { initialJobs: Job[] }) {
  const [filters, setFilters] = useState<JobFilters>({
    query: "",
    categories: [],
    regions: [],
    sources: [],
    workModes: [],
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const searchable =
          `${job.title} ${job.company} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      if (filters.regions.length > 0 && !filters.regions.includes(job.region))
        return false;
      if (filters.categories.length > 0 && !filters.categories.includes(job.category))
        return false;
      if (filters.sources.length > 0 && !filters.sources.includes(job.source))
        return false;
      if (filters.workModes?.length > 0 && !filters.workModes.includes(job.workMode))
        return false;

      return true;
    });
  }, [initialJobs, filters]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="max-w-[960px] mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6H16V4C16 2.9 15.1 2 14 2H10C8.9 2 8 2.9 8 4V6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM10 4H14V6H10V4Z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">JOBS</h1>
            </div>

            <div className="flex-1 max-w-md">
              <div className="flex items-center bg-bg rounded-lg px-3 h-9 border border-border focus-within:border-primary transition-colors">
                <svg className="w-4 h-4 text-text-tertiary shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title or company"
                  value={filters.query}
                  onChange={(e) => {
                    setFilters({ ...filters, query: e.target.value });
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-[57px] z-40 bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-[960px] mx-auto px-4 py-2.5">
          <Filters
            filters={filters}
            onChange={(f) => {
              setFilters(f);
              setVisibleCount(PAGE_SIZE);
            }}
            totalCount={initialJobs.length}
            filteredCount={filteredJobs.length}
          />
        </div>
      </div>

      {/* Job List */}
      <main className="max-w-[960px] mx-auto px-4 py-5">
        <div className="flex flex-col gap-3">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
            </svg>
            <p className="text-text-secondary text-base font-medium">No jobs match your filters</p>
            <button
              onClick={() => {
                setFilters({ query: "", categories: [], regions: [], sources: [], workModes: [] });
                setVisibleCount(PAGE_SIZE);
              }}
              className="mt-3 text-sm text-primary hover:text-primary-hover font-medium cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="px-8 py-2.5 bg-surface border border-border rounded-lg text-sm font-semibold text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              Show more jobs ({filteredJobs.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
