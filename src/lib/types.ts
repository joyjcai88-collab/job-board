export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: "linkedin" | "hn" | "themuse" | "vc_boards" | "web";
  postedAt: string | null;
  salary: string | null;
  tags: string[];
  category: "vc" | "cos" | "gtm" | "product" | "bizops" | "healthtech" | "other";
  region: "silicon_valley" | "nyc" | "los_angeles" | "unknown";
  workMode: "onsite" | "remote" | "hybrid" | "unknown";
  companyStage: string | null;
}

export interface JobFilters {
  query: string;
  categories: string[];
  regions: string[];
  sources: string[];
  workModes: string[];
}

export const REGIONS = [
  { key: "silicon_valley", label: "San Francisco" },
  { key: "nyc", label: "New York" },
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
  { key: "vc_boards", label: "VC Job Boards" },
  { key: "linkedin", label: "LinkedIn / Indeed" },
  { key: "hn", label: "Hacker News" },
  { key: "themuse", label: "The Muse" },
] as const;

export const WORK_MODES = [
  { key: "onsite", label: "Onsite" },
  { key: "remote", label: "Remote" },
  { key: "hybrid", label: "Hybrid" },
] as const;
