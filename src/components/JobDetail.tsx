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
    <div className="w-12 h-12 rounded bg-[#eef3f8] flex items-center justify-center shrink-0 border border-border">
      <span className="text-sm font-semibold text-linkedin-blue">{initials}</span>
    </div>
  );
}

export default function JobDetail({ job }: { job: Job }) {
  const region = REGION_LABELS[job.region] || job.location;
  const category = CATEGORY_LABELS[job.category] || "Other";
  const source = SOURCE_LABELS[job.source] || "Web";

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <CompanyAvatar company={job.company} />
          <div className="min-w-0">
            <p className="text-sm text-text-secondary">{job.company}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-2 leading-snug">
          {job.title}
        </h2>

        <div className="flex flex-wrap items-center gap-1 text-sm text-text-secondary mb-1">
          <span>{region}</span>
          {job.postedAt && (
            <>
              <span>·</span>
              <span className="text-linkedin-green font-medium">{timeAgo(job.postedAt)}</span>
            </>
          )}
        </div>

        {job.salary && (
          <p className="text-sm text-text-secondary mb-3">{job.salary}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-4 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-sm text-text-primary">
            <svg className="w-4 h-4 text-linkedin-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {category}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-sm text-text-primary">
            <svg className="w-4 h-4 text-linkedin-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-linkedin-blue hover:bg-linkedin-blue-hover text-white text-sm font-semibold rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6V8H5V19H16V14H18V20C18 20.55 17.55 21 17 21H4C3.45 21 3 20.55 3 20V7C3 6.45 3.45 6 4 6H10ZM21 3V11H19V6.41L11.17 14.24L9.76 12.83L17.59 5H13V3H21Z" />
            </svg>
            Apply on {source}
          </a>
          <button className="inline-flex items-center gap-2 px-6 py-2.5 border border-linkedin-blue text-linkedin-blue text-sm font-semibold rounded-full hover:bg-linkedin-light-blue hover:border-linkedin-blue-hover transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save
          </button>
        </div>

        <div className="border-t border-border pt-5">
          <h3 className="text-base font-semibold text-text-primary mb-3">About the job</h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {job.tags.length > 0 && (
          <div className="border-t border-border mt-5 pt-5">
            <h3 className="text-base font-semibold text-text-primary mb-3">Skills & Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-[#eef3f8] text-sm text-linkedin-blue font-medium"
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
