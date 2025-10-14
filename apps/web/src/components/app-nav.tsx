"use client";

import { useCallback, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { defaultLocale } from "@/i18n/config";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/shadcn-io/ai/loader";

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
  const tAuth = useTranslations("auth");

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setLogoutOpen(true);
      setLogoutLoading(true);
      await signOut({ callbackUrl: localeLogin });
    } catch (error) {
      console.error("[app-nav] Failed to sign out", error);
      setLogoutLoading(false);
      setLogoutOpen(false);
    }
  }, [localeLogin]);

  const navItems: NavItem[] = [...BASE_NAV_ITEMS];
  if (userRole === "ADMIN") {
    navItems.push({ href: "/admin/users", labelKey: "adminUsers" });
    navItems.push({ href: "/admin/models", labelKey: "adminModels" });
  }

  return (
    <header className="border-b bg-card">
      <div className="flex w-full flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
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

        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {userEmail ? (
              <span className="hidden max-w-[200px] truncate text-muted-foreground sm:inline">
                {userEmail}
              </span>
            ) : null}
         </div>
          {userEmail ? (
            <span className="max-w-[200px] truncate text-muted-foreground sm:hidden">
              {userEmail}
            </span>
          ) : null}
          <button
            onClick={handleLogout}
            className="w-full rounded-md border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted sm:w-auto"
          >
            {tCta("logout")}
          </button>
        </div>
      </div>
      <Dialog open={logoutOpen} onOpenChange={(next) => !logoutLoading && setLogoutOpen(next)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{tAuth("logout.title")}</DialogTitle>
            <DialogDescription>{tAuth("logout.description")}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/40 px-4 py-3">
            <Loader size={18} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">
              {tAuth("logout.signingOut")}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
