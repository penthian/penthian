"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Card } from "@/app/components/ui/card";
import Pagination from "@/app/components/table/Pagination";
import { Property } from "@/app/context/types";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { Badge } from "@/app/components/ui/badge";
import { useAccount } from "wagmi";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { useKYCModal } from "@/app/context/KYCModalContext";
import { getUserClaimableShares } from "@/app/context/subgraph-helpers/market-subgraph";
import { _claimPendingSharesOrFunds, _displayPrimarySaleStatus } from "@/app/context/helper-market";
import { HandleTxError, NotifySuccess, truncateAmount } from "@/app/context/helper";
import UserDashboard from "@/app/components/UserDashboard";
import Link from "next/link";

interface TableRowProps {
    row: Property;
    handleClaimProperty: (propertyId: number) => void;
    loadingPropertyId: number | null;
}

const PendingShareTable: React.FC = () => {
    const { address: account } = useAccount();
    const { kycStatus, openModal } = useKYCModal();
    const { particleProvider } = useBitStakeContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loadingPropertyId, setLoadingPropertyId] = useState<number | null>(null);
    const [tableData, setTableData] = useState<Property[]>([]);
    const [tableDataLoading, setTableDataLoading] = useState<boolean>(true);

    // Fetch the claimable shares
    const fetchData = async () => {
        if (account) {
            setTableDataLoading(true);
            const newTableData = await getUserClaimableShares(account);
            setTableData(newTableData);
            setTableDataLoading(false);
        }
    };

    useEffect(() => {
        if (account) {
            fetchData(); // Call the fetchData function when the component mounts or the account changes
        }
    }, [account]);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows = tableData.slice(startIndex, endIndex);

    const handleClaimProperty = async (propertyId: number) => {
        try {
            if (!account) throw new Error("Please connect wallet");
            if (kycStatus !== "completed") {
                await openModal(account);
                throw new Error("Complete KYC in order to continue");
            }

            setLoadingPropertyId(propertyId);

            const tx = await _claimPendingSharesOrFunds({
                propertyId,
                particleProvider,
            });
            if (tx) {
                NotifySuccess("Primary Shares Claimed Successfully");
                await fetchData();
            }

        } catch (error: any) {
            HandleTxError(error);
        } finally {
            setLoadingPropertyId(null);
        }
    };

    return (
        <UserDashboard>
            <Card className="w-full">

                <div className="overflow-x-auto">
                    {tableDataLoading ? (
                        <div className="border-b p-2 grid-rows-1 grid grid-col-7 gap-10">
                            <Skeleton className="h-40" />
                        </div>
                    ) : tableData.length === 0 ? (
                        <div className="text-center py-4">No Records Found</div>
                    ) : (
                        <table className="min-w-full overflow-x-scroll bg-white">
                            <thead>
                                <tr className="text-nowrap text-base text-grey-2 tracking-wider">
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-left w-1/7">Property Name</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/7">Fractions Bought</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/7">
                                        <div className="flex items-center gap-2">
                                            <Image src="/assets/USDC.svg" alt="USDC" width={24} height={24} />
                                            USDC Spent
                                        </div>
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/7">
                                        <div className="flex items-center gap-2">
                                            <Image src="/assets/eth.svg" alt="ETH" width={24} height={24} />
                                            ETH Spent
                                        </div>
                                    </th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/7">Status</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/7">Action</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-right w-1/7">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        row={row}
                                        handleClaimProperty={handleClaimProperty}
                                        loadingPropertyId={loadingPropertyId}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    totalItems={tableData.length}
                    onPageChange={(page) => setCurrentPage(page)}
                    onRowsPerPageChange={(r) => {
                        setRowsPerPage(r);
                        setCurrentPage(1);
                    }}
                />
            </Card>
        </UserDashboard>
    );
};

const TableRow = ({ row, handleClaimProperty, loadingPropertyId }: TableRowProps) => {
    return (
        <tr className="text-nowrap">
            <td className="px-3 sm:px-6 py-4 border-b">{row.propertyName}</td>
            <td className="px-3 sm:px-6 py-4 border-b text-center">{row.fractionsBought}</td>
            <td className="px-3 sm:px-6 py-4 border-b text-center">{truncateAmount(String(row.usdcSpent))}</td>
            <td className="px-3 sm:px-6 py-4 border-b text-center">{truncateAmount(String(row.ethSpent), 6)}</td>
            <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Badge
                    className={`px-3 py-1 text-sm rounded-full w-fit 
                        ${row.status === "none" ? "border-grey-6 text-grey-3" :
                            row.status === "ongoing" ? "border-lightBlue text-primary" :
                                row.status === "claim" ? "border-Green text-Green" :
                                    row.status === "refund" ? "border-Red text-Red" : "border-grey-6 text-grey-6"}`}
                >
                    {_displayPrimarySaleStatus(row.status)}
                </Badge>
            </td>
            <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Button
                    onClick={() => handleClaimProperty(row.propertyId)}
                    loading={loadingPropertyId === row.propertyId}
                    disabled={row.status === "ongoing"}
                >
                    Claim
                </Button>
            </td>
            <td className="px-3 sm:px-6 py-4 border-b text-right">
                <Link
                    href={`/dashboard/primary-marketplace/productdetail/${row.propertyId}`}
                    className="bg-primary hover:bg-primary/80 text-white rounded-full py-2 px-4"
                >
                    View
                </Link>
            </td>
        </tr>
    );
};

export default PendingShareTable;
