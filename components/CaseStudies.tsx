"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

type CaseStudyCard = {
  name: string;
  type: string;
  year: string;
  href: string;
  image: string;
  comingSoon?: boolean;
};

function clamp(value: number, min: number, max: number) {
  if (min > max) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
}

export default function CaseStudies({
  studies,
}: {
  studies: CaseStudyCard[];
}) {
  const reduceMotion = useReducedMotion();
  const images = useMemo(
    () => [...new Set(studies.map((study) => study.image))],
    [studies],
  );

  const [canHover, setCanHover] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    src: string;
    dir: 1 | -1;
    tick: number;
  } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const currentSrc = useRef<string | null>(null);
  const lastIndex = useRef(-1);
  const tickMap = useRef(new Map<string, number>());
  const tick = useRef(0);
  const motionState = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    rot: 0,
    w: 280,
    h: 168,
    raf: 0,
    snapped: false,
  });

  useEffect(() => {
    const media = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const state = motionState.current;
    return () => {
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
    };
  }, []);

  const boundedTarget = () => {
    const state = motionState.current;
    return [
      clamp(
        state.tx + 140,
        16 + state.w / 2,
        window.innerWidth - 16 - state.w / 2,
      ),
      clamp(state.ty, 16 + state.h / 2, window.innerHeight - 16 - state.h / 2),
    ] as const;
  };

  const animatePreview = () => {
    const state = motionState.current;
    const node = previewRef.current;
    if (!node) {
      state.raf = 0;
      return;
    }

    const [targetX, targetY] = boundedTarget();
    const prevX = state.x;
    state.x += (targetX - state.x) * 0.16;
    state.y += (targetY - state.y) * 0.13;
    state.rot +=
      (clamp((state.x - prevX) * 0.55, -12, 12) - state.rot) * 0.11;

    node.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.rot}deg)`;

    const settled =
      Math.abs(targetX - state.x) < 0.2 &&
      Math.abs(targetY - state.y) < 0.2 &&
      Math.abs(state.rot) < 0.05;

    state.raf = settled ? 0 : requestAnimationFrame(animatePreview);
  };

  const showPreview = (study: CaseStudyCard, index: number) => {
    setActiveIndex(index);
    if (!canHover || !previewRef.current) return;

    previewRef.current.dataset.on = study.image ? "1" : "0";
    const dir: 1 | -1 =
      lastIndex.current < 0 || index >= lastIndex.current ? 1 : -1;
    lastIndex.current = index;

    if (!study.image || currentSrc.current === study.image) return;
    currentSrc.current = study.image;
    const nextTick = ++tick.current;
    tickMap.current.set(study.image, nextTick);
    setPreview({ src: study.image, dir, tick: nextTick });
  };

  const hidePreview = () => {
    setActiveIndex(null);
    if (previewRef.current) previewRef.current.dataset.on = "0";
    motionState.current.snapped = false;
    lastIndex.current = -1;
  };

  return (
    <section id="work" className="scroll-mt-16 w-full px-4 pt-28 md:pt-40">
      <div className="mb-6 flex w-full flex-col items-end gap-6 md:mb-8 md:gap-8">
        <motion.div
          className="w-full md:w-[min(721px,50%)]"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.75, ease }}
        >
          <p className="text-sm text-muted">Case Studies</p>
          <h2 className="mt-2 text-[clamp(1.5rem,3vw,2.125rem)] font-normal leading-tight text-foreground">
            Digital products design process, from white boarding to actually
            working experience.
          </h2>
        </motion.div>

        <div
          className="relative w-full"
          aria-label="Selected case studies"
          onPointerMove={
            canHover
              ? (event) => {
                  const state = motionState.current;
                  state.tx = event.clientX;
                  state.ty = event.clientY;
                  if (!state.snapped) {
                    state.w = innerRef.current?.offsetWidth ?? 280;
                    state.h = innerRef.current?.offsetHeight ?? 168;
                    const [x, y] = boundedTarget();
                    state.x = x;
                    state.y = y;
                    state.rot = 0;
                    state.snapped = true;
                  }
                  if (!state.raf) {
                    state.raf = requestAnimationFrame(animatePreview);
                  }
                }
              : undefined
          }
          onPointerLeave={canHover ? hidePreview : undefined}
        >
          <ul className="flex w-full flex-col">
            {studies.map((study, index) => {
              const isActive = activeIndex === index;
              return (
                <li key={study.name}>
                  <Link
                    href={study.href}
                    className={`grid grid-cols-[1.1fr_1fr_auto] items-end gap-3 border-t border-border px-2 py-4 transition-colors duration-200 md:gap-4 ${
                      isActive
                        ? "border-transparent bg-foreground text-background"
                        : "text-foreground first:border-t-0"
                    }`}
                    onPointerEnter={() => showPreview(study, index)}
                    onFocus={() => showPreview(study, index)}
                    onBlur={() => {
                      if (activeIndex === index) hidePreview();
                    }}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-base">{study.name}</span>
                      {study.comingSoon && (
                        <span
                          className={`shrink-0 rounded border px-2 py-[5px] text-xs leading-3 ${
                            isActive
                              ? "border-background/35 text-background/70"
                              : "border-border bg-[#14100c] text-muted"
                          }`}
                        >
                          Coming soon
                        </span>
                      )}
                    </span>
                    <span
                      className={`truncate text-sm ${
                        isActive ? "text-background/80" : "text-muted"
                      }`}
                    >
                      {study.type}
                    </span>
                    <span
                      className={`text-sm ${
                        isActive ? "text-background/80" : "text-muted"
                      }`}
                    >
                      {study.year}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {canHover && (
            <div
              ref={previewRef}
              className="case-preview"
              aria-hidden
              data-on="0"
            >
              <div ref={innerRef} className="case-preview-inner">
                {images.map((src) => {
                  const isActive = preview?.src === src;
                  return (
                    <span
                      key={`${src}#${tickMap.current.get(src) ?? 0}`}
                      className={`case-preview-img${isActive ? " is-active" : ""}`}
                      style={{ zIndex: tickMap.current.get(src) ?? 0 }}
                      data-dir={isActive ? preview?.dir : undefined}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="280px"
                        className="object-cover"
                      />
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
