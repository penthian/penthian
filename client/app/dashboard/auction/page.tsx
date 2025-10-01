"use client";

import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { _getAllSecondaryEvents } from "@/app/context/subgraph-helpers/market-subgraph";
import UserDashboard from "@/app/components/UserDashboard";
import { ProductCard } from "@/app/components/ui/SkeletonCard";
import AuctionCard from "./AuctionCard";
import { _getPropertyDetails } from "@/app/context/helper-rwa";

const Page: React.FC = () => {
  const { allAuctionEvents, allAuctionEventsLoading } = useBitStakeContext();

  return (
    <UserDashboard>
      <div className="w-full relative">

        {/* Products */}
        <div className="flex w-full">
          <div
            className={`w-full grid 3xl:grid-cols-3 md:grid-cols-2 gap-6 2xl:gap-8`}
          >
            {allAuctionEventsLoading ? (
              <>
                <ProductCard />
                <ProductCard />
                <ProductCard />
              </>
            ) : allAuctionEvents.length == 0 ? (
              <div className="col-span-3 w-full min-h-[50vh] flex items-center justify-center">
                <p className="shadow-md rounded-lg p-5">
                  {" "}
                  No Auction Listing Found
                </p>
              </div>
            ) : (
              allAuctionEvents.map((product) => (
                <AuctionCard
                  key={product.id}
                  propertyId={Number(product._propertyId)}
                  auctionId={Number(product._auctionId)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </UserDashboard>
  );
};

export default Page;
