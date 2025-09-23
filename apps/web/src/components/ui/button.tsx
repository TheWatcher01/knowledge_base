import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent px-4 py-2 text-sm font-medium tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(0,23,51,0.35)] shadow-[0_14px_32px_-24px_rgba(187,218,255,0.65)]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--kb-accent)] text-[var(--kb-background)] hover:bg-[#d2e7ff] hover:text-[var(--kb-background)] shadow-[0_18px_36px_-18px_rgba(128,186,255,0.75)]",
        destructive:
          "bg-[var(--kb-error)] text-white hover:bg-[color-mix(in_srgb,var(--kb-error)_85%,white_15%)] focus-visible:ring-[color-mix(in_srgb,var(--kb-error)_65%,white_35%)]",
        outline:
          "border border-[var(--kb-border)] bg-[color-mix(in_srgb,var(--kb-surface)_94%,black_6%)] text-[var(--kb-text)] hover:bg-[color-mix(in_srgb,var(--kb-highlight)_25%,transparent_75%)]",
        secondary:
          "bg-[var(--kb-surface-muted)] text-[var(--kb-text-muted)] hover:bg-[color-mix(in_srgb,var(--kb-surface-muted)_85%,white_15%)] hover:text-[var(--kb-text)]",
        ghost:
          "text-[var(--kb-text-muted)] hover:bg-[rgba(187,218,255,0.08)] hover:text-[var(--kb-text)]",
        link:
          "text-[var(--kb-accent)] underline-offset-4 hover:text-[var(--kb-accent-strong)] hover:underline",
      },
      size: {
        default: "h-10 px-4 has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
