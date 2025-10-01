// DashboardNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { useSidebar } from "@/app/hook/useSidebar";

interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
}

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
  isHeader?: boolean
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false,
  isHeader = false
}: DashboardNavProps) {
  const path = usePathname();
  const { isMinimized } = useSidebar();

  if (!items?.length) {
    return null;
  }

  return (
    <nav className="flex w-full flex-col gap-1 navbar:flex-row 2xl:gap-1">
      {items.map((item, index) => {
        if (!item.href) return null;

        // Determine if the current path is active
        const isActive = !item.external && path === item.href;

        const linkClasses = cn(
          "flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium transition-all duration-300 ease-in-out hover:bg-foreground hover:text-background hover:duration-300 navbar:my-0 navbar:py-1",
          isActive ? `bg-foreground ${isHeader ? 'text-[#412B00]' : 'text-pitchBlack'}` : "transparent",
          item.disabled && "cursor-not-allowed opacity-80"
        );

        const content =
          isMobileNav || (!isMinimized && !isMobileNav) ? (
            <span className={`mx-3 truncate ${isHeader ? 'text-[#412B00]' : 'text-pitchBlack'} text-lg navbar:text-sm xl:text-base 2xl:text-lg`}>
              {item.title}
            </span>
          ) : (
            ""
          );

        if (item.external) {
          return (
            <a
              key={index}
              href={item.href}
              rel="noopener noreferrer"
              className={linkClasses}
              onClick={() => {
                if (setOpen) setOpen(false);
              }}
            >
              {content}
            </a>
          );
        } else {
          return (
            <Link
              key={index}
              href={item.disabled ? "/" : item.href}
              className={linkClasses}
              onClick={() => {
                if (setOpen) setOpen(false);
              }}
            >
              {content}
            </Link>
          );
        }
      })}
    </nav>
  );
}
