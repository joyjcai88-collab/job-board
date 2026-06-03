"use client";

import { Job } from "@/lib/types";

const SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn / Indeed",
  hn: "Hacker News",
  themuse: "The Muse",
  web: "Web",
};

const REGION_LABELS: Record<string, string> = {
  silicon_valley: "Silicon Valley",
  nyc: "NYC",
  los_angeles: "Los Angeles",
  unknown: "Other",
};

const CATEGORY_LABELS: Record<string, string> = {
  vc: "VC",
  cos: "Chief of Staff",
  gtm: "GTM / Growth",
  product: "Product",
  bizops: "Biz Ops",
  healthtech: "Healthtech",
  other: "Other",
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
    <div className="w-12 h-12 rounded bg-[#eef3f8] flex items-center justify-center shrink-0 border border-border">
      <span className="text-xs font-semibold text-linkedin-blue">{initials}</span>
    </div>
  );
}

export default function JobCard({
  job,
  selected,
  onSelect,
}: {
  job: Job;
  selected: boolean;
  onSelect: () => void;
}) {
  const region = REGION_LABELS[job.region] || job.location;
  const category = CATEGORY_LABELS[job.category] || "Other";
  const source = SOURCE_LABELS[job.source] || "Web";

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 border-b border-border flex gap-3 transition-colors cursor-pointer ${
        selected
          ? "bg-surface-active border-l-2 border-l-linkedin-blue"
          : "bg-surface hover:bg-surface-hover border-l-2 border-l-transparent"
      }`}
    >
      <CompanyAvatar company={job.company} />
      <div className="min-w-0 flex-1">
        <h3
          className={`text-sm font-semibold leading-snug mb-0.5 ${
            selected ? "text-linkedin-blue" : "text-linkedin-blue"
          }`}
        >
          {job.title}
        </h3>
        <p className="text-sm text-text-primary">{job.company}</p>
        <p className="text-xs text-text-secondary mt-0.5">
          {region} ({job.location})
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {job.salary && (
            <span className="text-xs text-text-secondary">{job.salary}</span>
          )}
          {job.salary && <span className="text-xs text-text-tertiary">·</span>}
          <span className="text-xs text-text-secondary">{category}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          {job.postedAt && (
            <span className="text-xs text-text-tertiary">
              {timeAgo(job.postedAt)}
            </span>
          )}
          {job.postedAt && <span className="text-xs text-text-tertiary">·</span>}
          <span className="text-xs text-text-tertiary">{source}</span>
        </div>
      </div>
    </button>
  );
}
