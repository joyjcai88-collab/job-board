import { Job } from "../types";

const LINKEDIN_SEARCHES = [
  {
    query: "software engineer",
    industry: "technology" as const,
    locations: [
      { geoId: "90000084", region: "silicon_valley" as const, label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc" as const, label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles" as const, label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "venture capital analyst",
    industry: "venture_capital" as const,
    locations: [
      { geoId: "90000084", region: "silicon_valley" as const, label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc" as const, label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles" as const, label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "product manager",
    industry: "technology" as const,
    locations: [
      { geoId: "90000084", region: "silicon_valley" as const, label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc" as const, label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles" as const, label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "venture capital associate",
    industry: "venture_capital" as const,
    locations: [
      { geoId: "90000084", region: "silicon_valley" as const, label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc" as const, label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles" as const, label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "data scientist",
    industry: "technology" as const,
    locations: [
      { geoId: "90000084", region: "silicon_valley" as const, label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc" as const, label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles" as const, label: "Greater Los Angeles Area" },
    ],
  },
];

export function generateLinkedInJobs(): Job[] {
  const jobs: Job[] = [];

  for (const search of LINKEDIN_SEARCHES) {
    for (const loc of search.locations) {
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(search.query)}&location=${encodeURIComponent(loc.label)}&geoId=${loc.geoId}&f_TPR=r604800&sortBy=DD`;

      jobs.push({
        id: `linkedin-${search.query}-${loc.region}`.replace(/\s+/g, "-"),
        title: `${search.query.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} roles`,
        company: "Multiple companies on LinkedIn",
        location: loc.label,
        description: `Browse the latest ${search.query} openings in ${loc.label}. Click to view current listings on LinkedIn.`,
        url: searchUrl,
        source: "linkedin",
        postedAt: null,
        salary: null,
        tags: search.query.split(" "),
        industry: search.industry,
        region: loc.region,
      });
    }
  }

  return jobs;
}
