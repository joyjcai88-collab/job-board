import { Job } from "./types";
import { fetchJSearchJobs } from "./sources/jsearch";
import { fetchHNJobs } from "./sources/hn";
import { fetchMuseJobs } from "./sources/themuse";

export async function aggregateJobs(): Promise<Job[]> {
  const [jsearchJobs, hnJobs, museJobs] = await Promise.all([
    fetchJSearchJobs(),
    fetchHNJobs(),
    fetchMuseJobs(),
  ]);

  const allJobs = [...jsearchJobs, ...museJobs, ...hnJobs];

  return allJobs.sort((a, b) => {
    if (a.postedAt && b.postedAt) {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
    if (a.postedAt) return -1;
    if (b.postedAt) return 1;
    return 0;
  });
}
