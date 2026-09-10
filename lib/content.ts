import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import type { CaseStudy } from "@/lib/caseStudies";
import type { WorkItem } from "@/lib/work";

const dataDir = path.join(process.cwd(), "data");
const workPath = path.join(dataDir, "work.json");
const caseStudiesPath = path.join(dataDir, "case-studies.json");

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getWorkItems(): Promise<WorkItem[]> {
  return readJson<WorkItem[]>(workPath);
}

export async function saveWorkItems(items: WorkItem[]) {
  await writeJson(workPath, items);
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return readJson<CaseStudy[]>(caseStudiesPath);
}

export async function saveCaseStudies(studies: CaseStudy[]) {
  await writeJson(caseStudiesPath, studies);
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin");
  revalidatePath("/admin/case-studies");
  for (const study of studies) {
    revalidatePath(`/work/${study.slug}`);
    revalidatePath(`/admin/case-studies/${study.slug}`);
  }
}

export async function getCaseStudyBySlug(slug: string) {
  const studies = await getCaseStudies();
  return studies.find((study) => study.slug === slug) ?? null;
}

export async function getNextCaseStudyBySlug(slug: string) {
  const studies = await getCaseStudies();
  const index = studies.findIndex((study) => study.slug === slug);
  if (index < 0 || studies.length === 0) return null;
  return studies[(index + 1) % studies.length] ?? null;
}

export async function getContentStats() {
  const [work, studies] = await Promise.all([
    getWorkItems(),
    getCaseStudies(),
  ]);
  const projects = work.filter((item) => item.category === "project");
  const caseStudyCards = work.filter((item) => item.category === "case-study");
  const years = [...new Set(work.map((item) => item.year))].sort();

  return {
    totalWork: work.length,
    projects: projects.length,
    caseStudies: studies.length,
    caseStudyCards: caseStudyCards.length,
    yearsCovered: years.length,
    latestYear: years.at(-1) ?? "—",
    recentWork: work.slice(0, 5),
  };
}

export function workItemFromCaseStudy(study: CaseStudy): WorkItem {
  const industry =
    study.meta.find((item) => item.label.toLowerCase() === "industry")
      ?.value ?? "Case Study";
  const year =
    study.meta.find((item) => item.label.toLowerCase() === "year")?.value ??
    new Date().getFullYear().toString();

  return {
    id: study.slug,
    name: study.title,
    meta: industry,
    year,
    image: study.cover,
    category: "case-study",
    aspect: "346 / 260",
    href: `/work/${study.slug}`,
  };
}
