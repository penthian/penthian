import React from "react";
import LandingPageContainer from "./LandingPageContainer";
import Image from "next/image";
import Link from "next/link";
import { amlPolicy } from "@/app/MockData/amlPolicy";
import { termsAndConditions } from "@/app/MockData/termsAndConditions";
import { productDisclosure } from "@/app/MockData/productDisclosure";
import { PolicyDialogItem } from "../PolicyDialogItem";
import { socialLinks } from "@/app/data/socialLinks";

function LandingPageFooter() {

  return (
    <>
      <footer className="bg-black text-white w-full p-10 3xl:p-20">
        <LandingPageContainer className="max-w-full">
          <div className="w-full flex flex-col xl:flex-row gap-20 xl:gap-0 items-start justify-between">
            <div className="flex w-full xl:w-1/2 flex-col gap-5 items-center xl:items-start">
              <Image
                src="/assets/logo-white-footer.svg"
                alt="Logo"
                width={250}
                height={60}
                className="md:w-[200px] w-[150px]"
              />
              <p className="text-sm text-grey-2">Address</p>
              <p className="text-sm text-center md:text-start text-swiper-lazy-preloader-white">
                Level 2/627 Chapel St, South Yarra VIC 3141
              </p>
              <div className="flex gap-3 items-center cursor-pointer mt-5">
                {socialLinks.map((link, index) => (
                  <Link key={index} href={link.url} target="_blank">
                    {link.icon}
                  </Link>
                ))}
              </div>
            </div>
            <div className="w-full xl:w-1/2 flex items-center xl:items-start">
              <div className="flex items-start  text-base text-white gap-10 justify-between xl:gap-3 w-full flex-wrap">
                <div>
                  <h3 className="text-grey-2 pb-5">Main</h3>
                  <ul className="flex flex-col gap-4">
                    <li>
                      <Link href="/">Home</Link>
                    </li>
                    <li>
                      <Link href="/about-us">About</Link>
                    </li>
                    <li>
                      <Link href="/dashboard/secondary-marketplace">
                        Properties
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-grey-2 pb-5">Useful Links</h3>
                  <ul className="flex flex-col gap-4">
                    <li>
                      <Link
                        href="https://ownersclub.bitstakeplatform.com/"
                      >
                        Owners Club
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-grey-2 pb-5 sm:ml-3">Policies</h3>
                  <ul className="flex flex-col gap-4 text-start">
                    <PolicyDialogItem
                      dialogTitle="AML Policy"
                      dialogContent={amlPolicy.content}
                    />
                    <PolicyDialogItem
                      dialogTitle="Terms and Conditions"
                      dialogContent={termsAndConditions.content}
                    />
                    <PolicyDialogItem
                      dialogTitle="Product Disclosure Statement"
                      dialogContent={productDisclosure.content}
                    />
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </LandingPageContainer>
      </footer>
    </>
  );
}

export default LandingPageFooter;
