import { Job } from "../types";

const MUSE_LOCATIONS = [
  { museValue: "San Francisco, CA", region: "silicon_valley" as const },
  { museValue: "New York, NY", region: "nyc" as const },
  { museValue: "Los Angeles, CA", region: "los_angeles" as const },
];

const TECH_CATEGORIES = ["Software Engineering", "Data Science", "Product", "Design and UX", "IT"];
const VC_CATEGORIES = ["Finance", "Business Development"];

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

function classifyMuseJob(job: MuseJob): Job["industry"] {
  const categories = (job.categories || []).map(c => c.name || "");
  const title = job.name.toLowerCase();
  const desc = (job.contents || "").toLowerCase();

  const isVC =
    categories.some(c => VC_CATEGORIES.includes(c)) ||
    /venture|capital|fund|investment|portfolio/.test(title) ||
    /venture capital|vc fund|investment fund/.test(desc);

  const isTech =
    categories.some(c => TECH_CATEGORIES.includes(c)) ||
    /engineer|developer|software|data|product|design|devops|cloud|ai|ml/.test(title);

  if (isVC && isTech) return "both";
  if (isVC) return "venture_capital";
  return "technology";
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
    const fetches = MUSE_LOCATIONS.map(async (loc) => {
      const url = `https://www.themuse.com/api/public/jobs?location=${encodeURIComponent(loc.museValue)}&category=Software%20Engineering&category=Data%20Science&category=Product&category=Finance&page=0`;

      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []) as MuseJob[];
    });

    const results = await Promise.all(fetches);

    for (const batch of results) {
      for (const job of batch) {
        if (seenIds.has(job.id)) continue;
        seenIds.add(job.id);

        const locations = job.locations || [];
        const { region, label } = classifyRegion(locations);
        if (region === "unknown") continue;

        const industry = classifyMuseJob(job);
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
          tags: (job.categories || []).map(c => c.name || "").filter(Boolean).slice(0, 5),
          industry,
          region,
        });
      }
    }
  } catch (e) {
    console.error("Failed to fetch Muse jobs:", e);
  }

  return jobs;
}
