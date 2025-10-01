"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon, Users, X } from "lucide-react";
import { Button } from "../ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from "../ui/sheet";
import { usePathname } from "next/navigation";
import { adminheaderLinks, headerLinks } from "@/app/assets/header-links";
import { ScrollArea } from "../ui/scroll-area";
import { ConnectWalletButton } from "../ConnectWalletButton";
import { useBitStakeContext } from "@/app/context/BitstakeContext";

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const { userAccess } = useBitStakeContext();
    const pathname = usePathname();

    const finalLinks = pathname.startsWith("/dashboard/admin")
        ? adminheaderLinks
        : headerLinks;

    const modifiedLinks = useMemo(() => {
        return finalLinks.map((section) => {
            const clonedSection = {
                ...section,
                links: [...section.links],
            };

            if (clonedSection.title === "Market" && userAccess.isAgent) {
                const alreadyExists = clonedSection.links.some(
                    (link) => link.href === "/dashboard/agent"
                );

                if (!alreadyExists) {
                    clonedSection.links.push({
                        href: "/dashboard/agent",
                        label: "Agent Dashboard",
                        icon: Users,
                        description: "Agent can view their referral information here",
                    });
                }
            }

            return clonedSection;
        });
    }, [userAccess.isAgent, finalLinks]);

    const allLinks = useMemo(
        () => modifiedLinks.flatMap((sec) => sec.links),
        [modifiedLinks]
    );

    const currentLink = useMemo(() => {
        const matches = allLinks.filter(
            ({ href }) =>
                pathname === href || pathname.startsWith(href + "/")
        );
        if (matches.length === 0) return null;
        return matches.sort((a, b) => b.href.length - a.href.length)[0];
    }, [allLinks, pathname]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <MenuIcon className="cursor-pointer" />
            </SheetTrigger>

            <SheetContent
                side="left"
                hideClose
                className="px-2 bg-white z-[100000] flex flex-col h-screen"
            >
                <SheetHeader className="flex !flex-row items-center justify-between px-4 py-3">
                    <Image
                        src="/assets/logo.svg"
                        alt="Logo"
                        width={150}
                        height={40}
                        className="object-contain"
                    />
                    <SheetClose asChild>
                        <Button variant="ghost" className="h-10 w-10 p-0">
                            <X size={24} />
                        </Button>
                    </SheetClose>
                </SheetHeader>

                <div className="block sm:hidden">
                    <ConnectWalletButton />
                </div>

                <ScrollArea className="flex-1 px-3 h-[50dvh]">
                    {modifiedLinks.map((section) => (
                        <div key={section.title} className="mb-6">
                            <p className="text-xs font-bold text-primary-grey uppercase">
                                {section.title}
                            </p>
                            <div className="mt-2 flex flex-col gap-2">
                                {section.links.map((link) => {
                                    const isActive = currentLink?.href === link.href;
                                    const Icon = link.icon;
                                    return (
                                        <Link key={link.href} href={link.href}
                                            className={`flex items-start gap-3 py-2 rounded-xl transition 
                                                     ${isActive
                                                    ? "bg-navBlue text-black"
                                                    : "hover:bg-navBlue hover:text-black text-primary-grey"
                                                }`}
                                            onClick={() => setOpen(false)}
                                        >
                                            {Icon && <Icon className="h-5 w-5 shrink-0" strokeWidth={2.4} />}
                                            <div className="flex-1">
                                                <p className="font-medium">{link.label}</p>
                                                {/* {link.description && (
                                                    <p className="text-xs text-secondary mt-1">
                                                        {link.description}
                                                    </p>
                                                )} */}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="space-y-6">
                        {/* Help Center */}
                        <div className="bg-black py-6 rounded-4xl text-white flex flex-col items-center justify-center gap-4">
                            <p className="w-full text-center font-bold">
                                Do you have a questions?
                            </p>
                            <Button variant='white'>
                                Visit the Help Center
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
