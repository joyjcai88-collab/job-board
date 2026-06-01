import { aggregateJobs } from "@/lib/jobs";
import JobBoard from "@/components/JobBoard";

export const revalidate = 3600;

export default async function Home() {
  const jobs = await aggregateJobs();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Job Board
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-base">
          VC, Chief of Staff, GTM/Growth, Product, Biz Ops, and Healthtech roles across Silicon Valley, NYC, and LA.
          Aggregated from LinkedIn, Hacker News, and The Muse.
        </p>
      </header>

      <JobBoard initialJobs={jobs} />

      <footer className="mt-16 pb-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
          Job listings are aggregated from public sources. Data refreshes hourly.
          Click any listing to view the full posting on its original source.
        </p>
      </footer>
    </main>
  );
}
