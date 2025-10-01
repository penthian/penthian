import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import {
  HandleTxError,
  NotifyError,
  NotifySuccess,
} from "@/app/context/helper";
import {
  _changeIsPaused,
  _getIsRequestPaused,
} from "@/app/context/helper-form";
import {
  _changeProposalFee,
  _getProposalFees,
} from "@/app/context/helper-voting";
import React, { useEffect, useState } from "react";

const PauseUnpauseRequests: React.FC = () => {
  const { particleProvider } = useBitStakeContext();

  const [isRequestPaused, setIsRequestPaused] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [switchingStatus, setSwitchingStatus] = useState(false);

  const handleChangeStatus = async () => {
    try {
      setSwitchingStatus(true);
      if (!particleProvider) {
        return NotifyError("Please connect wallet");
      }
      await _changeIsPaused({
        pause: !isRequestPaused,
        particleProvider,
      });

      await handleFetchIsRequestPaused();
      NotifySuccess("Request forms status updated successfully.");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setSwitchingStatus(false);
    }
  };

  const handleFetchIsRequestPaused = async () => {
    try {
      setDataLoading(true);
      const _isRequestPaused = await _getIsRequestPaused();
      setIsRequestPaused(_isRequestPaused);
    } catch (error: any) {
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    handleFetchIsRequestPaused();
  }, []);

  return (
    <div className="max-w-xl w-full">
      {dataLoading ? (
        <Skeleton className="h-10 w-[400px]" />
      ) : (
        <div className="flex items-center gap-4">
          <p>
            Requesting New Property :
            <b>{isRequestPaused ? " Paused" : " Active"}</b>
          </p>
          <Button
            onClick={handleChangeStatus}
            loading={switchingStatus}
            disabled={switchingStatus || dataLoading}
          >
            {isRequestPaused ? "Resume Requests" : "Pause Requests"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PauseUnpauseRequests;
