// ConcludePrimarySale.tsx
import Loader from "@/app/components/Loader";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import {
  HandleTxError,
  NotifyError,
  NotifySuccess,
} from "@/app/context/helper";
import {
  _changeProposalFee,
  _getProposalFees,
} from "@/app/context/helper-voting";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const VotingSetting: React.FC = () => {
  const { particleProvider } = useBitStakeContext();
  const { address } = useAccount();

  const [fee, setFee] = useState(0);
  const [feeLoading, setFeeLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [changingFee, setChangingFee] = useState(false);

  const handleChangeProposalFee = async () => {
    if (!address) return NotifyError("Please connect your wallet.");

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NotifyError("Please enter a valid rent amount.");
    }

    try {
      setChangingFee(true);
      await _changeProposalFee({
        newFee: amount,
        particleProvider,
      });

      await handleFetchProposalFee();
      NotifySuccess("Rent added successfully.");
      setAmount("");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setChangingFee(false);
    }
  };

  const handleFetchProposalFee = async () => {
    try {
      setFeeLoading(true);
      const proposalFee = await _getProposalFees();
      // console.log("🚀 ~ proposalFee:", proposalFee);
      setFee(proposalFee === null ? 0 : proposalFee);
    } catch (error: any) {
    } finally {
      setFeeLoading(false);
    }
  };

  useEffect(() => {
    handleFetchProposalFee();
  }, []);

  return (
    <Card className="max-w-sm w-full">
      <CardContent className="space-y-6">
        <Card className="rounded-xl">
          <CardContent>
            <div className="space-y-2">
              <p className="text-base 3xl:text-xl text-grey-6">Current Proposal Creation Fee</p>
              <p className="text-2xl 3xl:text-3xl font-bold">{feeLoading ? <Skeleton className="h-14 w-32" /> : `${fee} USDC`}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Label>
            Enter New Proposal Fee
          </Label>
          <Input
            type="number"
            placeholder="Enter New Proposal Fee"
            className="border rounded px-4 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          onClick={handleChangeProposalFee}
          loading={changingFee}
        >
          Update Proposal Fee
        </Button>
      </CardContent>
    </Card>
  );
};

export default VotingSetting;
