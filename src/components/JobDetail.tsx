"use client";

import { Job } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn / Indeed",
  hn: "Hacker News",
  themuse: "The Muse",
  vc_boards: "VC Job Boards",
  web: "Web",
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

const REGION_LABELS: Record<string, string> = {
  silicon_valley: "Silicon Valley",
  nyc: "New York City",
  los_angeles: "Los Angeles",
  unknown: "Other",
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

function CompanyAvatar({ company }: { company: string }) {
  const initials = company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="w-12 h-12 rounded-none bg-tile flex items-center justify-center shrink-0 border border-border">
      <span className="font-mono text-[12px] tracking-[0.06em] text-text-secondary">
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

export default function JobDetail({ job }: { job: Job }) {
  const region = REGION_LABELS[job.region] || job.location;
  const category = CATEGORY_LABELS[job.category] || "Other";
  const source = SOURCE_LABELS[job.source] || "Web";

  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <CompanyAvatar company={job.company} />
          <div className="min-w-0">
            <p className="font-serif text-[15px] text-text-secondary">{job.company}</p>
          </div>
        </div>

        <h2 className="font-serif text-[32px] font-normal tracking-[-0.025em] text-text-primary mb-3 leading-tight">
          {job.title}
        </h2>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-2">
          <Meta label="Location">{region}</Meta>
          {job.postedAt && <Meta label="Posted">{timeAgo(job.postedAt)}</Meta>}
          {job.salary && <Meta label="Salary">{job.salary}</Meta>}
          <Meta label="Role">{category}</Meta>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-6 mb-7">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-text-primary px-[26px] py-[11px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-surface hover:opacity-[.82] transition-opacity"
          >
            Apply on {source}
          </a>
          <button className="inline-flex items-center gap-2 rounded-full bg-pill px-[26px] py-[11px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-text-primary hover:bg-pill-hi transition-colors cursor-pointer">
            Save
          </button>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary mb-3">
            About the job
          </h3>
          <p className="font-serif text-[15px] text-text-secondary leading-[1.55] whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {job.tags.length > 0 && (
          <div className="border-t border-border mt-6 pt-5">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-tertiary mb-3">
              Skills &amp; Keywords
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-pill px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
