// LandingPageHeader.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { DashboardNav } from "./dashboard-nav";
import { MobileSidebar } from "./mobile-sidebar";
import { Button } from "../ui/button";
import LandingPageContainer from "./LandingPageContainer";
import { navItems } from "@/app/assets/header-links";
import { useEffect, useState } from "react";

const LandingPageHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <LandingPageContainer
      className={`z-[1000] max-w-full bg-transparent sticky top-5 transition-transform duration-500 ease-in-out ${showHeader ? 'translate-y-0' : '-translate-y-[120%]'
        }`}
    >
      <header
        className={`top-5 rounded-full z-[100] shadow-md mx-auto min-w-60 -mb-[86px] xl:-mb-[90px] backdrop-blur-md bg-white/80 border border-white/30
        flex w-full items-center justify-between py-4 max-w-screen-lg
        transition-all duration-300 px-5 lg:px-10 xl:px-10 2xl:px-5`}
      >
        <Link href={"/"}>
          <Image
            src="/assets/logo.svg"
            alt="Logo"
            width={200}
            height={40}
            className="hidden sm:block h-14"
          />
          <Image
            src="/assets/logo.svg"
            alt="Logo"
            width={150}
            height={30}
            className="block sm:hidden"
          />
        </Link>
        <div className="navbar:flex hidden items-center gap-5">
          <DashboardNav items={navItems} isHeader />
          <Link href={"/dashboard/primary-marketplace"}>
            <Button size='lg' variant='secondary' className="text-base 3xl:text-lg font-bold">
              Launch&nbsp;dApp
            </Button>
          </Link>
        </div>

        <div className="flex navbar:hidden items-center justify-between gap-5">

          <MobileSidebar items={navItems} />
        </div>
      </header>
    </LandingPageContainer>
  );
};

export default LandingPageHeader;
