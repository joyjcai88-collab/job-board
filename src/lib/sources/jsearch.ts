import { Job } from "../types";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const JSEARCH_HOST = "jsearch.p.rapidapi.com";

const SEARCHES: Array<{ query: string; category: Job["category"]; locations: Array<{ q: string; region: Job["region"] }> }> = [
  {
    query: "venture capital associate",
    category: "vc",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
      { q: "Los Angeles, CA", region: "los_angeles" },
    ],
  },
  {
    query: "venture capital analyst",
    category: "vc",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
    ],
  },
  {
    query: "chief of staff startup",
    category: "cos",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
      { q: "Los Angeles, CA", region: "los_angeles" },
    ],
  },
  {
    query: "head of growth",
    category: "gtm",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
    ],
  },
  {
    query: "GTM lead",
    category: "gtm",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
    ],
  },
  {
    query: "revenue operations manager",
    category: "gtm",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
    ],
  },
  {
    query: "product manager healthtech",
    category: "healthtech",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
      { q: "Los Angeles, CA", region: "los_angeles" },
    ],
  },
  {
    query: "business operations startup",
    category: "bizops",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
    ],
  },
  {
    query: "strategic partnerships manager",
    category: "bizops",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
    ],
  },
  {
    query: "product manager AI startup",
    category: "product",
    locations: [
      { q: "San Francisco, CA", region: "silicon_valley" },
      { q: "New York, NY", region: "nyc" },
    ],
  },
];

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_city: string | null;
  job_state: string | null;
  job_country: string;
  job_description: string;
  job_apply_link: string;
  job_posted_at_datetime_utc: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_employment_type: string | null;
  job_is_remote: boolean;
}

function classifyRegion(city: string | null, state: string | null): Job["region"] {
  const loc = `${city || ""} ${state || ""}`.toLowerCase();
  if (/san francisco|palo alto|mountain view|menlo park|san jose|sunnyvale|cupertino|redwood|santa clara|san mateo|fremont|oakland|berkeley/.test(loc)) {
    return "silicon_valley";
  }
  if (/new york|nyc|manhattan|brooklyn|jersey city/.test(loc)) {
    return "nyc";
  }
  if (/los angeles|santa monica|venice|culver city|pasadena|burbank|beverly hills/.test(loc)) {
    return "los_angeles";
  }
  return "unknown";
}

function formatSalary(job: JSearchJob): string | null {
  if (!job.job_min_salary && !job.job_max_salary) return null;
  const currency = job.job_salary_currency || "USD";
  const period = job.job_salary_period === "YEAR" ? "/yr" : job.job_salary_period === "MONTH" ? "/mo" : "";
  const fmt = (n: number) => currency === "USD" ? `$${(n / 1000).toFixed(0)}k` : `${n.toLocaleString()} ${currency}`;
  if (job.job_min_salary && job.job_max_salary) return `${fmt(job.job_min_salary)} - ${fmt(job.job_max_salary)}${period}`;
  if (job.job_min_salary) return `${fmt(job.job_min_salary)}+${period}`;
  if (job.job_max_salary) return `Up to ${fmt(job.job_max_salary)}${period}`;
  return null;
}

function extractTags(job: JSearchJob): string[] {
  const tags: string[] = [];
  if (job.job_employment_type) tags.push(job.job_employment_type.replace("_", " ").toLowerCase());
  if (job.job_is_remote) tags.push("remote");

  const title = job.job_title.toLowerCase();
  const keywords = ["ai", "saas", "fintech", "healthtech", "startup", "growth", "gtm", "venture", "product"];
  for (const kw of keywords) {
    if (title.includes(kw)) tags.push(kw);
  }
  return [...new Set(tags)].slice(0, 5);
}

export async function fetchJSearchJobs(): Promise<Job[]> {
  if (!RAPIDAPI_KEY) return [];

  const jobs: Job[] = [];
  const seenIds = new Set<string>();

  const fetches = SEARCHES.flatMap((search) =>
    search.locations.map(async (loc) => {
      try {
        const url = `https://${JSEARCH_HOST}/search?query=${encodeURIComponent(search.query)}&location=${encodeURIComponent(loc.q)}&date_posted=week&num_pages=1`;
        const res = await fetch(url, {
          headers: {
            "x-rapidapi-host": JSEARCH_HOST,
            "x-rapidapi-key": RAPIDAPI_KEY,
          },
          next: { revalidate: 3600 },
        });

        if (!res.ok) return [];
        const data = await res.json();
        return ((data.data || []) as JSearchJob[]).map((j) => ({ job: j, search, loc }));
      } catch {
        return [];
      }
    })
  );

  const results = await Promise.all(fetches);

  for (const batch of results) {
    for (const { job: j, search, loc } of batch) {
      if (seenIds.has(j.job_id)) continue;
      seenIds.add(j.job_id);

      const region = classifyRegion(j.job_city, j.job_state);
      if (region === "unknown" && loc.region !== "unknown") {
        // trust the search location if the job doesn't have a parseable city
      }
      const finalRegion = region !== "unknown" ? region : loc.region;

      const desc = j.job_description.replace(/\n+/g, " ").trim();

      jobs.push({
        id: `jsearch-${j.job_id}`,
        title: j.job_title,
        company: j.employer_name,
        location: [j.job_city, j.job_state].filter(Boolean).join(", ") || loc.q,
        description: desc.length > 500 ? desc.substring(0, 500) + "..." : desc,
        url: j.job_apply_link,
        source: "linkedin",
        postedAt: j.job_posted_at_datetime_utc,
        salary: formatSalary(j),
        tags: extractTags(j),
        category: search.category,
        region: finalRegion,
      });
    }
  }

  return jobs;
}
