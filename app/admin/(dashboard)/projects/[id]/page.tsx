import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getWorkItems } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const item = (await getWorkItems()).find(
    (entry) => entry.id === id && entry.category === "project",
  );
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-foreground">Edit project</h2>
        <p className="mt-1 text-sm text-muted">{item.name}</p>
      </div>
      <ProjectForm mode="edit" initial={item} />
    </div>
  );
}
