"use client";

import { useEffect } from "react";

/**
 * Filters NextAuth CLIENT_FETCH_ERROR errors triggered by aborting
 * the fetch to /api/auth/session in development environment.
 * Automatically restores the console when unmounted.
 */
export function NextAuthAbortFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const originalError = console.error;

    function patchedConsoleError(...args: unknown[]) {
      const [first, ...rest] = args;
      const firstMessage = typeof first === "string" ? first : "";

      const isNextAuthClientFetchError = firstMessage.includes(
        "[next-auth][error][CLIENT_FETCH_ERROR]",
      );

      if (isNextAuthClientFetchError) {
        const mentionsSessionEndpoint = rest.some((arg) =>
          typeof arg === "string" && arg.includes("/api/auth/session"),
        );
        const hasAbortMessage = rest.some((arg) => {
          if (typeof arg === "string") {
            return arg.includes("net::ERR_ABORTED") || arg.includes("Failed to fetch");
          }
          if (typeof arg === "object" && arg !== null) {
            const maybeError = arg as { message?: string };
            return (
              maybeError.message?.includes("Failed to fetch") ?? false
            );
          }
          return false;
        });

        if (mentionsSessionEndpoint && hasAbortMessage) {
          // Simply ignore the specific aborted /api/auth/session error.
          return;
        }
      }

      originalError(...(args as Parameters<typeof console.error>));
    }

    console.error = patchedConsoleError as typeof console.error;

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
