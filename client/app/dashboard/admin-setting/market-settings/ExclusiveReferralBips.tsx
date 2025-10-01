// ExclusiveReferralBips.tsx
import React, { useEffect, useState } from "react";
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
import { _getExclusiveReferralBips, _addExclusiveReferralBips } from "@/app/context/helper-market";
import { MARKET_BASE } from "@/app/utils/constants";
import { useAccount } from "wagmi";

const ExclusiveReferralBips: React.FC = () => {
  const { particleProvider } = useBitStakeContext();
  const { address } = useAccount();

  const [agent, setAgent] = useState("");
  const [referralBips, setReferralBips] = useState(0);
  const [bipsLoading, setBipsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [addingBips, setAddingBips] = useState(false);

  const handleAddExclusiveReferralBips = async () => {
    if (!address) return NotifyError("Please connect your wallet.");

    if (!agent || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NotifyError("Please enter a valid agent address and referral percentage.");
    }

    try {
      setAddingBips(true);

      const _newReferralBips = Math.floor(parseFloat(amount) * 100);

      if (_newReferralBips >= MARKET_BASE) throw new Error("Invalid Referral Percentage");

      await _addExclusiveReferralBips({
        agentAddress: agent,
        newReferralBips: String(_newReferralBips),
        particleProvider,
      });

      await handleFetchExclusiveReferralBips();
      NotifySuccess("Agent Exclusive Referral % updated successfully.");
      setAgent("");
      setAmount("");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setAddingBips(false);
    }
  };

  const handleFetchExclusiveReferralBips = async () => {
    try {
      setBipsLoading(true);
      const currentBips = await _getExclusiveReferralBips(agent);
      setReferralBips(currentBips === null ? 0 : currentBips);
    } catch (error: any) {
    } finally {
      setBipsLoading(false);
    }
  };

  useEffect(() => {
    if (agent) handleFetchExclusiveReferralBips();
  }, [agent]);

  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        <Card className="rounded-xl">
          <CardContent>
            <div className="space-y-2">
              <p className="text-base 3xl:text-xl text-grey-6">Agent Exclusive Referral</p>
              <p className="text-2xl 3xl:text-3xl font-bold">
                {bipsLoading ? <Skeleton className="h-10 w-32" /> : `${referralBips.toFixed(2)} %`}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Label>Agent Address</Label>
          <Input
            type="text"
            placeholder="Enter Agent Address"
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
          />
          <Label>Agent Exclusive Referral %</Label>
          <Input
            type="number"
            placeholder="Enter Agent New Exclusive Referral %"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          onClick={handleAddExclusiveReferralBips}
          loading={addingBips}
          disabled={bipsLoading}
        >
          Update
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExclusiveReferralBips;
