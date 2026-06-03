"use client";

import { useState, useMemo, useEffect } from "react";
import { Job, JobFilters } from "@/lib/types";
import JobCard from "./JobCard";
import JobDetail from "./JobDetail";
import Filters from "./Filters";

export default function JobBoard({ initialJobs }: { initialJobs: Job[] }) {
  const [filters, setFilters] = useState<JobFilters>({
    query: "",
    categories: [],
    regions: [],
    sources: [],
  });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

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
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(job.category)
      )
        return false;
      if (filters.sources.length > 0 && !filters.sources.includes(job.source))
        return false;

      return true;
    });
  }, [initialJobs, filters]);

  useEffect(() => {
    if (filteredJobs.length > 0) {
      if (!selectedJobId || !filteredJobs.find((j) => j.id === selectedJobId)) {
        setSelectedJobId(filteredJobs[0].id);
      }
    } else {
      setSelectedJobId(null);
    }
  }, [filteredJobs, selectedJobId]);

  const selectedJob = filteredJobs.find((j) => j.id === selectedJobId) || null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Filters
        filters={filters}
        onChange={setFilters}
        totalCount={initialJobs.length}
        filteredCount={filteredJobs.length}
      />

      <div className="flex-1 max-w-[1128px] mx-auto w-full px-4 py-4">
        <div className="flex gap-0 h-[calc(100vh-140px)]">
          {/* Search bar above job list */}
          <div className="w-[420px] shrink-0 flex flex-col border border-border rounded-lg bg-surface overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border">
              <div className="flex items-center bg-[#eef3f8] rounded px-3 h-[36px]">
                <svg
                  className="w-4 h-4 text-text-secondary shrink-0 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title, company, or keyword"
                  value={filters.query}
                  onChange={(e) =>
                    setFilters({ ...filters, query: e.target.value })
                  }
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none"
                />
              </div>
            </div>

            <div className="px-4 py-2 border-b border-border bg-[#f8f8f8]">
              <p className="text-xs font-semibold text-text-secondary">
                {filteredJobs.length.toLocaleString()} result{filteredJobs.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={job.id === selectedJobId}
                  onSelect={() => setSelectedJobId(job.id)}
                />
              ))}

              {filteredJobs.length === 0 && (
                <div className="text-center py-16 px-4">
                  <p className="text-text-secondary text-sm">
                    No jobs match your filters.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        query: "",
                        categories: [],
                        regions: [],
                        sources: [],
                      })
                    }
                    className="mt-2 text-sm text-linkedin-blue hover:underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Job detail panel */}
          <div className="flex-1 ml-4 border border-border rounded-lg bg-surface overflow-hidden">
            {selectedJob ? (
              <JobDetail job={selectedJob} />
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary text-sm">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-text-tertiary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2"
                    />
                  </svg>
                  <p>Select a job to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
