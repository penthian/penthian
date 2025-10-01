"use client";

import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LandingPageFooter from "./landingPage/LadingPageFooter";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { Card, CardContent } from "./ui/card";
import { ConnectWalletButton } from "./ConnectWalletButton";
import Section from "./layout/section-box";
import Link from "next/link";
import Image from "next/image";
import PageLoader from "./page-loader";
import HeroBubbles from "./landingPage/hero-bubbles";
import { earnings } from "./landingPage/Partners";
import { useBitStakeContext } from "../context/BitstakeContext";

const UserDashboard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        `flex flex-col lg:flex-row w-full max-w-full relative`,
        className
      )}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col bg-lightBlue gap-7 lg:w-[20vw]">
        <div className="px-2 sm:px-4 3xl:px-6 pb-10 space-y-7 min-h-screen">
          <Header />
          <main className="max-w-full w-full">{children}</main>
        </div>
        <LandingPageFooter />
      </div>
    </div>
  );
};

export default UserDashboard;
