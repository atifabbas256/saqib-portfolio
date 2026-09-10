"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const lineVariants = {
  hidden: { opacity: 0, y: 36, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease },
  },
};

export default function Hero() {
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const reduceMotion = useReducedMotion();

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springX = useSpring(cursorX, { stiffness: 320, damping: 28, mass: 0.5 });
  const springY = useSpring(cursorY, { stiffness: 320, damping: 28, mass: 0.5 });

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion || !canHover) return;

    cursorX.set(120);
    cursorY.set(28);
    const show = window.setTimeout(() => setHovered(true), 1800);
    const hide = window.setTimeout(() => setHovered(false), 3400);

    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [canHover, cursorX, cursorY, reduceMotion]);

  return (
    <section className="relative flex w-full flex-col gap-12 px-4 pt-28 md:gap-16 md:pt-40">
      <div className="w-full md:pl-[50%]">
        <motion.p
          className="max-w-[422px] text-sm leading-[1.4] text-foreground md:text-[14px]"
          initial={reduceMotion ? false : { opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease, delay: 0.08 }}
        >
          Designer with a background across Agentic AI solution, fleet management
          systems, human resources, e-commerce and much more — turning complex,
          high-stakes workflows into products people rely on every day. I care most
          about the hard, ambiguous problems, and about design that&apos;s data driven.
        </motion.p>
      </div>

      <motion.h1
        className={`relative max-w-[849px] px-0 text-[clamp(2.5rem,8vw,5rem)] font-normal leading-[1] tracking-tight text-foreground md:px-2.5 md:text-[80px] md:leading-[80px] ${
          canHover ? "cursor-none" : ""
        }`}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.14,
              delayChildren: 0.28,
            },
          },
        }}
        onMouseEnter={() => {
          if (!canHover) return;
          setHovered(true);
        }}
        onMouseLeave={() => {
          if (!canHover) return;
          setHovered(false);
        }}
        onMouseMove={(event) => {
          if (!canHover) return;
          const rect = event.currentTarget.getBoundingClientRect();
          cursorX.set(event.clientX - rect.left - 4);
          cursorY.set(event.clientY - rect.top - 4);
          if (!hovered) setHovered(true);
        }}
        onClick={() => {
          if (canHover) return;
          setHovered((value) => !value);
        }}
      >
        <motion.span className="block" variants={lineVariants}>
          Design, User Experience,
        </motion.span>
        <motion.span className="block" variants={lineVariants}>
          AI Workflows
        </motion.span>

        <AnimatePresence>
          {hovered && (
            <motion.span
              className="pointer-events-none absolute left-0 top-0 z-10 select-none"
              style={{ x: springX, y: springY }}
              initial={{ opacity: 0, scale: 0.5, rotate: -14 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.75, rotate: 6 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
            >
              <Image
                src="/images/header-cursor.png"
                alt=""
                width={56}
                height={56}
                className="h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(0,226,0,0.35)] md:h-14 md:w-14"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.h1>
    </section>
  );
}
