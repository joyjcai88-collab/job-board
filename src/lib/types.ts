export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: "linkedin" | "hn" | "themuse" | "web";
  postedAt: string | null;
  salary: string | null;
  tags: string[];
  industry: "technology" | "venture_capital" | "both";
  region: "silicon_valley" | "nyc" | "los_angeles" | "unknown";
}

export interface JobFilters {
  query: string;
  industries: string[];
  regions: string[];
  sources: string[];
}

export const REGIONS = [
  { key: "silicon_valley", label: "Silicon Valley / SF Bay Area" },
  { key: "nyc", label: "New York City" },
  { key: "los_angeles", label: "Los Angeles" },
] as const;

export const INDUSTRIES = [
  { key: "technology", label: "Technology" },
  { key: "venture_capital", label: "Venture Capital" },
] as const;

export const SOURCES = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "hn", label: "Hacker News" },
  { key: "themuse", label: "The Muse" },
  { key: "web", label: "Web Search" },
] as const;
