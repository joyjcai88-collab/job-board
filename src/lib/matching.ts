import { Job } from "./types";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "is", "was", "are", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might", "can",
  "this", "that", "these", "those", "i", "me", "my", "we", "our", "you", "your",
  "he", "she", "it", "they", "them", "their", "its", "not", "no", "so", "if", "as",
  "up", "out", "about", "into", "over", "after", "before", "between", "through",
  "during", "all", "each", "every", "both", "few", "more", "most", "other", "some",
  "such", "than", "too", "very", "just", "also", "well", "back", "even", "still",
  "new", "old", "first", "last", "long", "great", "little", "own", "same", "big",
  "high", "small", "large", "work", "working", "worked", "experience", "experienced",
  "company", "team", "role", "position", "job", "including", "across", "using", "used",
  "help", "helped", "helping", "strong", "ability", "able", "responsible", "responsibilities",
  "etc", "e.g", "ie", "per", "via", "vs",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-/]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function extractNgrams(tokens: string[]): string[] {
  const ngrams: string[] = [...tokens];
  for (let i = 0; i < tokens.length - 1; i++) {
    ngrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  for (let i = 0; i < tokens.length - 2; i++) {
    ngrams.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  }
  return ngrams;
}

function buildFrequencyMap(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  return freq;
}

const SKILL_KEYWORDS = new Set([
  "python", "javascript", "typescript", "react", "node", "sql", "aws", "gcp", "azure",
  "kubernetes", "docker", "terraform", "go", "golang", "java", "c++", "rust", "swift",
  "machine learning", "deep learning", "nlp", "computer vision", "data science",
  "product management", "product manager", "project management", "agile", "scrum",
  "growth", "gtm", "go-to-market", "revenue operations", "revops", "sales operations",
  "marketing", "demand generation", "content marketing", "performance marketing",
  "venture capital", "private equity", "investment", "portfolio", "due diligence",
  "chief of staff", "business operations", "strategy", "strategic planning",
  "partnerships", "business development", "corporate development",
  "healthcare", "healthtech", "biotech", "clinical", "telehealth", "digital health",
  "fintech", "saas", "b2b", "b2c", "enterprise", "startup",
  "analytics", "data analytics", "tableau", "looker", "excel", "powerbi",
  "salesforce", "hubspot", "marketo", "segment", "amplitude",
  "figma", "design", "ux", "ui", "user research",
  "fundraising", "investor relations", "financial modeling", "valuation",
  "operations", "logistics", "supply chain", "procurement",
  "recruiting", "talent acquisition", "people operations", "hr",
  "ai", "artificial intelligence", "llm", "generative ai", "chatgpt",
  "blockchain", "crypto", "web3", "defi",
  "compliance", "legal", "regulatory", "hipaa", "sox",
  "consulting", "mckinsey", "bain", "bcg", "deloitte",
  "stanford", "harvard", "wharton", "mit", "berkeley",
]);

export interface ResumeProfile {
  skills: string[];
  keywords: Map<string, number>;
  rawText: string;
}

export function parseResumeText(text: string): ResumeProfile {
  const tokens = tokenize(text);
  const ngrams = extractNgrams(tokens);
  const freq = buildFrequencyMap(tokens);

  const skills: string[] = [];
  const lowerText = text.toLowerCase();
  for (const skill of SKILL_KEYWORDS) {
    if (lowerText.includes(skill)) {
      skills.push(skill);
    }
  }

  const ngramFreq = buildFrequencyMap(ngrams);
  for (const [ngram, count] of ngramFreq) {
    if (SKILL_KEYWORDS.has(ngram)) {
      freq.set(ngram, (freq.get(ngram) || 0) + count);
    }
  }

  return { skills, keywords: freq, rawText: text };
}

export function scoreJob(job: Job, profile: ResumeProfile): number {
  const titleTokens = tokenize(job.title);
  const descTokens = tokenize(job.description);
  const companyTokens = tokenize(job.company);
  const tagTokens = job.tags.flatMap((t) => typeof t === "string" ? tokenize(t) : []);
  const categoryToken = job.category;
  const locationTokens = tokenize(job.location);

  let score = 0;
  let maxScore = 0;

  // Title match (highest weight - 40 points max)
  const titleNgrams = new Set(extractNgrams(titleTokens));
  let titleHits = 0;
  for (const skill of profile.skills) {
    if (titleNgrams.has(skill) || job.title.toLowerCase().includes(skill)) {
      titleHits++;
    }
  }
  for (const token of titleTokens) {
    if (profile.keywords.has(token)) {
      titleHits += Math.min(profile.keywords.get(token)! / 3, 1);
    }
  }
  score += Math.min(titleHits * 8, 40);
  maxScore += 40;

  // Skills overlap (30 points max)
  const jobText = `${job.title} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
  let skillHits = 0;
  for (const skill of profile.skills) {
    if (jobText.includes(skill)) {
      skillHits++;
    }
  }
  score += Math.min((skillHits / Math.max(profile.skills.length, 1)) * 30, 30);
  maxScore += 30;

  // Description keyword overlap (15 points max)
  let descHits = 0;
  const descSet = new Set(descTokens);
  for (const [keyword, freq] of profile.keywords) {
    if (descSet.has(keyword) && freq >= 2) {
      descHits++;
    }
  }
  score += Math.min((descHits / 10) * 15, 15);
  maxScore += 15;

  // Tag match (10 points max)
  let tagHits = 0;
  for (const token of tagTokens) {
    if (profile.keywords.has(token)) tagHits++;
  }
  for (const skill of profile.skills) {
    if (job.tags.some((t) => typeof t === "string" && t.toLowerCase().includes(skill))) {
      tagHits += 2;
    }
  }
  score += Math.min(tagHits * 2, 10);
  maxScore += 10;

  // Company match (3 points)
  for (const token of companyTokens) {
    if (profile.keywords.has(token) && (profile.keywords.get(token) || 0) >= 2) {
      score += 3;
      break;
    }
  }
  maxScore += 3;

  // Location match (2 points)
  for (const token of locationTokens) {
    if (profile.keywords.has(token)) {
      score += 2;
      break;
    }
  }
  maxScore += 2;

  return Math.round(Math.min((score / maxScore) * 100, 99));
}

export function rankJobs(jobs: Job[], profile: ResumeProfile): Array<{ job: Job; score: number }> {
  return jobs
    .map((job) => ({ job, score: scoreJob(job, profile) }))
    .sort((a, b) => b.score - a.score);
}
