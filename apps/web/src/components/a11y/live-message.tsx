"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type LiveTone = "polite" | "assertive";

type LiveMessageProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: LiveTone;
  visuallyHidden?: boolean;
};

const LiveMessage = React.forwardRef<HTMLSpanElement, LiveMessageProps>(
  ({ tone = "polite", visuallyHidden = false, className, ...props }, ref) => {
    const role = tone === "assertive" ? "alert" : "status";

    return (
      <span
        {...props}
        ref={ref}
        role={role}
        aria-live={tone}
        className={cn(visuallyHidden ? "sr-only" : undefined, className)}
      />
    );
  },
);

LiveMessage.displayName = "LiveMessage";

export { LiveMessage };
