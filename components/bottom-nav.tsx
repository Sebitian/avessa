"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom-compact border-t border-border/70 bg-background px-2 pt-2">
      <ul className="grid grid-cols-2 gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.25px]")}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
