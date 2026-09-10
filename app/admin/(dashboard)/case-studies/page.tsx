import Link from "next/link";
import DeleteCaseStudyButton from "@/components/admin/DeleteCaseStudyButton";
import { getCaseStudies } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminCaseStudiesPage() {
  const studies = await getCaseStudies();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-medium text-foreground">Case studies</h2>
          <p className="mt-1 text-sm text-muted">
            Uses the existing case study layout on `/work/[slug]`.
          </p>
        </div>
        <Link
          href="/admin/case-studies/new"
          className="rounded bg-foreground px-3 py-2 text-xs font-medium text-background"
        >
          Add case study
        </Link>
      </div>

      <div className="overflow-hidden rounded border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-[#14110e] text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Case study</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {studies.map((study) => (
              <tr key={study.slug} className="border-b border-border/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={study.cover}
                      alt=""
                      className="h-10 w-14 rounded object-cover"
                    />
                    <div>
                      <p className="text-foreground">{study.title}</p>
                      <p className="line-clamp-1 max-w-md text-xs text-muted">
                        {study.summary}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{study.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/work/${study.slug}`}
                      className="text-xs text-muted hover:text-foreground"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/case-studies/${study.slug}`}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <DeleteCaseStudyButton
                      slug={study.slug}
                      title={study.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {studies.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-muted"
                >
                  No case studies yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
