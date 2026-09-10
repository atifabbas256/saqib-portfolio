import Link from "next/link";
import { getContentStats } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getContentStats();

  const cards = [
    { label: "Total work", value: stats.totalWork },
    { label: "Projects", value: stats.projects },
    { label: "Case studies", value: stats.caseStudies },
    { label: "Years covered", value: stats.yearsCovered },
  ];

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-[#87817a]">
            Overview of portfolio content. Latest year: {stats.latestYear}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/projects/new"
            className="rounded bg-white px-3 py-2 text-xs font-medium text-[#181411]"
          >
            Add project
          </Link>
          <Link
            href="/admin/case-studies/new"
            className="rounded border border-[#2f2a24] px-3 py-2 text-xs text-[#87817a] hover:text-white"
          >
            Add case study
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded border border-[#2f2a24] bg-[#14110e] px-4 py-5"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#87817a]">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-medium text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-white">Recent work</h3>
        <div className="overflow-hidden rounded border border-[#2f2a24]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#2f2a24] bg-[#14110e] text-xs uppercase tracking-wider text-[#87817a]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Year</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentWork.map((item) => (
                <tr key={item.id} className="border-b border-[#2f2a24]/70">
                  <td className="px-4 py-3 text-white">{item.name}</td>
                  <td className="px-4 py-3 capitalize text-[#87817a]">
                    {item.category.replace("-", " ")}
                  </td>
                  <td className="px-4 py-3 text-[#87817a]">{item.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
