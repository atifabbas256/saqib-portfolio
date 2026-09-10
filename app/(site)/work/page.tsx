import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import WorkIndex from "@/components/WorkIndex";
import { getWorkItems } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Work — Syed Saqib Abbas",
  description: "Selected works, case studies, and projects by Syed Saqib Abbas.",
};

export default async function WorkPage() {
  const workItems = await getWorkItems();

  return (
    <main className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <div className="px-4 pt-40 text-sm text-muted">Loading works…</div>
        }
      >
        <WorkIndex items={workItems} />
      </Suspense>
      <Footer workItems={workItems} />
    </main>
  );
}
