"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { defaultLocale } from "@/i18n/config";
import { useTranslations } from "next-intl";

type NavItem = {
  href: string;
  labelKey: "dashboard" | "kbs" | "adminUsers" | "adminModels";
};

const BASE_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard" },
  { href: "/kb", labelKey: "kbs" },
];

export function AppNav({
  userEmail,
  userRole,
}: {
  userEmail?: string | null;
  userRole?: "VIEWER" | "EDITOR" | "ADMIN" | null;
}) {
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? defaultLocale;
  const localeLogin = `/${locale}/login`;
  const tNav = useTranslations("common.nav");
  const tCta = useTranslations("common.cta");

  const navItems: NavItem[] = [...BASE_NAV_ITEMS];
  if (userRole === "ADMIN") {
    navItems.push({ href: "/admin/users", labelKey: "adminUsers" });
    navItems.push({ href: "/admin/models", labelKey: "adminModels" });
  }

  return (
    <header className="border-b bg-card">
      <div className="flex w-full items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
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
                {tNav(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          <span className="text-muted-foreground">{userEmail}</span>
          <button
            onClick={() => signOut({ callbackUrl: localeLogin })}
            className="rounded-md border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
          >
            {tCta("logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
