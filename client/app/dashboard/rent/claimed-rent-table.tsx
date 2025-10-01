"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import Pagination from "@/app/components/table/Pagination";
import { RentWithdrawnEventFormatted } from "@/app/context/types";
import { _withdrawRent } from "@/app/context/helper-rent";

interface ClaimedRentTableType {
    rows: RentWithdrawnEventFormatted[]
}

const ClaimedRentTable: React.FC<ClaimedRentTableType> = ({ rows }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    return (
        <Card className="w-full shadow-none border">
            <CardContent>
                <div className={`overflow-x-auto`}>
                    {rows.length === 0 ? (
                        <div className="text-center py-4">No Claimed History Available</div>
                    ) : (
                        <table className="min-w-full overflow-x-scroll bg-white">
                            <thead>
                                <tr className="text-nowrap text-base text-grey-2 tracking-wider">
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-left w-1/3">Property ID</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/3">Payout</th>
                                    <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/3">Date / Time</th>
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
                                        const formattedStart = new Date(rent.date * 1000).toLocaleString();

                                        return (
                                            <tr key={rent.propertyId} className="text-nowrap">
                                                <td className="px-3 sm:px-6 py-4 border-b">{rent.propertyId}</td>
                                                <td className="px-3 sm:px-6 py-4 border-b text-center">
                                                    $ {rent.payout}
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 border-b text-center">{formattedStart}</td>
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

export default ClaimedRentTable;
