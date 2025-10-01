"use client";

import { MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { ConnectWalletButton } from "../ConnectWalletButton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import { DashboardNav } from "./dashboard-nav";
import Link from "next/link";

interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NavItem[];
  // playlists: Playlist[];
}

export function MobileSidebar({ className, items }: SidebarProps) {
  const [open, setOpen] = useState(false);

  if (!items?.length) {
    return null;
  }
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon className="cursor-pointer" />
        </SheetTrigger>
        <SheetContent side="left" hideClose className="!px-0 bg-cream z-[1020]">
          <SheetHeader className="mb-5 flex flex-row items-center justify-between space-y-0 px-4">
            <Image
              src="/assets/logo.svg"
              alt="Logo"
              width={150}
              height={30}
              className="block sm:hidden"
            />
            <SheetClose asChild>
              <Button variant="ghost" className="h-10 w-10 p-0">
                <X size={24} />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-5 px-3 py-2">
              <div className="space-y-1">
                <DashboardNav
                  items={items}
                  isMobileNav={true}
                  setOpen={setOpen}
                />
              </div>

              <div className="flex w-full max-w-full items-center justify-center">
                <Link
                  className="w-full max-w-full"
                  href={"/dashboard/primary-marketplace"}
                >
                  <Button variant='secondary' className="w-full text-lg font-bold">
                    Launch&nbsp;dApp
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
