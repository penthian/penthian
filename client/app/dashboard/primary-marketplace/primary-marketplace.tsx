"use client";

import { ProductCard as ProductCardPrimary } from "../../components/ui/SkeletonCard";
import {
  _getPropertyDetails,
  _getTotalProperties,
} from "@/app/context/helper-rwa";
import UserDashboard from "@/app/components/UserDashboard";
import {
  _getPrimarySale,
} from "@/app/context/helper-market";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import ProductCard from "@/app/components/dashboard/ProductCard";

const PrimaryMarketplace: React.FC = () => {
  const { totalPrimaryListings, totalPrimaryListingsLoading } =
    useBitStakeContext();

  return (
    <UserDashboard>
      <div
        className={`relative w-full grid 3xl:grid-cols-3 md:grid-cols-2 gap-4 2xl:gap-6`}
      >
        {totalPrimaryListingsLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <ProductCardPrimary key={index} />
          ))
        ) : (
          <>
            {totalPrimaryListings.map((id, ind) => (
              <ProductCard key={ind} propertyId={id} />
            ))}
            {totalPrimaryListings.length === 0 && (
              <div className="col-span-3 w-full min-h-[50vh] flex items-center justify-center">
                <p className="shadow-md rounded-lg p-5">
                  No Primary Sale Available
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </UserDashboard>
  );
};

export default PrimaryMarketplace;
