"use client";

import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { Skeleton } from "@/app/components/ui/Skeleton";
import PendingForms from "@/app/components/PendingForms";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Button } from "@/app/components/ui/button";
import { FiRefreshCw } from "react-icons/fi";
import Pagination from "@/app/components/table/Pagination";
import { Card } from "@/app/components/ui/card";
import PauseUnpauseRequests from "./PauseUnpauseRequests";

const PropertyRequests: React.FC = () => {
  const {
    allFormRequested,
    allFormRequestedLoading,
    isFormOwner,
    refreshAllRequestedForms,
  } = useBitStakeContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);


  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = allFormRequested.slice(startIndex, endIndex);

  return (
    <>
      <div className="max-w-full mx-auto w-full">

        <div>
          {/* Refresh Button */}
          <div className="w-full flex justify-between items-center gap-4 mb-5">
            <PauseUnpauseRequests />
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    className="text-base"
                    disabled={allFormRequestedLoading}
                    onClick={() => refreshAllRequestedForms(isFormOwner)}
                  >
                    <FiRefreshCw
                      className={`${allFormRequestedLoading ? "animate-spin" : ""
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
          {/* Table */}
          <Card className="space-y-6">
            <PendingForms currentRows={currentRows} loading={allFormRequestedLoading} />
            <Pagination
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={allFormRequested.length}
              onPageChange={(page) => setCurrentPage(page)}
              onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setCurrentPage(1);
              }}
            />
          </Card>
        </div>
      </div >
    </>
  );
};

export default PropertyRequests;
