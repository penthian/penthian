import React from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from 'app/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { navItems } from '@/app/assets/header-links'

export const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {

    const pathname = usePathname()

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetTrigger />
            <SheetContent side="left" className='px-4'>
                <SheetHeader>
                    <SheetTitle className="flex justify-between">
                        <Link href="/">
                            <Image
                                src="/assets/logo.svg"
                                alt="Logo"
                                width={200}
                                height={40}
                                className="hidden sm:block h-14"
                            />
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link key={item.title} href={item.href} passHref>
                            <p
                                className={cn(
                                    "cursor-pointer p-2 um-transition rounded-md hover:bg-accent-black/50 hover:text-accent-black",
                                    pathname === item.href ? "bg-primary text-white " : "text-muted-black"
                                )}
                                onClick={onClose}
                            >
                                {item.title}
                            </p>
                        </Link>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
