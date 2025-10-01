"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Card, CardHeader } from "@/app/components/ui/card";
import Pagination from "@/app/components/table/Pagination";
import {
  AgentGroupedData,
  AgentPropertyCommission,
  PrimarySaleStatus,
} from "@/app/context/types";
import { Button } from "@/app/components/ui/button";
import {
  _claimReferralCommission,
  _displayPrimarySaleStatus,
  _getAgentClaimableCommission,
  _getPrimarySaleState,
} from "@/app/context/helper-market";
import { useAccount } from "wagmi";
import { useKYCModal } from "@/app/context/KYCModalContext";
import { HandleTxError, NotifySuccess } from "@/app/context/helper";
import { useBitStakeContext } from "@/app/context/BitstakeContext";

interface TableRowProps {
  form: AgentGroupedData;
  agentAddress: string;
}

interface AgentTableProps {
  agentGroupedData: AgentGroupedData[];
  loading: boolean;
}

const AgentTable = ({ agentGroupedData, loading }: AgentTableProps) => {
  const { address } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const data = agentGroupedData;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = data.slice(startIndex, endIndex);

  return (
    <>
      <div className="max-w-full w-full">
        <Card>
          <CardHeader className="text-xl font-bold text-grey-6">
            Reward Claim
          </CardHeader>

          <div className="overflow-x-auto">
            {loading ? (
              <Skeleton className="h-40 mx-2 w-[99%]" />
            ) : (
              <>
                <table className="min-w-full overflow-x-scroll bg-white">
                  <thead>
                    <tr className="text-nowrap text-base text-grey-2 tracking-wider border-t-2">
                      <th className="px-3 sm:px-6 py-3 border-b-2 text-left w-1/5">
                        Property ID
                      </th>
                      <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">
                        Claim Amount (ETH)
                      </th>
                      <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">
                        Claim Amount (USDC)
                      </th>
                      <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 border-b-2 text-center w-1/5">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length > 0 && address ? (
                      currentRows.map((form, index) => (
                        <TableRow
                          key={index}
                          form={form}
                          agentAddress={address}
                        />
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

export default AgentTable;

const TableRow = ({ form, agentAddress }: TableRowProps) => {
  const { kycStatus, openModal } = useKYCModal();
  const { particleProvider } = useBitStakeContext();
  const [claimableAmount, setClaimableAmount] =
    useState<AgentPropertyCommission>({
      commissionInETH: 0,
      commissionInUSDC: 0,
    });
  const [claimableAmountLoading, setClaimableAmountLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [primarySaleStatus, setPrimarySaleStatus] =
    useState<PrimarySaleStatus>("none");

  const handleFetchClaimableAmount = async () => {
    try {
      setClaimableAmountLoading(true);
      const state = await _getPrimarySaleState({
        propertyId: form.propertyId,
      });
      setPrimarySaleStatus(state);
      const commission = await _getAgentClaimableCommission(
        agentAddress,
        form.propertyId
      );
      if (!commission) {
        setClaimableAmount({
          commissionInETH: 0,
          commissionInUSDC: 0,
        });
        return;
      }
      setClaimableAmount(commission);
    } catch (error: any) {
      setClaimableAmount({
        commissionInETH: 0,
        commissionInUSDC: 0,
      });
    } finally {
      setClaimableAmountLoading(false);
    }
  };

  const handleClaimCommission = async () => {
    if (kycStatus !== "completed") {
      await openModal(agentAddress);
      throw new Error("Complete KYC in order to continue");
    }

    try {
      setClaimLoading(true);

      await _claimReferralCommission({
        propertyId: form.propertyId,
        particleProvider,
      });

      await handleFetchClaimableAmount();
      NotifySuccess("commission claimed successfully.");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setClaimLoading(false);
    }
  };

  useEffect(() => {
    handleFetchClaimableAmount();
  }, []);

  return (
    <>
      {!claimableAmountLoading ? (
        <Skeleton className="h-10 w-full p-2" />
      ) : claimableAmount.commissionInETH == 0 &&
        claimableAmount.commissionInUSDC == 0 ? null : (
        <tr className="text-nowrap">
          <td className="px-3 sm:px-6 py-4 border-b">{form.propertyId}</td>
          <td className="px-3 sm:px-6 py-4 border-b text-center">
            {claimableAmount.commissionInETH}
          </td>
          <td className="px-3 sm:px-6 py-4 border-b text-center">
            {claimableAmount.commissionInUSDC}
          </td>
          <td className="px-3 sm:px-6 py-4 border-b text-center">
            {_displayPrimarySaleStatus(primarySaleStatus)}
          </td>
          <td className="px-3 sm:px-6 py-4 border-b flex items-center justify-center">
            <Button
              onClick={handleClaimCommission}
              loading={claimLoading}
              disabled={primarySaleStatus !== "claim"}
            >
              Claim
            </Button>
          </td>
        </tr>
      )}
    </>
  );
};
