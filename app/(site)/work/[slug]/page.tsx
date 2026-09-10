import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyView from "@/components/CaseStudyView";
import {
  getCaseStudies,
  getCaseStudyBySlug,
  getNextCaseStudyBySlug,
  getWorkItems,
} from "@/lib/content";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const studies = await getCaseStudies();
  return studies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) return { title: "Work" };

  return {
    title: `${study.title} — Syed Saqib Abbas`,
    description: study.summary,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) notFound();
  const [next, workItems] = await Promise.all([
    getNextCaseStudyBySlug(slug),
    getWorkItems(),
  ]);

  return <CaseStudyView study={study} next={next} workItems={workItems} />;
}
