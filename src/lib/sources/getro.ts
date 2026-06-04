import { Job } from "../types";

const BOARDS = [
  { domain: "jobs.khoslaventures.com", label: "Khosla Ventures" },
  { domain: "jobs.accel.com", label: "Accel" },
  { domain: "jobs.generalcatalyst.com", label: "General Catalyst" },
  { domain: "jobs.insightpartners.com", label: "Insight Partners" },
  { domain: "jobs.primary.vc", label: "Primary Venture Partners" },
  { domain: "careers.wing.vc", label: "Wing Venture Capital" },
  { domain: "jobs.craftventures.com", label: "Craft Ventures" },
  { domain: "foundersfund.getro.com", label: "Founders Fund" },
  { domain: "careers.redpoint.com", label: "Redpoint Ventures" },
  { domain: "jobs.sapphireventures.com", label: "Sapphire Ventures" },
  { domain: "jobs.dcvc.com", label: "DCVC" },
  { domain: "jobs.menlovc.com", label: "Menlo Ventures" },
];

const ROLE_PATTERNS: Array<{ pattern: RegExp; category: Job["category"] }> = [
  { pattern: /venture\s*capital|vc\s|investor|fund\s+manager|portfolio\s+(?:ops|manager|associate)/i, category: "vc" },
  { pattern: /chief\s+of\s+staff/i, category: "cos" },
  { pattern: /\bgtm\b|go.to.market|growth|revenue\s+op|revops|demand\s+gen|sales\s+op|outbound|lifecycle|marketing/i, category: "gtm" },
  { pattern: /product\s+(manager|lead|head|director|owner)|product\s+design/i, category: "product" },
  { pattern: /biz\s*ops|business\s+op|strategy|partnerships|corp\s*dev|strategic|operations\s+(manager|lead|head|director)/i, category: "bizops" },
  { pattern: /health|telehealth|clinical|medtech|biotech|pharma|medical|patient/i, category: "healthtech" },
];

function classifyRegion(locations: string[]): { region: Job["region"]; label: string } | null {
  for (const loc of locations) {
    const lower = loc.toLowerCase();
    if (/san francisco|palo alto|mountain view|menlo park|san jose|sunnyvale|cupertino|redwood|santa clara|san mateo|south san francisco|fremont|oakland|berkeley/.test(lower)) {
      return { region: "silicon_valley", label: loc };
    }
    if (/new york|nyc|manhattan|brooklyn|jersey city/.test(lower)) {
      return { region: "nyc", label: loc };
    }
    if (/los angeles|santa monica|venice|culver city|pasadena|burbank|beverly hills/.test(lower)) {
      return { region: "los_angeles", label: loc };
    }
  }
  return null;
}

function classifyCategory(title: string): Job["category"] | null {
  for (const { pattern, category } of ROLE_PATTERNS) {
    if (pattern.test(title)) return category;
  }
  return null;
}

function formatSalary(minCents: number | null, maxCents: number | null, currency: string | null, period: string | null): string | null {
  if (!minCents && !maxCents) return null;
  const suffix = period === "year" ? "/yr" : period === "hour" ? "/hr" : "";
  const fmt = (cents: number) => {
    const dollars = cents / 100;
    if (period === "year" && dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}k`;
    return `$${dollars.toLocaleString()}`;
  };
  if (minCents && maxCents) return `${fmt(minCents)} - ${fmt(maxCents)}${suffix}`;
  if (minCents) return `${fmt(minCents)}+${suffix}`;
  if (maxCents) return `Up to ${fmt(maxCents)}${suffix}`;
  return null;
}

interface GetroJob {
  id: number;
  title: string;
  slug: string;
  url: string;
  createdAt: number;
  workMode: string;
  seniority: string | null;
  locations: string[];
  compensationAmountMinCents: number | null;
  compensationAmountMaxCents: number | null;
  compensationCurrency: string | null;
  compensationPeriod: string | null;
  skills: string[];
  organization: {
    id: number;
    name: string;
    slug: string;
    stage: string;
    logoUrl: string;
    industryTags: string[];
  };
}

interface GetroPageData {
  props: {
    pageProps: {
      initialState: {
        jobs: {
          found: GetroJob[];
          total: number;
        };
      };
      network: {
        id: string;
        label: string;
      };
    };
  };
  buildId: string;
}

async function fetchBoardJobs(board: typeof BOARDS[number]): Promise<Job[]> {
  const jobs: Job[] = [];

  try {
    const res = await fetch(`https://${board.domain}/jobs`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
      },
      next: { revalidate: 3600 },
      redirect: "follow",
    });

    if (!res.ok) return jobs;
    const html = await res.text();

    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) return jobs;

    const data = JSON.parse(match[1]) as GetroPageData;
    const found = data.props?.pageProps?.initialState?.jobs?.found || [];

    for (const j of found) {
      const regionInfo = classifyRegion(j.locations);
      if (!regionInfo) continue;

      const category = classifyCategory(j.title);
      if (!category) continue;

      const tags: string[] = [];
      if (j.workMode === "remote") tags.push("remote");
      if (j.workMode === "hybrid") tags.push("hybrid");
      for (const tag of j.organization.industryTags || []) {
        tags.push(tag.toLowerCase());
      }
      if (j.skills) tags.push(...j.skills.map((s) => s.toLowerCase()));

      jobs.push({
        id: `getro-${board.domain}-${j.id}`,
        title: j.title,
        company: j.organization.name,
        location: regionInfo.label,
        description: `${j.title} at ${j.organization.name}. ${j.workMode === "remote" ? "Remote" : j.workMode === "hybrid" ? "Hybrid" : "On-site"}. Stage: ${j.organization.stage || "N/A"}.`,
        url: j.url || `https://${board.domain}/jobs/${j.slug}`,
        source: "vc_boards",
        postedAt: j.createdAt ? new Date(j.createdAt * 1000).toISOString() : null,
        salary: formatSalary(j.compensationAmountMinCents, j.compensationAmountMaxCents, j.compensationCurrency, j.compensationPeriod),
        tags: [...new Set(tags)].slice(0, 6),
        category,
        region: regionInfo.region,
        workMode: j.workMode === "remote" ? "remote" : j.workMode === "hybrid" ? "hybrid" : "onsite",
        companyStage: j.organization.stage || null,
      });
    }
  } catch (e) {
    console.error(`Failed to fetch Getro jobs from ${board.label}:`, e);
  }

  return jobs;
}

export async function fetchGetroJobs(): Promise<Job[]> {
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
