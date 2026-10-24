"use client";

import { useState, useMemo } from "react";
import { Job, JobFilters } from "@/lib/types";
import { parseResumeText, rankJobs } from "@/lib/matching";
import JobCard from "./JobCard";
import Filters from "./Filters";
import SiteChrome from "./SiteChrome";
import ResumeUpload from "./ResumeUpload";

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
  const [resumeText, setResumeText] = useState<string | null>(null);

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

  const scoredJobs = useMemo(() => {
    if (!resumeText) return filteredJobs.map((job) => ({ job, score: 0 }));
    const profile = parseResumeText(resumeText);
    const ranked = rankJobs(filteredJobs, profile);
    return ranked;
  }, [filteredJobs, resumeText]);

  const visibleJobs = scoredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < scoredJobs.length;

  return (
    <div className="min-h-screen bg-bg">
      <SiteChrome name="Job Board" />

      {/* Filters */}
      <div className="sticky top-0 z-40 bg-surface border-b border-border">
        <div className="max-w-[1228px] mx-auto px-4 sm:px-6 py-2">
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

      {/* Main content */}
      <main className="max-w-[1228px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Resume Upload */}
        <div className="mb-4 sm:mb-6">
          <ResumeUpload
            onResumeText={(text) => {
              setResumeText(text);
              setVisibleCount(PAGE_SIZE);
            }}
            isActive={!!resumeText}
            onClear={() => setResumeText(null)}
          />
        </div>

        {/* Job List */}
        <div className="flex flex-col gap-3">
          {visibleJobs.map(({ job, score }) => (
            <JobCard key={job.id} job={job} matchScore={resumeText ? score : null} />
          ))}
        </div>

        {scoredJobs.length === 0 && (
          <div className="text-center py-20 border border-border">
            <p className="font-serif text-[20px] text-text-primary">
              No jobs match your filters
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
              Adjust or reset the filters above
            </p>
            <button
              onClick={() => {
                setFilters({ query: "", categories: [], regions: [], sources: [], workModes: [] });
                setVisibleCount(PAGE_SIZE);
              }}
              className="mt-5 inline-flex items-center rounded-full bg-pill px-[26px] py-[11px] font-mono text-[13px] text-text-primary hover:bg-pill-hi transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="rounded-full bg-pill px-[26px] py-[11px] font-mono text-[13px] text-text-primary hover:bg-pill-hi transition-colors cursor-pointer"
            >
              Show more ({scoredJobs.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
