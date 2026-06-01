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
  category: "vc" | "cos" | "gtm" | "product" | "bizops" | "healthtech" | "other";
  region: "silicon_valley" | "nyc" | "los_angeles" | "unknown";
}

export interface JobFilters {
  query: string;
  categories: string[];
  regions: string[];
  sources: string[];
}

export const REGIONS = [
  { key: "silicon_valley", label: "Silicon Valley / SF Bay Area" },
  { key: "nyc", label: "New York City" },
  { key: "los_angeles", label: "Los Angeles" },
] as const;

export const CATEGORIES = [
  { key: "vc", label: "Venture Capital" },
  { key: "cos", label: "Chief of Staff" },
  { key: "gtm", label: "GTM / Growth" },
  { key: "product", label: "Product" },
  { key: "bizops", label: "Biz Ops / Strategy" },
  { key: "healthtech", label: "Healthtech" },
] as const;

export const SOURCES = [
  { key: "linkedin", label: "LinkedIn / Indeed" },
  { key: "hn", label: "Hacker News" },
  { key: "themuse", label: "The Muse" },
] as const;
