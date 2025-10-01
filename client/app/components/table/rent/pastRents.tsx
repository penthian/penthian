// components/PastRentTable.tsx
"use client";

import React, { useState } from "react";
import { _withdrawRent } from "@/app/context/helper-rent";
import { RentWithdrawnEventFormatted } from "@/app/context/types";

interface RentTableProps {
    rows: RentWithdrawnEventFormatted[];
}

export default function PastRentTable({ rows }: RentTableProps) {

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border ">
                <thead>
                    <tr className="text-left text-xs font-medium text-grey-5 uppercase tracking-wider">
                        <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">Property Id</th>
                        <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">Payout</th>
                        <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">Date / Time</th>
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
                                    <td className="px-3 sm:px-6 py-4 border-b">
                                        $ {rent.payout}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 border-b">{formattedStart}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
