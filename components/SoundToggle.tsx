"use client";

import { useEffect, useRef } from "react";
import { useSound } from "@/components/SoundProvider";

const BAR_COUNT = 7;

/** Default Figma audio-wave-01 silhouette (normalized 0–1). */
const IDLE = [0.12, 0.52, 1, 0.7, 0.38, 0.52, 0.12];

const MAX_BAR = 12;
const MIN_BAR = 1.35;

function setBar(line: SVGLineElement | null, level: number) {
  if (!line) return;
  const height = Math.max(MIN_BAR, Math.min(MAX_BAR, level * MAX_BAR));
  const y = 8 - height / 2;
  line.setAttribute("y1", String(y));
  line.setAttribute("y2", String(y + height));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Pull energy from a frequency band with a soft peak bias. */
function bandLevel(
  data: Uint8Array<ArrayBuffer>,
  startRatio: number,
  endRatio: number,
) {
  const len = data.length;
  const start = Math.max(0, Math.floor(startRatio * len));
  const end = Math.min(len, Math.max(start + 1, Math.floor(endRatio * len)));
  let sum = 0;
  let peak = 0;
  for (let i = start; i < end; i++) {
    const v = data[i] ?? 0;
    sum += v;
    if (v > peak) peak = v;
  }
  const avg = sum / (end - start);
  return Math.min(1, (avg * 0.55 + peak * 0.45) / 210);
}

export default function SoundToggle() {
  const { enabled, toggle, subscribeLevels } = useSound();
  const linesRef = useRef<(SVGLineElement | null)[]>([]);
  const smoothRef = useRef([...IDLE]);

  useEffect(() => {
    IDLE.forEach((level, index) => {
      smoothRef.current[index] = level;
      setBar(linesRef.current[index], level);
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Ease back to the default wave silhouette
      let raf = 0;
      const settle = () => {
        let done = true;
        for (let i = 0; i < BAR_COUNT; i++) {
          const target = IDLE[i] ?? 0.2;
          const next = lerp(smoothRef.current[i] ?? target, target, 0.18);
          smoothRef.current[i] = next;
          setBar(linesRef.current[i], next);
          if (Math.abs(next - target) > 0.01) done = false;
        }
        if (!done) raf = requestAnimationFrame(settle);
      };
      raf = requestAnimationFrame(settle);
      return () => cancelAnimationFrame(raf);
    }

    // Logarithmic-ish bands: bass → mid → high across the 7 bars
    const bands: [number, number][] = [
      [0.02, 0.06],
      [0.06, 0.12],
      [0.12, 0.2],
      [0.2, 0.32],
      [0.32, 0.48],
      [0.48, 0.66],
      [0.66, 0.88],
    ];

    return subscribeLevels((data) => {
      for (let i = 0; i < BAR_COUNT; i++) {
        const [start, end] = bands[i] ?? [0, 1];
        let target = bandLevel(data, start, end);

        // Keep a readable silhouette: center bars a bit taller
        const weight = 0.72 + (1 - Math.abs(i - 3) / 3) * 0.4;
        target = Math.max(0.14, Math.min(1, target * weight));

        const current = smoothRef.current[i] ?? target;
        // Fast attack, slower release — feels like a real meter
        const t = target > current ? 0.42 : 0.14;
        const next = lerp(current, target, t);
        smoothRef.current[i] = next;
        setBar(linesRef.current[i], next);
      }
    });
  }, [enabled, subscribeLevels]);

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className={[
        "relative flex h-7 items-center justify-center rounded px-2 transition-all duration-300",
        enabled
          ? "bg-[#16120f] text-foreground ring-1 ring-foreground/25 [[data-theme=light]_&]:bg-[#e0dad1] [[data-theme=light]_&]:text-[#181411] [[data-theme=light]_&]:ring-[#181411]/20"
          : "bg-[#0b0806] text-white/85 hover:bg-[#16120f] hover:text-white [[data-theme=light]_&]:bg-[#ebe6df] [[data-theme=light]_&]:text-[#181411]/80 [[data-theme=light]_&]:hover:bg-[#e0dad1] [[data-theme=light]_&]:hover:text-[#181411]",
      ].join(" ")}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn sounds off" : "Turn sounds on"}
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
        {IDLE.map((level, index) => {
          const x = 2 + index * 2;
          const height = Math.max(MIN_BAR, level * MAX_BAR);
          const y = 8 - height / 2;
          return (
            <line
              key={index}
              ref={(el) => {
                linesRef.current[index] = el;
              }}
              x1={x}
              y1={y}
              x2={x}
              y2={y + height}
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </button>
  );
}
