"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { adminheaderLinks, headerLinks } from "../assets/header-links";
import { useBitStakeContext } from "../context/BitstakeContext";

const Sidebar: React.FC = () => {
  const { userAccess, isAnyOneAdmin, isAdminPage } = useBitStakeContext();
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
    <aside className="min-w-72 w-72 lg:block hidden bg-white">
      <div className="space-y-8 3xl:space-y-10 w-72 fixed py-3 px-3 h-screen UM_sidebar_scroll overflow-y-scroll">
        <div className="flex items-center justify-center w-full">
          <Link href={"/"} className="cursor-pointer">
            <Image
              src="/assets/logo.svg"
              alt="Logo"
              width={250}
              height={60}
              className="md:w-[200px] w-[150px]"
            />
          </Link>
        </div>

        <div className="flex flex-col gap-8 w-full">
          {modifiedLinks.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-3 w-full">
              <h3 className="font-bold text-primary-grey px-4">
                {section.title}
              </h3>
              <div className="flex flex-col gap-1">
                {section.links.map((link, lIdx) => {
                  const isActive = currentLink?.href === link.href;
                  const Icon = link.icon;

                  return (
                    <Link key={lIdx} href={link.href}>
                      <div
                        className={`
                    group flex items-center gap-2 w-full px-4 py-2 rounded-xl
                    ${isActive ? "bg-navBlue text-black" : "text-primary-grey"}
                    hover:bg-navBlue hover:text-black group transition-all ease-in-out duration-100 hover:duration-100
                  `}
                      >
                        {Icon && (
                          <Icon
                            className={`h-5 w-5 ${isActive ? "text-black" : "text-grey-2"
                              } group-hover:duration-100 group-hover:text-black`}
                            strokeWidth={2.4}
                          />
                        )}
                        <h2 className="font-medium">
                          {link.label}
                        </h2>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {isAnyOneAdmin && <Link href={`/dashboard/${isAdminPage ? 'primary-marketplace' : 'admin-setting'}`}>
            <Button variant='outline' className='w-full'>
              {isAdminPage ? 'User' : 'Admin'} Dashboard
            </Button>
          </Link>
          }

          {/* Help Center */}
          <div className="bg-black py-6 px-4 rounded-4xl text-white flex flex-col items-center justify-center gap-4">
            <p className="w-full text-center font-bold">
              Do you have a questions?
            </p>
            <Button variant='white'>
              Visit the Help Center
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
