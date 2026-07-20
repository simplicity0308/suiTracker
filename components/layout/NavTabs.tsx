"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: { href: string; label: string; desktopOnly?: boolean }[] = [
  { href: "/trip/map", label: "Map" },
  { href: "/trip/todos", label: "To-dos" },
  { href: "/trip/agenda", label: "Agenda" },
  { href: "/trip/export", label: "Export", desktopOnly: true },
];

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 text-sm font-medium sm:gap-5">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 pb-0.5 transition-colors ${
              tab.desktopOnly ? "hidden lg:inline-block" : ""
            } ${
              active
                ? "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
