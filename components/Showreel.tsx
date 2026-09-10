"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import ReactiveImage from "@/components/ReactiveImage";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Showreel() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="w-full px-4 pt-12 md:pt-16">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <motion.div
          className="group relative aspect-video overflow-hidden rounded-[5px] bg-border md:aspect-auto md:min-h-[420px] lg:min-h-[525px]"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease, delay: 0.05 }}
        >
          <Image
            src="/images/banner.png"
            alt="Featured project showreel"
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            priority
          />
        </motion.div>

        <motion.div
          className="relative aspect-[4/5] overflow-hidden rounded-[5px] bg-border md:aspect-auto md:min-h-[420px] lg:min-h-[525px]"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease, delay: 0.16 }}
        >
          <ReactiveImage
            src="/images/abstract-top.png"
            alt=""
            sizes="(max-width: 768px) 100vw, 34vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
