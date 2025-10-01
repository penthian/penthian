"use client";

import { useBitStakeContext } from "@/app/context/BitstakeContext";
import VotingSetting from "./VotingSetting";
import AdminDashboard from "@/app/components/AdminDashboard";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { VotingCardSkeleton } from "@/app/components/ui/SkeletonCard";
import { ProposalDataType } from "@/app/context/types";
import { VotingCard } from "../../vote/VotingCard";

const AdminSetting = () => {
  const {
    adminProposals,
    adminProposalsLoading,
    handleRefreshAdminProposals,
    isVotingOwner,
  } = useBitStakeContext();


  useEffect(() => {
    (async () => {
      await handleRefreshAdminProposals(isVotingOwner);
    })();
  }, [isVotingOwner]);

  const activeProposals = adminProposals ? adminProposals.activeProposals : [];
  const pastProposals = adminProposals ? adminProposals.pastProposals : [];

  return (
    <AdminDashboard>
      {isVotingOwner ? (
        <div className="space-y-6">
          <VotingSetting />
          <Card>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="active">
                    Active Proposals ({activeProposals.length})
                  </TabsTrigger>
                  <TabsTrigger value="passed">
                    Past Proposals ({pastProposals.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-6">
                  {adminProposalsLoading ? (
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
                        isAdminView={true}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="passed" className="space-y-6">
                  {adminProposalsLoading ? (
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
                        isAdminView={true}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[45dvh] text-bold text-xl">
          Only Voting Owner is allowed
        </div>
      )}
    </AdminDashboard>
  );
};

export default AdminSetting;
