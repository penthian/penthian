"use client";

import { useState } from "react";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Card, CardHeader } from "@/app/components/ui/card";
import Pagination from "@/app/components/table/Pagination";
import { AdminAggregatedAgentData } from "@/app/context/types";
import { shortenWalletAddress } from "@/app/context/helper";
import { useBitStakeContext } from "@/app/context/BitstakeContext";

interface TableRowProps {
    form: AdminAggregatedAgentData;
}

const AdminTable: React.FC = () => {

    const {
        adminPrimarySalesDataLoading,
        adminPrimarySalesData,
    } = useBitStakeContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const data = adminPrimarySalesData.agentData;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows = data.slice(startIndex, endIndex);

    return (
        <>
            <div className="max-w-full w-full">
                <Card>
                    <CardHeader className="text-xl text-grey-6 font-bold">
                        Primary Sales Information
                    </CardHeader>

                    <div className="overflow-x-auto">
                        {adminPrimarySalesDataLoading ? (
                            <div className="border-b p-2 grid-rows-1 grid grid-col-7 gap-10">
                                <Skeleton className="h-40" />
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full overflow-x-scroll bg-white">
                                    <thead>
                                        <tr className="text-nowrap text-base text-grey-2 tracking-wider border-t-2">
                                            <th className="px-3 sm:px-6 py-3 border-b-2 text-left w-1/5">
                                                Agent Wallet Address
                                            </th>
                                            <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">
                                                Total Revenue
                                            </th>
                                            <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">
                                                Clients
                                            </th>
                                            <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">
                                                Properties
                                            </th>
                                            <th className="px-3 sm:px-6 py-3 border-b-2 text-right w-1/5">
                                                Commission
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentRows.length > 0 ? (
                                            currentRows.map((form, index) => (
                                                <TableRow key={index} form={form} />
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={100} className="text-center h-32 py-4">
                                                    No Records Found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                        totalItems={data.length}
                        onPageChange={(page) => setCurrentPage(page)}
                        onRowsPerPageChange={(r) => {
                            setRowsPerPage(r);
                            setCurrentPage(1);
                        }}
                    />
                </Card>
            </div>
        </>
    );
};

export default AdminTable;

const TableRow = ({ form }: TableRowProps) => {

    return (
        <tr className="text-nowrap">
            <td className="px-3 sm:px-6 py-4 border-b">
                {shortenWalletAddress(form.agent, 6)}
            </td>
            <td className="px-3 sm:px-6 py-4 border-b text-center">
                {form.totalInvestment}
            </td>
            <td className="px-3 sm:px-6 py-4 border-b text-center">
                {form.uniqueBuyersCount}
            </td>
            <td className="px-3 sm:px-6 py-4 border-b text-center">
                {form.uniquePropertiesCount}
            </td>
            <td className="px-3 sm:px-6 py-4 border-b flex items-center justify-end">
                {(form.totalCommission).toFixed(3)}
            </td>
        </tr>
    );
};
