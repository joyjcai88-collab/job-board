"use client";

import { useState, useMemo } from "react";
import { Job, JobFilters } from "@/lib/types";
import { parseResumeText, rankJobs } from "@/lib/matching";
import JobCard from "./JobCard";
import Filters from "./Filters";
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="max-w-[960px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 shrink-0 text-text-primary">
              <svg
                viewBox="0 0 26 26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                width="22"
                height="22"
                className="shrink-0"
                aria-hidden="true"
              >
                <path d="M4 22 L4 4 L22 13 Z" />
                <path d="M8 18.5 L8 7.5 L18.5 13 Z" />
              </svg>
              <h1 className="font-serif text-[21px] font-normal tracking-[-0.02em] leading-none whitespace-nowrap">
                <a
                  href="https://joyjcai.com"
                  className="hidden min-[560px]:inline hover:text-text-secondary transition-colors"
                >
                  Joy Cai
                </a>
                <span className="hidden min-[560px]:inline text-text-tertiary">
                  {" / "}
                </span>
                Job Board
              </h1>
            </div>

            <div className="flex-1 min-w-0 max-w-md">
              <div className="flex items-center gap-2 border-b border-border focus-within:border-primary transition-colors">
                <svg className="w-4 h-4 text-text-tertiary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title or company"
                  value={filters.query}
                  onChange={(e) => {
                    setFilters({ ...filters, query: e.target.value });
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className="flex-1 min-w-0 bg-transparent rounded-none border-none py-[7px] font-serif text-[15px] text-text-primary placeholder:text-text-tertiary outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-[57px] z-40 bg-surface border-b border-border">
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

      {/* Main content */}
      <main className="max-w-[960px] mx-auto px-4 py-6">
        {/* Resume Upload */}
        <div className="mb-6">
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
              className="mt-5 inline-flex items-center rounded-full bg-pill px-[26px] py-[11px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-text-primary hover:bg-pill-hi transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="rounded-full bg-pill px-[26px] py-[11px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-text-primary hover:bg-pill-hi transition-colors cursor-pointer"
            >
              Show more ({scoredJobs.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
