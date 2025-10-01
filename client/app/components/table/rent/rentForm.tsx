// components/RentTable.tsx
"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { _withdrawRent } from "@/app/context/helper-rent";
import { NotifyError, NotifySuccess } from "@/app/context/helper";
import { Loader2 } from "lucide-react";
import { ClaimableRentsType } from "@/app/context/types";
import { useBitStakeContext } from "@/app/context/BitstakeContext";

interface RentTableProps {
    rows: ClaimableRentsType[];
}

export default function RentTable({ rows }: RentTableProps) {
    const [isLoading, setIsLoading] = useState(false);

    const { address: account } = useAccount();
    const { particleProvider, handleRefreshUserRents } = useBitStakeContext();

    const claimRent = async (rent: ClaimableRentsType, setLoading: (b: boolean) => void) => {
        if (!account) {
            return NotifyError("Please connect your wallet");
        }
        setLoading(true);
        try {
            await _withdrawRent({
                propertyId: Number(rent.propertyId),
                particleProvider,
            });
            NotifySuccess("Rent claimed successfully");
            await handleRefreshUserRents(account);
        } catch (err: any) {
            NotifyError(err.reason || err.message || "Claim failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="text-left text-xs font-medium text-grey-5 uppercase tracking-wider">
                        <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">Property Id</th>
                        <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">End Time</th>
                        <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">Stakes Owned</th>
                        <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">Payout</th>
                        <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">Claim</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center h-32 py-4">
                                No Records Found
                            </td>
                        </tr>
                    ) : (
                        rows.map((rent) => {
                            const formattedStart = new Date(rent.endTime * 1000).toLocaleString();
                            const payout = (rent.userShares * rent.rentPerShare).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            });

                            return (
                                <tr key={rent.propertyId} className="text-nowrap">
                                    <td className="px-3 sm:px-6 py-4 border-b">{rent.propertyId}</td>
                                    <td className="px-3 sm:px-6 py-4 border-b">{formattedStart}</td>
                                    <td className="px-3 sm:px-6 py-4 border-b">{rent.userShares.toLocaleString()}</td>
                                    <td className="px-3 sm:px-6 py-4 border-b">
                                        $ {payout}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 border-b">
                                        <button
                                            className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-2 min-w-40 justify-center"
                                            onClick={() => claimRent(rent, setIsLoading)}
                                            disabled={isLoading || rent.rentRemaining === 0}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : `Claim ${payout} USDC`}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
