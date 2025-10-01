"use client";

import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { _getAllSecondaryEvents } from "@/app/context/subgraph-helpers/market-subgraph";
import UserDashboard from "@/app/components/UserDashboard";
import { VotingCardSkeleton } from "@/app/components/ui/SkeletonCard";
import { _getPropertyDetails } from "@/app/context/helper-rwa";
import { VotingCard } from "./VotingCard";
import { ProposalDataType } from "@/app/context/types";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Card, CardContent } from "@/app/components/ui/card";

const Page: React.FC = () => {
  const { proposals, proposalsLoading, handleRefreshAllProposals } =
    useBitStakeContext();

  const { address: account } = useAccount();

  useEffect(() => {
    (async () => {
      await handleRefreshAllProposals(account);
    })();
  }, [account]);

  const activeProposals = proposals ? proposals.activeProposals : [];
  const pastProposals = proposals ? proposals.pastProposals : [];

  return (
    <UserDashboard>
      <Card>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="active">Active Proposals ({activeProposals.length})</TabsTrigger>
              <TabsTrigger value="passed">Past Proposals ({pastProposals.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {proposalsLoading ? (
                <VotingCardSkeleton />
              ) : activeProposals.length == 0 ? (
                <div className="text-center text-xl h-32 w-full items-center justify-center py-4">
                  No Active Proposal Found
                </div>
              ) : (
                activeProposals.map((proposal: ProposalDataType) => (
                  <VotingCard
                    key={proposal.proposalId}
                    proposal={proposal}
                    isActive={true}
                    isAdminView={false}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="passed" className="space-y-6">
              {proposalsLoading ? (
                <VotingCardSkeleton />
              ) : pastProposals.length == 0 ? (
                <div className="text-center text-xl h-32 w-full items-center justify-center py-4">
                  No Past Proposal Found
                </div>
              ) : (
                pastProposals.map((proposal: ProposalDataType) => (
                  <VotingCard
                    key={proposal.proposalId}
                    proposal={proposal}
                    isActive={false}
                    isAdminView={false}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </UserDashboard>
  );
};

export default Page;
