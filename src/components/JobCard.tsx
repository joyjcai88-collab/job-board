"use client";

import { Job } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  hn: "Hacker News",
  themuse: "The Muse",
  vc_boards: "VC Portfolio",
  web: "Web",
};

const REGION_LABELS: Record<string, string> = {
  silicon_valley: "San Francisco Bay Area",
  nyc: "New York",
  los_angeles: "Los Angeles",
  unknown: "Other",
};

const CATEGORY_LABELS: Record<string, string> = {
  vc: "Venture Capital",
  cos: "Chief of Staff",
  gtm: "GTM / Growth",
  product: "Product",
  bizops: "Biz Ops / Strategy",
  healthtech: "Healthtech",
  other: "Other",
};

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: "Onsite",
  remote: "Remote",
  hybrid: "Hybrid",
  unknown: "",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function formatStage(stage: string): string | null {
  const s = stage.toLowerCase();
  if (s === "series_unknown" || s === "other" || s === "unknown") return null;
  if (s.startsWith("series_")) return `Series ${s.replace("series_", "").toUpperCase()}`;
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

function CompanyAvatar({ company }: { company: string }) {
  const initials = company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const colorIdx = company.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  return (
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${colors[colorIdx]}`}>
      <span className="text-base font-bold">{initials}</span>
    </div>
  );
}

function InfoPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
      <span className="text-text-tertiary">{icon}</span>
      {children}
    </span>
  );
}

const LocationIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const WorkModeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const SalaryIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CategoryIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
  </svg>
);

export default function JobCard({ job }: { job: Job }) {
  const region = REGION_LABELS[job.region] || job.location;
  const category = CATEGORY_LABELS[job.category] || "Other";
  const source = SOURCE_LABELS[job.source] || "Web";
  const workMode = WORK_MODE_LABELS[job.workMode] || "";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all group">
      <div className="flex gap-4">
        <CompanyAvatar company={job.company} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {job.postedAt && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent-light text-accent text-xs font-medium">
                    {timeAgo(job.postedAt)}
                  </span>
                )}
                {typeof job.companyStage === "string" && formatStage(job.companyStage) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-tag-bg text-tag-text text-xs font-medium">
                    {formatStage(job.companyStage)}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-text-primary leading-snug group-hover:text-primary transition-colors">
                {job.title}
              </h3>

              <p className="text-sm text-text-secondary mt-0.5">
                {job.company}
                <span className="text-text-tertiary"> / </span>
                <span className="text-text-tertiary">{category}</span>
                {source && (
                  <>
                    <span className="text-text-tertiary"> · </span>
                    <span className="text-text-tertiary">{source}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3">
            <InfoPill icon={<LocationIcon />}>{region}</InfoPill>
            {workMode && <InfoPill icon={<WorkModeIcon />}>{workMode}</InfoPill>}
            {job.salary && <InfoPill icon={<SalaryIcon />}>{job.salary}</InfoPill>}
            <InfoPill icon={<CategoryIcon />}>{category}</InfoPill>
          </div>

          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.tags.filter((t) => typeof t === "string").slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-tag-bg text-tag-text text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Apply
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
