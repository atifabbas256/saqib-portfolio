import About from "@/components/About";
import CaseStudies from "@/components/CaseStudies";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import OtherProjects from "@/components/OtherProjects";
import Showreel from "@/components/Showreel";
import { getCaseStudies, getWorkItems } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [workItems, caseStudies] = await Promise.all([
    getWorkItems(),
    getCaseStudies(),
  ]);

  const featuredStudies = caseStudies.map((study) => {
    const card = workItems.find((item) => item.id === study.slug);
    return {
      name: study.title,
      type:
        study.meta.find((m) => m.label.toLowerCase() === "industry")?.value ??
        card?.meta ??
        "Case Study",
      year:
        study.meta.find((m) => m.label.toLowerCase() === "year")?.value ??
        card?.year ??
        "",
      href: `/work/${study.slug}`,
      image: study.cover,
      comingSoon: card?.comingSoon,
    };
  });

  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Showreel />
      <CaseStudies studies={featuredStudies} />
      <OtherProjects items={workItems} />
      <About />
      <Footer workItems={workItems} />
    </main>
  );
}
