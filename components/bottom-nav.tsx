"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Compass,
  Home,
  MessageCircle,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/discover", label: "Discover", icon: Home },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // Immersive screens: traveler/place/event profiles + chat thread
  if (
    pathname.startsWith("/discover/") ||
    pathname.startsWith("/messages") ||
    (pathname.startsWith("/events/") && pathname !== "/events")
  ) {
    return null;
  }

  return (
    <nav className="safe-bottom-compact border-t border-border/70 bg-background px-0.5 pt-3">
      <ul className="grid grid-cols-5 gap-0">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[10px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active && "stroke-[2.25px]",
                    active && href === "/chats" && "fill-primary",
                  )}
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
