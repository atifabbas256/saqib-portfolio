import type { Metadata } from "next";
import AboutPageContent from "@/components/AboutPageContent";
import Footer from "@/components/Footer";
import { getWorkItems } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — Syed Saqib Abbas",
  description:
    "UX designer at Devsinc working across design, execution, and AI workflows.",
};

export default async function AboutPage() {
  const workItems = await getWorkItems();

  return (
    <main className="flex flex-1 flex-col">
      <AboutPageContent />
      <Footer workItems={workItems} />
    </main>
  );
}
