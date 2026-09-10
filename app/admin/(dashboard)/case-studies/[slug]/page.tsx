import { notFound } from "next/navigation";
import CaseStudyForm from "@/components/admin/CaseStudyForm";
import { getCaseStudyBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EditCaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-foreground">
          Edit case study
        </h2>
        <p className="mt-1 text-sm text-muted">{study.title}</p>
      </div>
      <CaseStudyForm mode="edit" initial={study} />
    </div>
  );
}
