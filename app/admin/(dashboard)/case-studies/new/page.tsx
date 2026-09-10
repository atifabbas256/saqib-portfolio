import CaseStudyForm from "@/components/admin/CaseStudyForm";

export default function NewCaseStudyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-foreground">
          Add case study
        </h2>
        <p className="mt-1 text-sm text-muted">
          Published pages use the existing sticky sidebar + media layout.
        </p>
      </div>
      <CaseStudyForm mode="create" />
    </div>
  );
}
