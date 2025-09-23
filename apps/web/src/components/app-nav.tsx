"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/kb", label: "Knowledge Bases" },
];

export function AppNav({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <nav className="flex items-center gap-4 text-sm font-medium">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{userEmail}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
