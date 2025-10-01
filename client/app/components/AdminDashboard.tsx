"use client";

import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import LandingPageFooter from "./landingPage/LadingPageFooter";
import { useBitStakeContext } from "../context/BitstakeContext";
import { Card, CardContent } from "./ui/card";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { cn } from "@/lib/utils";

const AdminDashboard: React.FC<{ children: React.ReactNode, className?: string }> = ({
    children,
    className
}) => {
    const { isAnyOneAdmin } = useBitStakeContext();

    return isAnyOneAdmin ? <div className="flex flex-col lg:flex-row w-full min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-lightBlue gap-7 lg:w-[20vw]">
            <div className="px-2 sm:px-4 3xl:px-6 pb-10 space-y-7 min-h-screen">
                <Header />
                <main className={cn(`flex-1 max-w-full w-full`, className)}>{children}</main>
            </div>
            <LandingPageFooter />
        </div>
    </div> : <div className="w-full min-h-screen flex items-center justify-center">
        <Card className="max-w-96 flex flex-col gap-4 items-center justify-center">
            <CardContent className="flex flex-col items-center justify-items-center gap-4">
                <h2 className="text-3xl font-medium">Only For Admin</h2>
                <p>Please Connect Admin Wallet</p>
                <div className="w-full flex items-center justify-center">
                    <ConnectWalletButton />
                </div>
            </CardContent>
        </Card>
    </div>
};

export default AdminDashboard;
