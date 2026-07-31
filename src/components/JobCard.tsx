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

  return (
    <div className="w-14 h-14 rounded-none border border-border bg-tile flex items-center justify-center shrink-0">
      <span className="font-mono text-[13px] tracking-[0.06em] text-text-secondary">
        {initials}
      </span>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em]">
      <span className="text-text-tertiary">{label}</span>
      <span className="text-text-primary">{children}</span>
    </span>
  );
}

function matchLabel(score: number): string {
  if (score >= 70) return "Strong match";
  if (score >= 40) return "Fair match";
  return "Low match";
}

function MatchBadge({ score }: { score: number }) {
  return (
    <div className="w-[104px] shrink-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
        Match
      </p>
      <p className="mt-1 font-serif text-[30px] leading-none text-text-primary">
        {score}
        <span className="text-[14px] text-text-tertiary">%</span>
      </p>
      <div className="mt-2 h-[2px] w-full bg-track">
        <div className="h-full bg-primary" style={{ width: `${score}%` }} />
      </div>
      <p
        className={`mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] ${
          score >= 70 ? "text-success" : "text-text-tertiary"
        }`}
      >
        {matchLabel(score)}
      </p>
    </div>
  );
}

export default function JobCard({ job, matchScore }: { job: Job; matchScore: number | null }) {
  const region = REGION_LABELS[job.region] || job.location;
  const category = CATEGORY_LABELS[job.category] || "Other";
  const source = SOURCE_LABELS[job.source] || "Web";
  const workMode = WORK_MODE_LABELS[job.workMode] || "";

  return (
    <div className="bg-surface border border-border rounded-none p-5 hover:bg-tile transition-colors">
      <div className="flex gap-4">
        <CompanyAvatar company={job.company} />
        {/* Match score on right side */}
        {matchScore !== null && (
          <div className="order-last ml-auto hidden sm:block">
            <MatchBadge score={matchScore} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                {job.postedAt && (
                  <span className="inline-flex items-center rounded-full bg-success-dim px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-success">
                    {timeAgo(job.postedAt)}
                  </span>
                )}
                {typeof job.companyStage === "string" && formatStage(job.companyStage) && (
                  <span className="inline-flex items-center rounded-full bg-pill px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-primary">
                    {formatStage(job.companyStage)}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-[18px] font-normal text-text-primary leading-snug tracking-[-0.01em]">
                {job.title}
              </h3>

              <p className="font-serif text-[14.5px] leading-[1.55] text-text-secondary mt-0.5">
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
            <Meta label="Location">{region}</Meta>
            {workMode && <Meta label="Mode">{workMode}</Meta>}
            {job.salary && <Meta label="Salary">{job.salary}</Meta>}
            <Meta label="Role">{category}</Meta>
          </div>

          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.tags.filter((t) => typeof t === "string").slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-pill px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-text-primary px-[26px] py-[11px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-surface hover:opacity-[.82] transition-opacity"
            >
              Apply
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            {matchScore !== null && (
              <span
                className={`sm:hidden font-mono text-[10px] uppercase tracking-[0.08em] ${
                  matchScore >= 70 ? "text-success" : "text-text-tertiary"
                }`}
              >
                {matchScore}% match
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
