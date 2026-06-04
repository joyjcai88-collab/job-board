import { Job } from "../types";

const LINKEDIN_SEARCHES: Array<{
  query: string;
  category: Job["category"];
  locations: Array<{ geoId: string; region: Job["region"]; label: string }>;
}> = [
  {
    query: "venture capital associate",
    category: "vc",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "venture capital principal",
    category: "vc",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "investor relations startup",
    category: "vc",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
    ],
  },
  {
    query: "chief of staff startup",
    category: "cos",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "head of growth startup",
    category: "gtm",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "GTM lead",
    category: "gtm",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
    ],
  },
  {
    query: "revenue operations manager startup",
    category: "gtm",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "partnerships manager startup",
    category: "bizops",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "business operations startup",
    category: "bizops",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "product manager healthtech",
    category: "healthtech",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "strategy operations health tech",
    category: "healthtech",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
  {
    query: "product manager AI startup",
    category: "product",
    locations: [
      { geoId: "90000084", region: "silicon_valley", label: "San Francisco Bay Area" },
      { geoId: "90000070", region: "nyc", label: "New York City Metropolitan Area" },
      { geoId: "90000049", region: "los_angeles", label: "Greater Los Angeles Area" },
    ],
  },
];

export function generateLinkedInJobs(): Job[] {
  return LINKEDIN_SEARCHES.flatMap((search) =>
    search.locations.map((loc) => ({
      id: `linkedin-${search.query}-${loc.region}`.replace(/\s+/g, "-"),
      title: `${search.query.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} roles`,
      company: "Multiple companies on LinkedIn",
      location: loc.label,
      description: `Browse the latest ${search.query} openings in ${loc.label}. Click to view current listings on LinkedIn.`,
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(search.query)}&location=${encodeURIComponent(loc.label)}&geoId=${loc.geoId}&f_TPR=r604800&sortBy=DD`,
      source: "linkedin" as const,
      postedAt: null,
      salary: null,
      tags: search.query.split(" "),
      category: search.category,
      region: loc.region,
      workMode: "unknown" as const,
      companyStage: null,
    }))
  );
}
