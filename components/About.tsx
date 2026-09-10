"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useState } from "react";
import ReactiveImage from "@/components/ReactiveImage";

const ease = [0.22, 1, 0.36, 1] as const;

export function ActionButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      <a
        href="mailto:saqibabbas052@gmail.com"
        className="inline-flex items-center gap-2 rounded-[5px] bg-foreground px-[12.8px] py-2 text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.03]"
      >
        <span className="size-2 rounded bg-accent" aria-hidden />
        Book a call
      </a>
      <Link
        href="/about"
        className="inline-flex items-center rounded-[5px] bg-[#241f1a] px-[12.8px] py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-border"
      >
        About
      </Link>
    </div>
  );
}

export default function About() {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { stiffness: 380, damping: 28, mass: 0.4 });
  const springY = useSpring(cursorY, { stiffness: 380, damping: 28, mass: 0.4 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <section
      id="about"
      className="scroll-mt-16 flex w-full flex-col gap-8 px-4 py-28 md:flex-row md:items-stretch md:gap-2 md:py-40"
    >
      <motion.div
        className="flex min-w-0 flex-1 flex-col gap-10 md:pr-6"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease }}
      >
        <p className="text-sm text-muted">About</p>

        <div className="flex flex-col gap-6">
          <h2 className="max-w-[528px] text-[clamp(1.5rem,3vw,2.125rem)] font-normal leading-tight text-foreground">
            Saqib is a Pakistan based UX designer working across design,
            execution, and AI workflows.
          </h2>
          <p className="max-w-[370px] text-base leading-relaxed text-muted">
            I design fully immersive customer experiences end to end.
          </p>
        </div>

        <div className="mt-auto pt-8">
          <ActionButtons />
        </div>
      </motion.div>

      <div className="flex w-full gap-2 md:w-[min(848px,58%)]">
        <motion.div
          className={`relative min-h-[280px] flex-1 overflow-hidden rounded bg-border md:min-h-[432px] ${
            canHover ? "cursor-none" : ""
          }`}
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease, delay: 0.08 }}
          
          onClick={() => {
            if (canHover) return;
            setHovered((value) => !value);
          }}
        >
          <Image
            src="/images/chopa.png"
            alt="Syed Saqib Abbas"
            fill
            sizes="(max-width: 768px) 50vw, 35vw"
            className="object-cover"
          />

        </motion.div>

        <motion.div
          className="relative min-h-[280px] w-[42%] overflow-hidden rounded bg-border md:min-h-[432px] md:w-[346px] md:shrink-0"
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease, delay: 0.18 }}
        >
          <ReactiveImage
            src="/images/abstract-bottom.png"
            alt=""
            sizes="(max-width: 768px) 42vw, 346px"
          />
        </motion.div>
      </div>
    </section>
  );
}
