"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { defaultLocale } from "@/i18n/config";
import { useTranslations } from "next-intl";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard" as const },
  { href: "/kb", labelKey: "kbs" as const },
];

export function AppNav({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? defaultLocale;
  const localeLogin = `/${locale}/login`;
  const tNav = useTranslations("common.nav");
  const tCta = useTranslations("common.cta");

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <nav className="flex items-center gap-4 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
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
