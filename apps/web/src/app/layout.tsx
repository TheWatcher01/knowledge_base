import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLocale } from "next-intl/server";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Knowledge Base",
  description: "Centralisez votre savoir.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale(); // Récupère la locale détectée par le middleware

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
