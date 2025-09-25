import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { handleI18nRouting } from "@/i18n/middleware";
import { locales, defaultLocale } from "@/i18n/config";

const PUBLIC_SEGMENTS = ["/", "/login", "/register"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/register"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Étape 1 : laisser le middleware i18n gérer détection + redirections
  let i18nResponse = NextResponse.next();
  if (!pathname.startsWith("/api")) {
    i18nResponse = handleI18nRouting(req);
    if (process.env.NODE_ENV !== "production") {
      const target = i18nResponse.headers.get("location");
      if (target) {
        console.log("[i18n] redirect", { from: pathname, to: target });
      }
    }

    if (i18nResponse.headers.has("location")) {
      // Si `handleI18nRouting` a besoin de rediriger/rewrite, on s'arrête là
      return i18nResponse;
    }
  }

  // Étape 2 : logique d’authentification
  const segments = pathname.split("/").filter(Boolean);
  const potentialLocale = segments[0];
  const hasLocale = locales.includes(potentialLocale as (typeof locales)[number]);

  const normalizedPath =
    hasLocale && segments.length > 1 ? `/${segments.slice(1).join("/")}` : hasLocale ? "/" : pathname;

  const isPublicPage = PUBLIC_SEGMENTS.some(
    (segment) => normalizedPath === segment || normalizedPath.startsWith(`${segment}/`),
  );
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isPublicPage && !isPublicApi) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    if (!token) {
      const locale = hasLocale ? potentialLocale : req.cookies.get("NEXT_LOCALE")?.value ?? defaultLocale;
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/login`;
      redirectUrl.search = req.nextUrl.search;
      if (process.env.NODE_ENV !== "production") {
        console.log("[auth] redirect", { from: pathname, to: redirectUrl.pathname });
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  return i18nResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
