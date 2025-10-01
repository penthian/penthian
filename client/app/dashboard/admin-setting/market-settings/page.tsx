"use client";

import { useState } from "react";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import AdminSidebar from "@/app/components/AdminSidebar";
import Header from "@/app/components/Header";
import { ConnectWalletButton } from "@/app/components/ConnectWalletButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Button } from "@/app/components/ui/button";
import { FiRefreshCw } from "react-icons/fi";
import ConcludePrimarySale from "./ConcludePrimarySale";
import PlatformFee from "./PlatformFee";
import MinimiumBidIncreament from "./MinBidIncreamentBips";
import FloorPrice from "./MinListingPriceBips";
import AdminDashboard from "@/app/components/AdminDashboard";
import BlackListUser from "./BlackListUser";
import WhitelistAgent from "./WhitelistAgent";
import ExclusiveReferralBips from "./ExclusiveReferralBips";
import DefaultReferralBips from "./DefaultReferralBips";

const AdminSetting = () => {
  const {
    allFormRequested,
    allFormRequestedLoading,
    concludablePropertiesLoading,
    isFormOwner,
    isRentOwner,
    isVotingOwner,
    isMarketOwner,
    refreshAllRequestedForms,
    refreshConcludeableListings,
    isFormOwnerLoading,
    isRentOwnerLoading,
  } = useBitStakeContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = allFormRequested.slice(startIndex, endIndex);

  // if(isFormOwnerLoading || isRentOwnerLoading) {
  //   return (
  //     <div className="w-full min-h-screen flex items-center justify-center">
  //       <p>Loading skeleton here</p>
  //     </div>
  //   );
  // }

  return (
    <AdminDashboard className="space-y-6 3xl:space-y-10">
      {isMarketOwner ? (
        <div className="space-y-6 3xl:space-y-10">
          <div className="w-full flex justify-end items-center">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    className="text-base"
                    disabled={concludablePropertiesLoading}
                    onClick={() => refreshConcludeableListings(isFormOwner)}
                  >
                    <FiRefreshCw
                      className={`${
                        concludablePropertiesLoading ? "animate-spin" : ""
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white p-1 px-4 text-base rounded-lg">
                  <p>Refresh Data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ConcludePrimarySale />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 3xl:gap-10 w-full">
            <PlatformFee />
            <MinimiumBidIncreament />
            <FloorPrice />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 3xl:gap-10 w-full">
            <DefaultReferralBips />
            <ExclusiveReferralBips />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 3xl:gap-10 w-full">
            <BlackListUser />
            <WhitelistAgent />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[45dvh] text-bold text-xl">
          Only Market Owner is allowed.
        </div>
      )}
    </AdminDashboard>
  );
};

export default AdminSetting;
