import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-foreground">Add project</h2>
        <p className="mt-1 text-sm text-muted">
          Appears in Work and Other Projects sections.
        </p>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}
