import { Job } from "./types";
import { generateLinkedInJobs } from "./sources/linkedin";
import { fetchHNJobs } from "./sources/hn";
import { fetchMuseJobs } from "./sources/themuse";

export async function aggregateJobs(): Promise<Job[]> {
  const [linkedInJobs, hnJobs, museJobs] = await Promise.all([
    Promise.resolve(generateLinkedInJobs()),
    fetchHNJobs(),
    fetchMuseJobs(),
  ]);

  const allJobs = [...museJobs, ...hnJobs, ...linkedInJobs];

  return allJobs.sort((a, b) => {
    if (a.postedAt && b.postedAt) {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
    if (a.postedAt) return -1;
    if (b.postedAt) return 1;
    return 0;
  });
}
