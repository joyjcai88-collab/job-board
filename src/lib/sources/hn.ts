import { Job } from "../types";

const LOCATION_PATTERNS: Record<string, { region: Job["region"]; label: string }> = {
  "san francisco": { region: "silicon_valley", label: "San Francisco, CA" },
  "sf": { region: "silicon_valley", label: "San Francisco, CA" },
  "bay area": { region: "silicon_valley", label: "SF Bay Area" },
  "palo alto": { region: "silicon_valley", label: "Palo Alto, CA" },
  "mountain view": { region: "silicon_valley", label: "Mountain View, CA" },
  "menlo park": { region: "silicon_valley", label: "Menlo Park, CA" },
  "sunnyvale": { region: "silicon_valley", label: "Sunnyvale, CA" },
  "cupertino": { region: "silicon_valley", label: "Cupertino, CA" },
  "san jose": { region: "silicon_valley", label: "San Jose, CA" },
  "redwood city": { region: "silicon_valley", label: "Redwood City, CA" },
  "santa clara": { region: "silicon_valley", label: "Santa Clara, CA" },
  "new york": { region: "nyc", label: "New York, NY" },
  "nyc": { region: "nyc", label: "New York, NY" },
  "manhattan": { region: "nyc", label: "New York, NY" },
  "brooklyn": { region: "nyc", label: "Brooklyn, NY" },
  "los angeles": { region: "los_angeles", label: "Los Angeles, CA" },
  "la": { region: "los_angeles", label: "Los Angeles, CA" },
  "santa monica": { region: "los_angeles", label: "Santa Monica, CA" },
  "venice": { region: "los_angeles", label: "Venice, CA" },
  "culver city": { region: "los_angeles", label: "Culver City, CA" },
};

const ROLE_PATTERNS: Array<{ pattern: RegExp; category: Job["category"] }> = [
  { pattern: /venture\s*capital|vc\s+(associate|principal|analyst|partner)|investor|fund\s+manager/i, category: "vc" },
  { pattern: /chief\s+of\s+staff|cos\b/i, category: "cos" },
  { pattern: /\bgtm\b|go.to.market|growth\s+(lead|manager|head)|revenue\s+ops|revops|demand\s+gen|sales\s+ops/i, category: "gtm" },
  { pattern: /product\s+(manager|lead|head|director)|pm\b.*startup/i, category: "product" },
  { pattern: /biz\s*ops|business\s+ops|strategy\s+(&|and)\s+ops|partnerships|corp\s*dev|strategic\s+partnerships/i, category: "bizops" },
  { pattern: /health\s*tech|healthcare|telehealth|digital\s+health|clinical\s+ops|medtech|biotech/i, category: "healthtech" },
];

function detectRegion(text: string): { region: Job["region"]; label: string } | null {
  const lower = text.toLowerCase();
  for (const [pattern, info] of Object.entries(LOCATION_PATTERNS)) {
    if (lower.includes(pattern)) return info;
  }
  return null;
}

function detectCategory(text: string): Job["category"] | null {
  for (const { pattern, category } of ROLE_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

function extractTitle(text: string): string {
  const firstLine = text.split("\n")[0] || text;
  const cleaned = firstLine.replace(/<[^>]*>/g, "").trim();
  return cleaned.length > 120 ? cleaned.substring(0, 120) + "..." : cleaned;
}

function extractCompany(text: string): string {
  const firstLine = text.split("\n")[0] || "";
  const cleaned = firstLine.replace(/<[^>]*>/g, "").trim();
  const pipeMatch = cleaned.match(/^([^|]+)\|/);
  if (pipeMatch) return pipeMatch[1].trim();
  const dashMatch = cleaned.match(/^([^–—-]+)[–—-]/);
  if (dashMatch) return dashMatch[1].trim();
  return cleaned.split(" ").slice(0, 3).join(" ");
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();
  const keywords = [
    "gtm", "growth", "venture", "fundraising", "product", "chief of staff",
    "partnerships", "strategy", "operations", "healthtech", "ai", "saas",
    "revenue", "startup", "seed", "series a", "series b",
  ];
  for (const kw of keywords) {
    if (lower.includes(kw)) tags.push(kw);
  }
  return [...new Set(tags)].slice(0, 6);
}

interface HNHit {
  objectID: string;
  comment_text?: string;
  created_at?: string;
  story_id?: number;
}

export async function fetchHNJobs(): Promise<Job[]> {
  const jobs: Job[] = [];

  try {
    const searchRes = await fetch(
      "https://hn.algolia.com/api/v1/search?query=who+is+hiring&tags=story&hitsPerPage=1",
      { next: { revalidate: 3600 } }
    );
    const searchData = await searchRes.json();
    if (!searchData.hits?.length) return jobs;

    const storyId = searchData.hits[0].objectID;

    const queries = [
      "chief of staff", "GTM", "growth", "venture capital",
      "product manager", "operations", "partnerships", "healthtech",
      "head of growth", "revenue", "strategy",
      "san francisco", "new york", "los angeles",
    ];

    const results = await Promise.all(
      queries.map(async (q) => {
        const res = await fetch(
          `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=comment,story_${storyId}&hitsPerPage=10`,
          { next: { revalidate: 3600 } }
        );
        return res.json();
      })
    );

    const seenIds = new Set<string>();

    for (const result of results) {
      for (const hit of (result.hits || []) as HNHit[]) {
        if (seenIds.has(hit.objectID)) continue;
        seenIds.add(hit.objectID);

        const text = hit.comment_text || "";
        const regionInfo = detectRegion(text);
        if (!regionInfo) continue;

        const category = detectCategory(text);
        if (!category) continue;

        const plainText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

        jobs.push({
          id: `hn-${hit.objectID}`,
          title: extractTitle(text),
          company: extractCompany(text),
          location: regionInfo.label,
          description: plainText.length > 500 ? plainText.substring(0, 500) + "..." : plainText,
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          source: "hn",
          postedAt: hit.created_at || null,
          salary: null,
          tags: extractTags(text),
          category,
          region: regionInfo.region,
          workMode: /remote/i.test(text) ? "remote" : /hybrid/i.test(text) ? "hybrid" : "onsite",
          companyStage: null,
        });
      }
    }
  } catch (e) {
    console.error("Failed to fetch HN jobs:", e);
  }

  return jobs;
}
