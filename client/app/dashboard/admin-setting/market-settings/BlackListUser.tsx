
import Loader from "@/app/components/Loader";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import {
  HandleTxError,
  NotifyError,
  NotifySuccess,
} from "@/app/context/helper";
import {
  _updateAgentWhitelistStatus,
  _updateBlacklist,
} from "@/app/context/helper-market";
import {
  _changeProposalFee,
  _getProposalFees,
} from "@/app/context/helper-voting";
import { ethers } from "ethers";
import React, { useState } from "react";

const BlackListUser: React.FC = () => {
  const { particleProvider } = useBitStakeContext();
  const [changeAccessLoading, setChangeAccessLoading] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [makeBlacklist, setMakeBlacklist] = useState<"not_selected" | "yes" | "no">("not_selected");

  const handleChangeAccess = async () => {

    if (!userAddress) {
      return NotifyError("address field cannot be empty.");
    }
    if (!ethers.utils.isAddress(userAddress)) {
      return NotifyError("Please enter a valid user address.");
    }
    if (makeBlacklist === "not_selected") {
      return NotifyError("Please select an option to make blacklist or not.");
    }

    try {
      setChangeAccessLoading(true);

      await _updateBlacklist({
        _user: userAddress,
        _makeBlacklist: makeBlacklist === "yes",
        particleProvider,
      });
      setUserAddress("");
      setMakeBlacklist("not_selected");
      NotifySuccess("Access updated successfully.");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setChangeAccessLoading(false);
    }
  };

  return (
    <Card>

      <CardContent className="space-y-6">
        <Card className="rounded-xl">
          <CardContent>
            <div className="space-y-2">
              <p className="text-base 3xl:text-xl text-grey-6">Blacklist User</p>
            </div>
          </CardContent>
        </Card>

        <Input
          type="text"
          placeholder="Enter user address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />

        <select
          className="border rounded px-4 py-2 w-full"
          value={makeBlacklist}
          onChange={(e) => setMakeBlacklist(e.target.value as "not_selected" | "yes" | "no")}
        >
          <option value="not_selected">Select Option</option>
          <option value="yes">Make Blacklist</option>
          <option value="no">Remove Blacklist</option>
        </select>

        <Button
          className="w-full"
          onClick={handleChangeAccess}
          loading={changeAccessLoading}
        >
          Update Access
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlackListUser;
