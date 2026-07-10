"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/workspace", label: "Workspace" },
  { href: "/arknights", label: "Arknights" },
];

export function PageNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-20 mb-8 flex flex-wrap items-center gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-white/5 text-white"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <a
        href="https://blog.houlinzhi.com"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        Blog
      </a>
    </nav>
  );
}
