"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

const EMAIL = "saqibabbas052@gmail.com";
const LINKEDIN_URL = "#";
const BOOK_CALL_URL = "mailto:saqibabbas052@gmail.com";

function useLahoreTime(enabled: boolean) {
  const [time, setTime] = useState("00:00");

  useEffect(() => {
    if (!enabled) return;

    const format = () => {
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
      setTime(formatted);
    };

    format();
    const id = window.setInterval(format, 30_000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return time;
}

type ContactMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
};

export default function ContactMenu({
  open,
  onOpenChange,
  className = "",
}: ContactMenuProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const time = useLahoreTime(open);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
        className="group flex items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground"
      >
        <span
          className={`size-1.5 shrink-0 rounded-[1px] bg-foreground transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-hidden
        />
        <span className={open ? "text-foreground" : undefined}>Contact</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Contact"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[min(321px,calc(100vw-2rem))] overflow-hidden border border-border bg-background shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
              <span className="text-base text-foreground">Contact</span>
              <span className="text-sm text-muted">
                {time} | Lahore
              </span>
            </div>

            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center justify-between gap-3 border-b border-border bg-background px-3 py-3 text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              <span className="text-base font-medium">Email</span>
              <span className="truncate text-sm">{EMAIL}</span>
            </a>

            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border-b border-border px-3 py-3 text-base text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              <span>LinkedIn</span>
              <span aria-hidden>↗</span>
            </a>

            <div className="bg-background p-3">
              <a
                href={BOOK_CALL_URL}
                className="flex w-full items-center justify-between rounded bg-foreground px-3 py-2 text-sm font-medium text-background transition-transform duration-200 hover:scale-[1.01]"
              >
                <span>Book a call</span>
                <span className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-[1px] bg-accent"
                    aria-hidden
                  />
                  <span className="text-[14px] text-[#8c8177]">30 min</span>
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
