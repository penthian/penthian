
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
import { _getDefaultReferralBips, _changeDefaultReferralBips } from "@/app/context/helper-market";
import { MARKET_BASE } from "@/app/utils/constants";
import { useAccount } from "wagmi";

const DefaultReferralBips: React.FC = () => {
  const { particleProvider } = useBitStakeContext();
  const { address } = useAccount();

  const [referralBips, setReferralBips] = useState(0);
  const [bipsLoading, setBipsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [changingBips, setChangingBips] = useState(false);

  const handleChangeReferralBips = async () => {
    if (!address) return NotifyError("Please connect your wallet.");

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NotifyError("Please enter a valid referral percentage.");
    }

    try {
      setChangingBips(true);

      const _newReferralBips = Math.floor(parseFloat(amount) * 100);

      if (_newReferralBips >= MARKET_BASE) throw new Error("Invalid Referral Percentage");

      await _changeDefaultReferralBips({
        newReferralBips: String(_newReferralBips),
        particleProvider,
      });

      await handleFetchReferralBips();
      NotifySuccess("Referral Bips updated successfully.");
      setAmount("");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setChangingBips(false);
    }
  };

  const handleFetchReferralBips = async () => {
    try {
      setBipsLoading(true);
      const currentBips = await _getDefaultReferralBips();
      setReferralBips(currentBips === null ? 0 : currentBips);
    } catch (error: any) {
    } finally {
      setBipsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchReferralBips();
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        <Card className="rounded-xl">
          <CardContent>
            <div className="space-y-2">
              <p className="text-base 3xl:text-xl text-grey-6">Default Referral</p>
              <p className="text-2xl 3xl:text-3xl font-bold">
                {bipsLoading ? <Skeleton className="h-10 w-32" /> : `${referralBips.toFixed(2)} %`}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Label>Default Referral %</Label>
          <Input
            type="number"
            placeholder="Enter New Default Referral %"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          onClick={handleChangeReferralBips}
          loading={changingBips}
        >
          Update
        </Button>
      </CardContent>
    </Card>
  );
};

export default DefaultReferralBips;
