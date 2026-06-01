import { Job } from "../types";

const MUSE_LOCATIONS = [
  { museValue: "San Francisco, CA", region: "silicon_valley" as const },
  { museValue: "New York, NY", region: "nyc" as const },
  { museValue: "Los Angeles, CA", region: "los_angeles" as const },
];

const MUSE_CATEGORIES = [
  "Business Development",
  "Finance",
  "Product",
  "Operations",
  "Strategy",
  "Healthcare",
  "Marketing",
  "Project Management",
];

const ROLE_PATTERNS: Array<{ pattern: RegExp; category: Job["category"] }> = [
  { pattern: /venture\s*capital|vc\s|investor|fund\s+manager|portfolio/i, category: "vc" },
  { pattern: /chief\s+of\s+staff/i, category: "cos" },
  { pattern: /\bgtm\b|go.to.market|growth|revenue\s+op|revops|demand\s+gen|sales\s+op|outbound|lifecycle/i, category: "gtm" },
  { pattern: /product\s+(manager|lead|head|director|owner)/i, category: "product" },
  { pattern: /biz\s*ops|business\s+op|strategy|partnerships|corp\s*dev|strategic/i, category: "bizops" },
  { pattern: /health|telehealth|clinical|medtech|biotech|pharma|medical|patient/i, category: "healthtech" },
];

interface MuseJob {
  id: number;
  name: string;
  company?: { name?: string };
  locations?: Array<{ name?: string }>;
  contents?: string;
  refs?: { landing_page?: string };
  publication_date?: string;
  categories?: Array<{ name?: string }>;
  tags?: Array<{ name?: string; short_name?: string }>;
  levels?: Array<{ name?: string; short_name?: string }>;
}

function classifyCategory(job: MuseJob): Job["category"] | null {
  const text = `${job.name} ${job.contents || ""}`;
  for (const { pattern, category } of ROLE_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

function classifyRegion(locations: Array<{ name?: string }>): { region: Job["region"]; label: string } {
  for (const loc of locations) {
    const name = loc.name || "";
    if (/san francisco|palo alto|mountain view|menlo park|silicon valley|san jose|sunnyvale|cupertino|redwood|santa clara/i.test(name)) {
      return { region: "silicon_valley", label: name };
    }
    if (/new york|nyc|manhattan|brooklyn/i.test(name)) {
      return { region: "nyc", label: name };
    }
    if (/los angeles|santa monica|venice|culver city/i.test(name)) {
      return { region: "los_angeles", label: name };
    }
  }
  return { region: "unknown", label: locations[0]?.name || "Unknown" };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchMuseJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const seenIds = new Set<number>();

  try {
    const fetches = MUSE_LOCATIONS.flatMap((loc) =>
      MUSE_CATEGORIES.map(async (cat) => {
        const url = `https://www.themuse.com/api/public/jobs?location=${encodeURIComponent(loc.museValue)}&category=${encodeURIComponent(cat)}&page=0`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.results || []) as MuseJob[];
      })
    );

    const results = await Promise.all(fetches);

    for (const batch of results) {
      for (const job of batch) {
        if (seenIds.has(job.id)) continue;
        seenIds.add(job.id);

        const locations = job.locations || [];
        const { region, label } = classifyRegion(locations);
        if (region === "unknown") continue;

        const category = classifyCategory(job);
        if (!category) continue;

        const desc = stripHtml(job.contents || "");

        jobs.push({
          id: `muse-${job.id}`,
          title: job.name,
          company: job.company?.name || "Unknown",
          location: label,
          description: desc.length > 500 ? desc.substring(0, 500) + "..." : desc,
          url: job.refs?.landing_page || `https://www.themuse.com/jobs/${job.id}`,
          source: "themuse",
          postedAt: job.publication_date || null,
          salary: null,
          tags: (job.categories || []).map((c) => c.name || "").filter(Boolean).slice(0, 5),
          category,
          region,
        });
      }
    }
  } catch (e) {
    console.error("Failed to fetch Muse jobs:", e);
  }

  return jobs;
}
