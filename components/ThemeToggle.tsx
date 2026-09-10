"use client";

import { useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="size-4"
      aria-hidden
    >
      <path
        d="M14.333 9.386a5.98 5.98 0 0 1-2.683.669c-3.151 0-5.705-2.554-5.705-5.705 0-.97.242-1.883.669-2.683C3.778 2.331 1.667 4.877 1.667 7.915c0 3.545 2.873 6.418 6.417 6.418 3.039 0 5.584-2.112 6.249-4.947Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="size-4"
      aria-hidden
    >
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 1.5v1.25M8 13.25V14.5M1.5 8h1.25M13.25 8H14.5M3.22 3.22l.88.88M11.9 11.9l.88.88M3.22 12.78l.88-.88M11.9 4.1l.88-.88"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="flex h-7 items-center justify-center rounded bg-[#0b0806] px-2 text-white transition-colors duration-200 hover:bg-[#16120f] [[data-theme=light]_&]:bg-[#ebe6df] [[data-theme=light]_&]:text-[#181411] [[data-theme=light]_&]:hover:bg-[#e0dad1]"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        const rect = buttonRef.current?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.top + rect.height / 2 : 0;
        toggleTheme({ x, y });
      }}
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
