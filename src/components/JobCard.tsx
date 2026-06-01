"use client";

import { Job } from "@/lib/types";

const SOURCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  linkedin: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-300", label: "LinkedIn" },
  hn: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300", label: "Hacker News" },
  themuse: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-300", label: "The Muse" },
  web: { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-300", label: "Web" },
};

const REGION_LABELS: Record<string, string> = {
  silicon_valley: "Silicon Valley",
  nyc: "NYC",
  los_angeles: "Los Angeles",
  unknown: "Other",
};

const INDUSTRY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  technology: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-800 dark:text-emerald-300", label: "Tech" },
  venture_capital: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-300", label: "VC" },
  both: { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-800 dark:text-indigo-300", label: "Tech + VC" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export default function JobCard({ job }: { job: Job }) {
  const source = SOURCE_STYLES[job.source] || SOURCE_STYLES.web;
  const industry = INDUSTRY_STYLES[job.industry] || INDUSTRY_STYLES.technology;
  const region = REGION_LABELS[job.region] || job.location;

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate text-base">
            {job.title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">{job.company}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${source.bg} ${source.text}`}>
            {source.label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center text-xs text-zinc-500 dark:text-zinc-400">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {region}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${industry.bg} ${industry.text}`}>
          {industry.label}
        </span>
        {job.postedAt && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {timeAgo(job.postedAt)}
          </span>
        )}
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
        {job.description}
      </p>

      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
