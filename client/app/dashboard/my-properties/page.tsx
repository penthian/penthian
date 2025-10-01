"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import UserDashboard from "@/app/components/UserDashboard";
import { CompactProductCard } from "@/app/components/ui/SkeletonCard";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { useKYCModal } from "@/app/context/KYCModalContext";
import { _createProposal } from "@/app/context/helper-voting";
import { DELAY, NotifyError, NotifySuccess } from "@/app/context/helper";
import ProposalModal from "@/app/components/modals/proposal-modal";
import { Button } from "@/app/components/ui/button";
import { HeadingPara } from "@/app/components/layout/heading";
import { Card, CardContent } from "@/app/components/ui/card";
import { MapPin } from "lucide-react";

const MyProperties: React.FC = () => {
  const { particleProvider, handleRefreshAllProposals } = useBitStakeContext();
  const [createProposalLoading, setCreateProposalLoading] =
    useState<boolean>(false);
  const { address: account } = useAccount();
  const [loading, setLoading] = useState<boolean>(false);
  const [proposalText, setProposalText] = useState<string>("");
  const { kycStatus } = useKYCModal();
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const { userProperties, userPropertiesLoading } = useBitStakeContext();

  const openProposalPopup = (propertyId: number) =>
    setActiveProductId(propertyId);
  const closeProposalPopup = () => setActiveProductId(null);

  const handleCreateProposal = async (propertyId: number) => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed")
        throw new Error("Complete KYC in order to continue");
      if (proposalText == "")
        throw new Error("Please add proposal description");

      setCreateProposalLoading(true);

      await _createProposal({
        propertyId: propertyId,
        description: proposalText,
        connectedAddress: account,
        particleProvider,
      });

      await DELAY(2);
      await handleRefreshAllProposals(account);
      NotifySuccess("Proposal Created Successfully");
      setProposalText("");
      setActiveProductId(null);
      window.location.href = "/dashboard/vote";
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setCreateProposalLoading(false);
    }
  };

  return (
    <UserDashboard>
      <div
        className={`w-full grid 3xl:grid-cols-3 md:grid-cols-2 gap-4 2xl:gap-6`}
      >
        {userPropertiesLoading ? (
          <>
            <CompactProductCard />
            <CompactProductCard />
            <CompactProductCard />
          </>
        ) : userProperties.length == 0 ? (
          <div className="col-span-3 w-full min-h-[50vh] flex items-center justify-center">
            <p className="shadow-md rounded-lg p-5">
              {account
                ? "No Properties Found"
                : "Please connect wallet to view your properties"}
            </p>
          </div>
        ) : (
          userProperties.map((product) => (
            <Card key={product.propertyId} className="py-0">
              <Link
                href={`/dashboard/my-properties/productdetail/${product.propertyId}`}
              >
                <div className="w-full h-56 3xl:h-64 overflow-hidden rounded-t-3xl">
                  <Image
                    src={product.image}
                    alt="Product"
                    width={480}
                    height={280}
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardContent className="space-y-4 p-4 3xl:p-6">
                  <div className="space-y-2">
                    <HeadingPara
                      title={product.name}
                      classNameTitle="text-xl xl:text-2xl 3xl:text-2xl"
                    />
                    <div className="flex items-start gap-1">
                      <MapPin className="h-5 w-5 text-grey-2" />
                      <h3 className="text-base font-medium text-grey-6">
                        {product.attributes[0]?.value},{" "}
                        {product.attributes[1]?.value}
                      </h3>
                    </div>
                  </div>

                  <div className="flex macBook:items-center macBook:flex-row flex-col macBook:justify-between gap-4">
                    <div className="flex items-start flex-col gap-2">
                      <h3 className="text-grey-6 text-base font-medium">
                        Stakes owned
                      </h3>
                      <p className="text-xl font-bold text-black">
                        {product.sharesOwned.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center flex-col sm:flex-row md:flex-col xl:flex-row gap-2 md:gap-4 text-sm md:text-sm 3xl:text-base">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openProposalPopup(product.propertyId);
                      }}
                      disabled={createProposalLoading}
                      className="w-full"
                      variant="outline"
                    >
                      Create Proposal
                    </Button>
                    <Button className="w-full">Sell / Auction</Button>
                  </div>
                </CardContent>
              </Link>
              <ProposalModal
                isOpen={activeProductId === product.propertyId}
                product={product}
                proposalText={proposalText}
                setProposalText={setProposalText}
                onClose={closeProposalPopup}
                onCreateProposal={() =>
                  handleCreateProposal(product.propertyId)
                }
                isLoading={loading}
                createProposalLoading={createProposalLoading}
              />
            </Card>
          ))
        )}
      </div>
    </UserDashboard>
  );
};

export default MyProperties;
