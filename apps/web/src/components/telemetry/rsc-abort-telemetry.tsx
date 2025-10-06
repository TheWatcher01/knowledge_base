"use client";

import { useEffect } from "react";

/**
 * Instruments AbortError from RSC requests in production to send a lightweight signal.
 * Uses navigator.sendBeacon when available, otherwise falls back to fetch with keepalive.
 */
export function RscAbortTelemetry() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const originalFetch = window.fetch.bind(window) as typeof window.fetch;

    const instrumentedFetch: typeof window.fetch = async (input, init) => {
      try {
        return await originalFetch(input as RequestInfo, init as RequestInit);
      } catch (error) {
        const domExceptionCtor = typeof DOMException !== "undefined" ? DOMException : null;
        const isAbortError =
          domExceptionCtor !== null &&
          error instanceof domExceptionCtor &&
          error.name === "AbortError";
        const targetUrl = typeof input === "string"
          ? input
          : input instanceof Request
            ? input.url
            : input instanceof URL
              ? input.toString()
              : undefined;

        if (isAbortError && typeof targetUrl === "string" && targetUrl.includes("_rsc=")) {
          const payload = JSON.stringify({ url: targetUrl, ts: Date.now() });
          const beaconSent = typeof navigator.sendBeacon === "function"
            ? navigator.sendBeacon("/api/telemetry/fetch-abort", payload)
            : false;

          if (!beaconSent) {
            try {
              await originalFetch("/api/telemetry/fetch-abort", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
                keepalive: true,
              });
            } catch {
              // Ignore telemetry sending errors so as not to mask the original error.
            }
          }
        }

        throw error;
      }
    };

    window.fetch = instrumentedFetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
