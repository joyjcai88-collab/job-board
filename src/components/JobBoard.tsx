"use client";

import { useState, useMemo } from "react";
import { Job, JobFilters } from "@/lib/types";
import JobCard from "./JobCard";
import Filters from "./Filters";

export default function JobBoard({ initialJobs }: { initialJobs: Job[] }) {
  const [filters, setFilters] = useState<JobFilters>({
    query: "",
    industries: [],
    regions: [],
    sources: [],
  });

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const searchable = `${job.title} ${job.company} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      if (filters.regions.length > 0 && !filters.regions.includes(job.region)) return false;

      if (filters.industries.length > 0) {
        if (job.industry === "both") {
          if (!filters.industries.some((i) => ["technology", "venture_capital"].includes(i))) return false;
        } else if (!filters.industries.includes(job.industry)) {
          return false;
        }
      }

      if (filters.sources.length > 0 && !filters.sources.includes(job.source)) return false;

      return true;
    });
  }, [initialJobs, filters]);

  return (
    <div>
      <Filters
        filters={filters}
        onChange={setFilters}
        totalCount={initialJobs.length}
        filteredCount={filteredJobs.length}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">No jobs match your filters.</p>
          <button
            onClick={() => setFilters({ query: "", industries: [], regions: [], sources: [] })}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
