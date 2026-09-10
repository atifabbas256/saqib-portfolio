"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav: { href: string; label: string; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/case-studies", label: "Case Studies" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-[#2f2a24] bg-[#12100e] md:w-56 md:min-h-screen md:border-b-0 md:border-r">
      <div className="px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#87817a]">
          Portfolio
        </p>
        <h1 className="mt-1 text-lg font-medium text-white">Admin</h1>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-white text-[#181411]"
                  : "text-[#87817a] hover:bg-[#2f2a24]/60 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#2f2a24] px-4 py-4">
        <Link
          href="/"
          className="text-xs text-[#87817a] transition-colors hover:text-white"
        >
          View site
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="text-xs text-[#87817a] transition-colors hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
