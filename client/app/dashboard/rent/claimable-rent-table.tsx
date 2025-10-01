"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import Pagination from "@/app/components/table/Pagination";
import { ClaimableRentsType } from "@/app/context/types";
import { Button } from "@/app/components/ui/button";
import { useAccount } from "wagmi";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { NotifyError, NotifySuccess } from "@/app/context/helper";
import { _withdrawRent } from "@/app/context/helper-rent";

interface ClaimableRentTableType {
    rows: ClaimableRentsType[]
}

const ClaimableRentTable: React.FC<ClaimableRentTableType> = ({ rows }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [buttonLoading, setButtonLoading] = useState<{ [key: string]: boolean }>({});

    const { address: account } = useAccount();
    const { particleProvider, handleRefreshUserRents } = useBitStakeContext();

    const handleClaimRent = async (rent: ClaimableRentsType) => {
        if (!account) {
            return NotifyError("Please connect your wallet");
        }
        setIsLoading(true);
        setButtonLoading((prev) => ({
            ...prev,
            [rent.propertyId]: true,
        }));

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
            setIsLoading(false);
            setButtonLoading((prev) => ({
                ...prev,
                [rent.propertyId]: false,
            }));
        }
    };

    return (
        <Card className="w-full shadow-none border">
            <CardContent>
                <div className={`overflow-x-auto`}>
                    {rows.length === 0 ? (
                        <div className="text-center py-4">No Rent Available</div>
                    ) : (
                        <table className="min-w-full overflow-x-scroll bg-white">
                            <thead>
                                <tr className="text-nowrap text-base text-grey-2 tracking-wider whitespace-nowrap">
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-left w-1/5">Property ID</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">End Time</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">Stakes Owned</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">Payout</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">Claim</th>
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
                                                <td className="px-3 sm:px-6 py-4 border-b text-center">{formattedStart}</td>
                                                <td className="px-3 sm:px-6 py-4 border-b text-center">{rent.userShares.toLocaleString()}</td>
                                                <td className="px-3 sm:px-6 py-4 border-b text-center">
                                                    $ {payout}
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 border-b text-center">
                                                    <Button
                                                        onClick={() => handleClaimRent(rent)}
                                                        disabled={isLoading || rent.rentRemaining === 0}
                                                        loading={buttonLoading[rent.propertyId] || false}
                                                    >
                                                        Claim Rent
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {
                    rows.length > 0 && <Pagination
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        totalItems={rows.length}
                        onPageChange={(page) => setCurrentPage(page)}
                        onRowsPerPageChange={(r) => {
                            setRowsPerPage(r);
                            setCurrentPage(1);
                        }}
                    />
                }
            </CardContent>
        </Card>
    );
};

export default ClaimableRentTable;
