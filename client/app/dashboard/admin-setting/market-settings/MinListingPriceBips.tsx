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
    _changeFloorPricePercentage,
    _getMinBidIncrementBipsPercentage,
    _getMinListingPriceBipsPercentage,
} from "@/app/context/helper-market";
import {
    _changeProposalFee,
    _getProposalFees,
} from "@/app/context/helper-voting";
import { MARKET_BASE } from "@/app/utils/constants";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const FloorPrice: React.FC = () => {
    const { particleProvider } = useBitStakeContext();
    const { address } = useAccount();

    const [percentage, setPercentage] = useState(0);
    const [feeLoading, setFeeLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [changingFee, setChangingFee] = useState(false);

    const handleChangeFloorPrice = async () => {
        if (!address) return NotifyError("Please connect your wallet.");

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return NotifyError("Please enter a valid rent amount.");
        }

        try {
            setChangingFee(true);
            if (Number(amount) == percentage) throw new Error("Can not be old value");

            const _newPercentage = Math.floor(parseFloat(amount) * 100);

            if (_newPercentage >= MARKET_BASE) throw new Error("Invalid Percentage");

            await _changeFloorPricePercentage({
                newPercentage: String(_newPercentage),
                particleProvider,
            });

            await handleFetchFloorPrice();
            NotifySuccess("Floor price fee percentage updated successfully.");
            setAmount("");
        } catch (error: any) {
            HandleTxError(error);
        } finally {
            setChangingFee(false);
        }
    };

    const handleFetchFloorPrice = async () => {
        try {
            setFeeLoading(true);
            const proposalFee = await _getMinListingPriceBipsPercentage();
            // console.log("🚀 ~ proposalFee:", proposalFee);
            setPercentage(proposalFee === null ? 0 : proposalFee);
        } catch (error: any) {
        } finally {
            setFeeLoading(false);
        }
    };

    useEffect(() => {
        handleFetchFloorPrice();
    }, []);

    return (
        <>
            <Card className="w-full">
                <CardContent className="space-y-6">
                    <Card className="rounded-xl">
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-base 3xl:text-xl text-grey-6">Floor Price</p>
                                <p className="text-2xl 3xl:text-3xl font-bold">{feeLoading ? <Skeleton className="h-10 w-32" /> : `${percentage.toFixed(2)} %`}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <Label>
                            New Floor Price %
                        </Label>
                        <Input
                            type="number"
                            placeholder="Enter New Floor Price %"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleChangeFloorPrice}
                        loading={changingFee}
                    >
                        Update
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};

export default FloorPrice;
