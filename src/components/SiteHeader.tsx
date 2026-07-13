"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/workspace", label: "Workspace" },
];

const externalItems = [
  { href: "https://blog.houlinzhi.com", label: "Blog" },
  { href: "https://github.com/Zenith0ra", label: "GitHub" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const renderLink = (item: { href: string; label: string }) => {
    const isExternal = item.href.startsWith("http");
    const isActive =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    const className = `block rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive
        ? "bg-white/10 text-white"
        : "text-zinc-400 hover:text-white"
    }`;

    return isExternal ? (
      <a
        key={item.href}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={() => setMenuOpen(false)}
      >
        {item.label}
      </a>
    ) : (
      <Link
        key={item.href}
        href={item.href}
        className={className}
        onClick={() => setMenuOpen(false)}
      >
        {item.label}
      </Link>
    );
  };

  const allItems = [...navItems, ...externalItems];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#1b1b1e]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight text-white"
        >
          Linzhi Hou
        </Link>

        <nav className="hidden items-center gap-0.5 sm:flex">
          {allItems.map((item) => {
            const isExternal = item.href.startsWith("http");
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return isExternal ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:text-white sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/5 px-4 pb-3 sm:hidden">
          {allItems.map(renderLink)}
        </nav>
      )}
    </header>
  );
}
