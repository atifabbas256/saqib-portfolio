"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ContactMenu from "@/components/ContactMenu";
import SoundToggle from "@/components/SoundToggle";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/work", label: "Work", match: "work" as const },
  { href: "/about", label: "About", match: "about" as const },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const onWork = pathname === "/work" || pathname.startsWith("/work/");
  const onAbout = pathname === "/about" || pathname.startsWith("/about/");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setContactOpen(false);
  }, [pathname]);

  const isActive = (link: (typeof links)[number]) => {
    if (link.match === "work") return onWork;
    if (link.match === "about") return onAbout;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-2">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={() => {
            setMenuOpen(false);
            setContactOpen(false);
          }}
        >
          <span className="truncate text-base font-medium text-foreground">
            Syed Saqib Abbas
          </span>
          <span className="hidden shrink-0 text-sm font-medium text-muted sm:inline">
            UX Designer
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-6 md:gap-10">
          <nav
            className="hidden items-center gap-10 md:flex"
            aria-label="Primary"
          >
            {links.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setContactOpen(false)}
                  className="group flex w-[65px] items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground"
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-[1px] bg-foreground transition-opacity duration-200 ${
                      active
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    aria-hidden
                  />
                  <span className={active ? "text-foreground" : undefined}>
                    {link.label}
                  </span>
                </Link>
              );
            })}

            <ContactMenu open={contactOpen} onOpenChange={setContactOpen} />
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SoundToggle />
          </div>

          <button
            type="button"
            className="relative flex size-8 items-center justify-center md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setMenuOpen((open) => !open);
              setContactOpen(false);
            }}
          >
            <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
            <span
              className={`absolute h-px w-4 bg-foreground transition-transform duration-200 ${
                menuOpen ? "translate-y-0 rotate-45" : "-translate-y-1"
              }`}
            />
            <span
              className={`absolute h-px w-4 bg-foreground transition-transform duration-200 ${
                menuOpen ? "translate-y-0 -rotate-45" : "translate-y-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-border bg-background md:hidden ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        <nav
          className="flex flex-col gap-1 px-4 py-4"
          aria-label="Mobile primary"
        >
          {links.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3 py-3 text-base font-medium text-muted transition-colors duration-200 hover:text-foreground"
              >
                <span
                  className={`size-1.5 shrink-0 rounded-[1px] bg-foreground transition-opacity duration-200 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden
                />
                <span className={active ? "text-foreground" : undefined}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          <div className="border-t border-border pt-3">
            <ContactMenu
              open={contactOpen}
              onOpenChange={setContactOpen}
              className="w-full [&>button]:w-full [&>button]:justify-start [&>button]:py-3 [&>button]:text-base [&>div]:left-0 [&>div]:right-auto [&>div]:w-full"
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
