import { aggregateJobs } from "@/lib/jobs";
import JobBoard from "@/components/JobBoard";

export const revalidate = 3600;

export default async function Home() {
  const jobs = await aggregateJobs();

  return <JobBoard initialJobs={jobs} />;
}
