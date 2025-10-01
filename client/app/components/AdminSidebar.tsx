"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface LinkItem {
  href: string;
  label: string;
  icon?: string;
}

interface Links {
  title: string;
  links: LinkItem[];
}

const AdminSidebar = () => {
  const pathname = usePathname();

  const sidebarLinks: Links[] = [
    {
      title: "Dashboard",
      links: [
        {
          href: "/dashboard/admin-setting",
          label: "Dashboard",
          icon: "/assets/icons/setting.svg",
        }
      ],
    },
    {
      title: "Admin Settings",
      links: [
        {
          href: "/dashboard/admin-setting/form-settings",
          label: "Form Settings",
          icon: "/assets/icons/setting.svg",
        },
        {
          href: "/dashboard/admin-setting/market-settings",
          label: "Market Settings",
          icon: "/assets/icons/setting.svg",
        },
        {
          href: "/dashboard/admin-setting/rent-settings",
          label: "Rent Settings",
          icon: "/assets/icons/setting.svg",
        },
        {
          href: "/dashboard/admin-setting/voting-settings",
          label: "Voting Settings",
          icon: "/assets/icons/setting.svg",
        }
      ],
    },
  ];

  return (
    <div>
      <div className="mb-14 mt-2 flex items-center gap-3">
        <Link href={"/dashboard/admin-setting"} className="cursor-pointer">
          <Image
            src="/assets/logo.svg"
            alt="Logo"
            width={250}
            height={60}
            className="md:w-[200px] w-[150px]"
          />
        </Link>
      </div>
      <div className="my-14">
        <div className="flex flex-col gap-10 w-full">
          {sidebarLinks.map((section, index) => (
            <div key={index} className="flex flex-col gap-3 w-full">
              <h3 className="text-xs font-bold text-black px-4">
                {section.title}
              </h3>
              <div className="flex flex-col gap-2">
                {section.links.map((link, idx) => (
                  <Link key={idx} href={link.href}>
                    <div
                      className={`group flex items-center gap-2 w-full px-[1rem] py-[0.5rem] rounded-[10px] 
                      ${pathname === link.href
                          ? "bg-custom text-[#2892F3]"
                          : "text-primary-grey"
                        } 
                      hover:bg-blue-100 hover:text-[#2892F3] transition-all duration-200`}
                    >
                      {link.icon && (
                        <Image
                          src={link.icon}
                          alt="icon"
                          width={22}
                          height={22}
                          className={`${pathname === link.href
                            ? "grayscale-0 brightness-100"
                            : "grayscale-[1] brightness-[0.2]"
                            } group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-200`}
                        />
                      )}
                      <h2 className="text-[14.4px] font-medium">
                        {link.label}
                      </h2>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
