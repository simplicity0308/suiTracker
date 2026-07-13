"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/trip/map", label: "Map" },
  { href: "/trip/agenda", label: "Agenda" },
];

export function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 text-sm font-medium">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active
                ? "text-zinc-900 dark:text-zinc-50"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
