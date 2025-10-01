
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const options = [
  { value: "light", label: "Thème clair", icon: Sun },
  { value: "dark", label: "Thème sombre", icon: Moon },
  { value: "system", label: "Selon le système", icon: Laptop },
] as const;

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = mounted ? theme ?? resolvedTheme ?? "system" : "system";
  const ActiveIcon = options.find((option) => option.value === active)?.icon ?? Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 rounded-full border border-border/50 bg-background/60 p-0 text-muted-foreground shadow-sm transition hover:border-primary/60 hover:text-primary"
          aria-label="Changer de thème"
        >
          <ActiveIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">Changer de thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-[12rem] rounded-xl border border-border/50 bg-popover/90 backdrop-blur">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Apparence
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            data-state={active === value ? "active" : undefined}
            className="flex items-center gap-2 rounded-lg text-sm text-foreground/80 transition data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            data-active={active === value}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
