"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import { BiPlus } from "react-icons/bi";
import { useAccount } from "wagmi";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import UserDashboard from "@/app/components/UserDashboard";
import { PropertyRequestsSkeleton } from "@/app/components/ui/SkeletonCard";
import UserRequestedFormsTable from "@/app/components/UserRequestedForms";

const PropertyRequests = () => {
    const { address: account } = useAccount();
    const { userRequestedForms, userRequestedFormsLoading, setUserRequestedFormsLoading, handleRefreshUserRequestedForms } =
        useBitStakeContext();

    useEffect(() => {
        (async () => {
            setUserRequestedFormsLoading(true);
            if (account) {
                await handleRefreshUserRequestedForms(account);
            }
            setUserRequestedFormsLoading(false);
        })();
    }, [account]);

    return (
        <UserDashboard>
            {userRequestedFormsLoading ? (
                <PropertyRequestsSkeleton />
            ) : (
                <div className="w-full space-y-6">
                    <div className="flex justify-end">
                        {account && (
                            <Link
                                href="/dashboard/request-new-property"
                                className="bg-primary hover:bg-primary/80 text-white um_transition py-3 px-6 rounded-full flex items-center justify-center"
                            >
                                <BiPlus className="text-2xl" />
                                Add New Property Request
                            </Link>
                        )}
                    </div>

                    <UserRequestedFormsTable
                        loading={userRequestedFormsLoading}
                        userRequestedForms={userRequestedForms}
                    />
                </div>
            )}
        </UserDashboard>
    );
};

export default PropertyRequests;
