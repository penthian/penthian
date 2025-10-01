import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import {
  getCustomWeiFrom,
  HandleTxError,
  NotifyError,
  NotifySuccess,
} from "@/app/context/helper";
import {
  _changeRegistrationFees,
  _getRegistrationFees,
} from "@/app/context/helper-form";
import { BITSTAKE_CONFIG } from "@/app/utils/constants";
import { Label } from "@radix-ui/react-label";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const ListingFee: React.FC = () => {
  const { particleProvider } = useBitStakeContext();
  const { address } = useAccount();

  const [registrationFees, setRegistrationFees] = useState(0);
  const [feeLoading, setFeeLoading] = useState(true);

  const [newFee, setNewFee] = useState("");
  const [changingFee, setChangingFee] = useState(false);

  const handleChangeListingFee = async () => {
    if (!address) return NotifyError("Please connect your wallet.");

    if (!newFee || isNaN(Number(newFee)) || Number(newFee) <= 0) {
      return NotifyError("Please enter a valid rent newFee.");
    }

    try {
      setChangingFee(true);

      if (+newFee == registrationFees) throw new Error("Cannot be same fee");

      await _changeRegistrationFees({
        newPropertyListingFeeWei: getCustomWeiFrom(String(newFee),BITSTAKE_CONFIG.usdcDecimals),
        particleProvider,
      });

      await handleFetchListingFee();
      NotifySuccess("Registration fee updated successfully.");
      setNewFee("");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setChangingFee(false);
    }
  };

  const handleFetchListingFee = async () => {
    try {
      setFeeLoading(true);
      const _registrationFees = await _getRegistrationFees();
      // console.log("🚀 ~ _registrationFees:", _registrationFees);
      setRegistrationFees(_registrationFees === null ? 0 : _registrationFees);
    } catch (error: any) {
    } finally {
      setFeeLoading(false);
    }
  };

  useEffect(() => {
    handleFetchListingFee();
  }, []);

  return (
    <>
      <Card className="w-full">
        <CardContent className="space-y-6">
          <Card className="rounded-xl">
            <CardContent>
              <div className="space-y-2">
                <p className="text-base 3xl:text-xl text-grey-6">
                  Listing Fee
                </p>
                <p className="text-2xl 3xl:text-3xl font-bold">
                  {feeLoading ? (
                    <Skeleton className="h-10 w-32" />
                  ) : (
                    `${registrationFees.toFixed(2)} %`
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Label>New Listing Fee USDC</Label>
            <Input
              type="number"
              placeholder="Enter New Listing Fee USDC"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleChangeListingFee}
            loading={changingFee}
            disabled={feeLoading}
          >
            Update
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default ListingFee;
