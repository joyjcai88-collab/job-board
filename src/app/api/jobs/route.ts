import { aggregateJobs } from "@/lib/jobs";

export const revalidate = 3600;

export async function GET() {
  const jobs = await aggregateJobs();
  return Response.json({ jobs, count: jobs.length, fetchedAt: new Date().toISOString() });
}
