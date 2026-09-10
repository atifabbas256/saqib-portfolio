import Link from "next/link";
import { getWorkItems } from "@/lib/content";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = (await getWorkItems()).filter(
    (item) => item.category === "project",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-medium text-foreground">Projects</h2>
          <p className="mt-1 text-sm text-muted">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded bg-foreground px-3 py-2 text-xs font-medium text-background"
        >
          Add project
        </Link>
      </div>

      <div className="overflow-hidden rounded border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-[#14110e] text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Tag</th>
              <th className="px-4 py-3 font-medium">Year</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-border/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image}
                      alt=""
                      className="h-10 w-14 rounded object-cover"
                    />
                    <span className="text-foreground">{project.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{project.meta}</td>
                <td className="px-4 py-3 text-muted">{project.year}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <DeleteProjectButton id={project.id} name={project.name} />
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-muted"
                >
                  No projects yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
