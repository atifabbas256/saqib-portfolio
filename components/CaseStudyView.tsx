"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import Footer from "@/components/Footer";
import type { CaseStudy } from "@/lib/caseStudies";
import type { WorkItem } from "@/lib/work";

const ease = [0.22, 1, 0.36, 1] as const;

export default function CaseStudyView({
  study,
  next,
  workItems = [],
}: {
  study: CaseStudy;
  next: CaseStudy | null;
  workItems?: WorkItem[];
}) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="flex flex-1 flex-col">
      <article className="w-full px-4 pb-4 pt-20 md:pt-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
          {/* Sticky sidebar */}
          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[min(485px,34%)]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              <Link
                href="/work"
                className="inline-flex text-xs font-medium text-muted transition-colors hover:text-foreground"
              >
                ← Back
              </Link>

              <h1 className="mt-12 text-[clamp(1.75rem,3vw,2rem)] font-medium leading-tight text-foreground">
                {study.title}
              </h1>

              <p className="mt-6 max-w-[344px] text-[clamp(1.125rem,2vw,1.5rem)] leading-relaxed tracking-[-0.02em] text-foreground">
                {study.summary}
              </p>

              <dl className="mt-12 flex flex-col gap-5">
                {study.meta.map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs font-medium text-foreground">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm text-muted">{item.value}</dd>
                  </div>
                ))}
              </dl>

              {study.siteUrl ? (
                <a
                  href={study.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-12 inline-flex text-sm text-muted transition-colors hover:text-foreground"
                >
                  Visit Site ↗
                </a>
              ) : null}
            </motion.div>
          </aside>

          {/* Media + narrative */}
          <div className="min-w-0 flex-1">
            <motion.div
              className="relative aspect-[914/640] w-full overflow-hidden rounded bg-border"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease, delay: 0.08 }}
            >
              <Image
                src={study.cover}
                alt={study.coverAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </motion.div>

            <div className="mt-2 flex flex-col gap-2">
              {study.blocks.map((block, index) => {
                if (block.type === "image") {
                  return (
                    <motion.div
                      key={`${block.src}-${index}`}
                      className="relative aspect-[915/740] w-full overflow-hidden rounded-[5px] bg-border"
                      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.85, ease }}
                    >
                      <Image
                        src={block.src}
                        alt={block.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover"
                      />
                    </motion.div>
                  );
                }

                if (block.type === "text") {
                  return (
                    <motion.p
                      key={`text-${index}`}
                      className="max-w-[578px] pb-14 pt-6 text-base leading-relaxed text-foreground"
                      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.7, ease }}
                    >
                      {block.body}
                    </motion.p>
                  );
                }

                return (
                  <motion.div
                    key={`heading-${index}`}
                    className="max-w-[578px] pt-6"
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.75, ease }}
                  >
                    <h2 className="text-2xl font-medium text-foreground">
                      {block.title}
                    </h2>
                    {block.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-4 text-base leading-relaxed text-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </motion.div>
                );
              })}
            </div>

            {next ? (
              <div className="mt-[100px] flex justify-end border-t border-border py-2">
                <Link
                  href={`/work/${next.slug}`}
                  className="text-base text-muted transition-colors hover:text-foreground"
                >
                  Next Project →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </article>

      <Footer workItems={workItems} />
    </main>
  );
}
