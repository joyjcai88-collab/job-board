import { Job } from "../types";

const BOARDS = [
  { domain: "jobs.sequoiacap.com", id: "sequoia-capital", label: "Sequoia Capital" },
  { domain: "jobs.a16z.com", id: "andreessen-horowitz", label: "a16z" },
  { domain: "jobs.greylock.com", id: "greylock-partners", label: "Greylock" },
  { domain: "jobs.firstround.com", id: "first-round-capital", label: "First Round" },
  { domain: "jobs.bvp.com", id: "bessemer-ventures", label: "Bessemer" },
  { domain: "jobs.kleinerperkins.com", id: "kleiner-perkins", label: "Kleiner Perkins" },
  { domain: "jobs.usv.com", id: "union-square-ventures", label: "USV" },
  { domain: "jobs.lsvp.com", id: "lightspeed", label: "Lightspeed" },
  { domain: "jobs.battery.com", id: "battery-ventures", label: "Battery Ventures" },
  { domain: "careers.nea.com", id: "nea", label: "NEA" },
  { domain: "jobs.felicis.com", id: "felicis", label: "Felicis" },
];

const LOCATION_FILTERS = [
  "San Francisco, California",
  "New York, New York",
  "Los Angeles, California",
];

const ROLE_PATTERNS: Array<{ pattern: RegExp; category: Job["category"] }> = [
  { pattern: /venture\s*capital|vc\s|investor|fund\s+manager|portfolio\s+(?:ops|manager|associate)/i, category: "vc" },
  { pattern: /chief\s+of\s+staff/i, category: "cos" },
  { pattern: /\bgtm\b|go.to.market|growth|revenue\s+op|revops|demand\s+gen|sales\s+op|outbound|lifecycle|marketing/i, category: "gtm" },
  { pattern: /product\s+(manager|lead|head|director|owner)|product\s+design/i, category: "product" },
  { pattern: /biz\s*ops|business\s+op|strategy|partnerships|corp\s*dev|strategic|operations\s+(manager|lead|head|director)/i, category: "bizops" },
  { pattern: /health|telehealth|clinical|medtech|biotech|pharma|medical|patient/i, category: "healthtech" },
];

function classifyRegion(locations: string[]): { region: Job["region"]; label: string } {
  for (const loc of locations) {
    const lower = loc.toLowerCase();
    if (/san francisco|palo alto|mountain view|menlo park|san jose|sunnyvale|cupertino|redwood|santa clara|san mateo|south san francisco/i.test(lower)) {
      return { region: "silicon_valley", label: loc };
    }
    if (/new york|nyc|manhattan|brooklyn/i.test(lower)) {
      return { region: "nyc", label: loc };
    }
    if (/los angeles|santa monica|venice|culver city/i.test(lower)) {
      return { region: "los_angeles", label: loc };
    }
  }
  return { region: "unknown", label: locations[0] || "Unknown" };
}

function classifyCategory(title: string, departments: string[]): Job["category"] | null {
  const text = `${title} ${departments.join(" ")}`;
  for (const { pattern, category } of ROLE_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

function formatSalary(salary: ConsiderSalary | null): string | null {
  if (!salary || (!salary.minValue && !salary.maxValue)) return null;
  const period = salary.period?.value === "year" ? "/yr" : salary.period?.value === "hour" ? "/hr" : "";
  const fmt = (n: number) => {
    if (salary.period?.value === "year" && n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n.toLocaleString()}`;
  };
  if (salary.minValue && salary.maxValue) return `${fmt(salary.minValue)} - ${fmt(salary.maxValue)}${period}`;
  if (salary.minValue) return `${fmt(salary.minValue)}+${period}`;
  if (salary.maxValue) return `Up to ${fmt(salary.maxValue)}${period}`;
  return null;
}

function extractTags(job: ConsiderJob): string[] {
  const tags: string[] = [];
  if (job.remote) tags.push("remote");
  if (job.hybrid) tags.push("hybrid");
  const title = job.title.toLowerCase();
  const keywords = ["ai", "saas", "fintech", "healthtech", "startup", "growth", "gtm", "venture", "product", "operations"];
  for (const kw of keywords) {
    if (title.includes(kw)) tags.push(kw);
  }
  for (const dept of job.departments || []) {
    tags.push(dept.toLowerCase());
  }
  return [...new Set(tags)].slice(0, 6);
}

interface ConsiderSalary {
  period?: { label: string; value: string };
  minValue?: number;
  maxValue?: number;
  currency?: { label: string; value: string };
  isOriginal?: boolean;
}

interface ConsiderJob {
  title: string;
  jobId: string;
  url: string;
  applyUrl: string;
  companyName: string;
  companySlug: string;
  companyDomain: string;
  locations: string[];
  normalizedLocations?: Array<{ id: string; label: string; value: string }>;
  salary: ConsiderSalary | null;
  remote: boolean;
  hybrid: boolean;
  departments: string[];
  timeStamp: string;
  stages?: string[];
  markets?: string[];
  skills?: Array<{ label: string }>;
}

interface ConsiderResponse {
  jobs: ConsiderJob[];
  total: number;
  meta: { size: number; sequence?: string };
}

async function fetchBoardJobs(board: typeof BOARDS[number]): Promise<Job[]> {
  const jobs: Job[] = [];

  try {
    for (const location of LOCATION_FILTERS) {
      const res = await fetch(`https://${board.domain}/api-boards/search-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta: { size: 50 },
          board: { id: board.id, isParent: true },
          query: {
            titlePrefix: "",
            promoteFeatured: true,
            locations: [location],
          },
          grouped: false,
        }),
        next: { revalidate: 3600 },
      });

      if (!res.ok) continue;
      const data = (await res.json()) as ConsiderResponse;

      for (const j of data.jobs || []) {
        const { region, label } = classifyRegion(j.locations);
        if (region === "unknown") continue;

        const category = classifyCategory(j.title, j.departments || []);
        if (!category) continue;

        jobs.push({
          id: `consider-${board.id}-${j.jobId}`,
          title: j.title,
          company: j.companyName,
          location: label,
          description: `${j.title} at ${j.companyName}. ${j.departments?.join(", ") || ""}. ${j.remote ? "Remote" : j.hybrid ? "Hybrid" : "On-site"}.`,
          url: j.applyUrl || j.url,
          source: "vc_boards",
          postedAt: j.timeStamp || null,
          salary: formatSalary(j.salary),
          tags: extractTags(j),
          category,
          region,
          workMode: j.remote ? "remote" : j.hybrid ? "hybrid" : "onsite",
          companyStage: typeof j.stages?.[0] === "string" ? j.stages[0] : null,
        });
      }
    }
  } catch (e) {
    console.error(`Failed to fetch Consider jobs from ${board.label}:`, e);
  }

  return jobs;
}

export async function fetchConsiderJobs(): Promise<Job[]> {
  const results = await Promise.all(BOARDS.map(fetchBoardJobs));
  const allJobs = results.flat();

  const seenIds = new Set<string>();
  return allJobs.filter((job) => {
    const key = `${job.company}-${job.title}-${job.location}`;
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });
}
