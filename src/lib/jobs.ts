import { Job } from "./types";
import { fetchJSearchJobs } from "./sources/jsearch";
import { fetchHNJobs } from "./sources/hn";
import { fetchMuseJobs } from "./sources/themuse";
import { fetchConsiderJobs } from "./sources/consider";
import { fetchGetroJobs } from "./sources/getro";

function stringify(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && "label" in (val as Record<string, unknown>)) return String((val as Record<string, unknown>).label);
  return String(val);
}

function sanitizeJob(job: Job): Job {
  return {
    ...job,
    tags: job.tags.map((t) => (typeof t === "string" ? t : stringify(t) || "")).filter(Boolean),
    companyStage: stringify(job.companyStage),
  };
}

export async function aggregateJobs(): Promise<Job[]> {
  const [jsearchJobs, hnJobs, museJobs, considerJobs, getroJobs] = await Promise.all([
    fetchJSearchJobs(),
    fetchHNJobs(),
    fetchMuseJobs(),
    fetchConsiderJobs(),
    fetchGetroJobs(),
  ]);

  const allJobs = [...jsearchJobs, ...museJobs, ...hnJobs, ...considerJobs, ...getroJobs];

  return allJobs.map(sanitizeJob).sort((a, b) => {
    if (a.postedAt && b.postedAt) {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
    if (a.postedAt) return -1;
    if (b.postedAt) return 1;
    return 0;
  });
}
