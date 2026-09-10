export type CaseStudyBlock =
  | { type: "image"; src: string; alt: string }
  | { type: "text"; body: string }
  | { type: "heading"; title: string; paragraphs: string[] };

export type CaseStudyMeta = {
  label: string;
  value: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  meta: CaseStudyMeta[];
  siteUrl?: string;
  cover: string;
  coverAlt: string;
  blocks: CaseStudyBlock[];
};

export function getNextFromList(studies: CaseStudy[], slug: string) {
  const index = studies.findIndex((study) => study.slug === slug);
  if (index < 0 || studies.length === 0) return null;
  return studies[(index + 1) % studies.length] ?? null;
}
