"use client";

import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { HeadingPara } from "./layout/heading";
import { MobileSidebar } from "./dashboard/mobile-sidebar";
import { headerLinks, adminheaderLinks } from "../assets/header-links";
import { useMemo } from "react";
import { useBitStakeContext } from "../context/BitstakeContext";
import { Users } from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const { userAccess } = useBitStakeContext();

  const finalLinks = pathname.startsWith("/dashboard/admin")
    ? adminheaderLinks
    : headerLinks;

  const isRequestPage = pathname === "/dashboard/request-new-property";
  const isRequestPageEdit = pathname.startsWith("/dashboard/request-new-property/edit-property");

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

  const current = useMemo(() => {
    const matches = allLinks.filter(
      ({ href }) =>
        pathname === href || pathname.startsWith(href + "/")
    );
    if (matches.length === 0)
      return { label: "", description: "" };
    return matches.sort((a, b) => b.href.length - a.href.length)[0];
  }, [allLinks, pathname]);

  return (
    <header className="w-full py-4 flex justify-between items-center">

      {isRequestPage ? (
        <HeadingPara
          title="Property Request Form"
          para="You can request the property."
          tag="h1"
        />
      ) : isRequestPageEdit ? (
        <HeadingPara
          title="Property Update"
          para="You can update the property."
          tag="h1"
        />
      ) : (
        <HeadingPara
          title={current.label}
          para={current.description}
          tag="h1"
        />
      )}

      <div className="flex items-center sm:gap-4">
        <div className="hidden sm:block">
          <ConnectWalletButton />
        </div>
        <div className='block cursor-pointer lg:hidden'>
          <MobileSidebar />
        </div>
      </div>
    </header>
  );
};

export default Header;
