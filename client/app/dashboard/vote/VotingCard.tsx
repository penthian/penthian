"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { Card, CardContent } from "@/app/components/ui/card";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProposalDataType, UserVotesStatusType } from "@/app/context/types";
import Image from "next/image";
import {
  _castVote,
  _deleteActiveProposal,
  _getProposalData,
} from "@/app/context/helper-voting";
import { _getUserProperty } from "@/app/context/helper-market";
import {
  HandleTxError,
  NotifyError,
  NotifySuccess,
  shortenWalletAddress,
} from "@/app/context/helper";
import { useAccount } from "wagmi";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { Progress } from "@/app/components/ui/progress";
import { VotingCardSkeleton } from "@/app/components/ui/SkeletonCard";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { usePathname } from "next/navigation";

export interface VotingCardProps {
  proposal: ProposalDataType;
  isActive: boolean;
  isAdminView?: boolean;
}

type VotingBarType = {
  proposalId: number;
  propertyId: number;
  percent: number;
  percentInFavour: number;
  percentInAgainst: number;
  castVoteLoadingState: [boolean, Dispatch<SetStateAction<boolean>>];
  voterStatus: UserVotesStatusType | null;
  isEnded: boolean;
  showButton: boolean;
  handleRefreshProposals: (account: string) => Promise<void>;
};

export function VotingCard({
  proposal,
  isActive,
  isAdminView,
}: VotingCardProps) {
  const className = "";

  const { particleProvider, isVotingOwner, handleRefreshAdminProposals } =
    useBitStakeContext();
  const [proposalDetails, setProposalDetails] =
    useState<ProposalDataType | null>(proposal);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [proposalDataLoading, setProposalDataLoading] = useState(false);
  const [deletingProposal, setDeletingProposal] = useState(false);
  const castVoteLoadingState = useState(false);

  const handleDeleteActiveProposal = async () => {
    try {
      if (!isVotingOwner) {
        NotifyError("You are not authorized to delete this proposal.");
        return;
      }
      setDeletingProposal(true);

      await _deleteActiveProposal({
        proposalId: proposal.proposalId,
        particleProvider,
      });

      await handleRefreshAdminProposals(isVotingOwner);
      NotifySuccess("Proposal deleted successfully.");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setDeletingProposal(false);
    }
  };

  const fetchProposal = async (account: string) => {
    setProposalDataLoading(true);

    const eventPayload = {
      _by: proposal.proposalData?.proposer || "",
      _proposalId: proposal.proposalId,
      _endTime: proposal.proposalData?.endTime || 0,
      blockTimestamp: 0,
      _startTime: proposal.proposalData?.startTime || 0,
      isEnded: !isActive,
    };

    const result = await _getProposalData(eventPayload, account);
    setProposalDetails(result);
    setProposalDataLoading(false);
  };

  if (proposalDataLoading) {
    return <VotingCardSkeleton />;
  }

  if (proposalDetails === null || proposalDetails.proposalData === null) {
    return null;
  }

  const inFavourVotes = proposalDetails.proposalData?.votesInFavour || 0;
  const inAgainstVotes = proposalDetails.proposalData?.votesInAgainst || 0;
  const totalVotes = proposalDetails.propertyData?.totalShares || 0;
  const percentInFavour = totalVotes ? (inFavourVotes / totalVotes) * 100 : 0;
  const percentInAgainst = totalVotes ? (inAgainstVotes / totalVotes) * 100 : 0;

  const statusColorMap: Record<string, string> = {
    not_found: "text-grey-6 border-gray-400",
    on_going: "text-blue-600 border-blue-600",
    passed: "text-green-600 border-green-400",
    failed: "text-red-600 border-red-400",
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Card
      className={cn(
        "w-full flex md:flex-row flex-col py-0 gap-0 h-full",
        className
      )}
    >
      <Image
        src={proposalDetails.metadata?.image || "/placeholder.svg"}
        alt={proposalDetails.metadata?.name || "Property Image"}
        width={500}
        height={500}
        className="w-full h-80 rounded-l-3xl object-cover md:w-3/6"
      />
      <CardContent
        className={`p-6 w-full md:w-3/6 h-full flex flex-col ${isActive ? "gap-5" : "gap-10"
          }`}
      >
        <div className="flex-1 space-y-2">
          <div className="w-full flex-col-reverse xl:flex-row flex xl:items-center xl:justify-between gap-2">
            <div className="flex items-center gap-2 3xl:gap-4 text-sm font-medium">
              <span
                className={`px-3 py-1 text-nowrap rounded-full border ${statusColorMap[
                  proposalDetails.proposalData?.status ?? "not_found"
                ]
                  }`}
              >
                {formatStatus(
                  proposalDetails.proposalData?.status ?? "not_found"
                )}
              </span>

              <span className="text-grey-6">
                Created By:&nbsp;
                {proposalDetails.proposalData?.proposer
                  ? shortenWalletAddress(proposalDetails.proposalData.proposer)
                  : ""}
              </span>
            </div>
            {isAdminView && isActive && (
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={handleDeleteActiveProposal}
                  loading={deletingProposal}
                  className="px-4 3xl:px-6"
                >
                  Delete Proposal
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl 3xl:text-2xl font-semibold">
              {proposalDetails.metadata?.name}
            </h3>
            {proposalDetails.metadata?.attributes && (
              <div className="flex items-center gap-1 text-grey-6 text-base 3xl:text-lg macBook:text-xl">
                <MapPin />
                <span>
                  {proposalDetails.metadata?.attributes[0].value},{" "}
                  {proposalDetails.metadata?.attributes[1].value}
                </span>
              </div>
            )}
          </div>

          <div className="text-primary-grey text-base macBook:text-lg leading-relaxed flex items-center justify-between gap-2">
            <p className="truncate">
              {showFullDescription
                ? proposalDetails.proposalData?.description
                : `${proposalDetails.proposalData?.description.slice(
                  0,
                  90
                )}...`}
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="whitespace-nowrap">
                  See Proposal
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl w-full space-y-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span
                      className={`px-3 py-1 rounded-full border ${statusColorMap[
                        proposalDetails.proposalData?.status ?? "not_found"
                      ]
                        }`}
                    >
                      {formatStatus(
                        proposalDetails.proposalData?.status ?? "not_found"
                      )}
                    </span>

                    <span className="text-grey-6">
                      Created By:&nbsp;
                      {proposalDetails.proposalData?.proposer
                        ? shortenWalletAddress(
                          proposalDetails.proposalData.proposer
                        )
                        : ""}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl 3xl:text-2xl font-semibold">
                      {proposalDetails.metadata?.name}
                    </h3>
                    {proposalDetails.metadata?.attributes && (
                      <div className="flex items-center gap-1 text-grey-6 text-base 3xl:text-lg macBook:text-xl">
                        <MapPin />
                        <span>
                          {proposalDetails.metadata?.attributes[0].value},{" "}
                          {proposalDetails.metadata?.attributes[1].value}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-wrap">
                    {proposalDetails.proposalData?.description}
                  </p>

                  <br />

                  <VoteBar
                    proposalId={proposal.proposalId}
                    propertyId={proposalDetails.proposalData.propertyId}
                    percent={percentInFavour + percentInAgainst}
                    percentInFavour={percentInFavour}
                    percentInAgainst={percentInAgainst}
                    castVoteLoadingState={castVoteLoadingState}
                    voterStatus={proposalDetails.userVotesStatus}
                    isEnded={!isActive}
                    handleRefreshProposals={fetchProposal}
                    showButton={!isAdminView}
                  />
                </div>
                {isActive && (
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Voting Interface */}
        <VoteBar
          proposalId={proposal.proposalId}
          propertyId={proposalDetails.proposalData.propertyId}
          percent={percentInFavour + percentInAgainst}
          percentInFavour={percentInFavour}
          percentInAgainst={percentInAgainst}
          castVoteLoadingState={castVoteLoadingState}
          voterStatus={proposalDetails.userVotesStatus}
          isEnded={!isActive}
          showButton={!isAdminView}
          handleRefreshProposals={fetchProposal}
        />
      </CardContent>
    </Card>
  );
}

function VoteBar({
  proposalId,
  propertyId,
  percent,
  percentInFavour,
  percentInAgainst,
  castVoteLoadingState: [isCastingVote, setIsCastingVote],
  voterStatus,
  isEnded,
  showButton,
  handleRefreshProposals,
}: VotingBarType) {
  const { address: account } = useAccount();
  const { particleProvider } = useBitStakeContext();
  const [loadingVote, setLoadingVote] = useState<"YES" | "NO" | null>(null);

  const hasVoted = voterStatus?.votedAs !== "not_voted";

  const handleVote = async (vote: "YES" | "NO") => {
    if (!voterStatus) return;
    if (!account) return NotifyError("Connect wallet to vote");
    if (isEnded) return NotifyError("Voting has ended");
    if (!voterStatus.canVote)
      return NotifyError("You are not eligible to vote");

    setIsCastingVote(true);
    setLoadingVote(vote);

    try {
      await _castVote({
        proposalId,
        inFavor: vote === "YES",
        propertyId,
        particleProvider,
      });
      NotifySuccess("Vote cast successfully");
      await handleRefreshProposals(account);
    } catch (err: any) {
      NotifyError(err.reason || err.message || "Something went wrong");
    } finally {
      setIsCastingVote(false);
      setLoadingVote(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">

        <div className="flex items-center gap-4">
          <Progress value={percentInFavour} className="bg-Green flex-1" />
          <span className="text-nowrap w-32 text-right">FOR {percentInFavour}%</span>
        </div>

        <div className="flex items-center gap-4">
          <Progress value={percentInAgainst} className="bg-Red flex-1" />
          <span className="text-nowrap w-32 text-right">AGAINST {percentInAgainst}%</span>
        </div>

      </div>

      {!isEnded && showButton && (
        <div className="flex items-center justify-center w-full gap-4">
          <Button
            variant="success"
            className="w-full"
            disabled={hasVoted || isEnded || isCastingVote}
            loading={loadingVote === "YES"}
            onClick={() => handleVote("YES")}
          >
            Yes
          </Button>

          <Button
            variant="destructive"
            className="w-full"
            disabled={hasVoted || isEnded || isCastingVote}
            loading={loadingVote === "NO"}
            onClick={() => handleVote("NO")}
          >
            No
          </Button>
        </div>
      )}
    </div>
  );
}
