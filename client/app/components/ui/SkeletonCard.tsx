import React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

function ProductCard() {
  return (
    <div className="rounded-2xl pb-5 w-full h-auto border overflow-hidden cursor-not-allowed">
      <div className="relative">
        <Skeleton className="w-full h-[280px] rounded-2xl" />
        <Skeleton className="absolute top-3 left-3 w-[70px] h-[30px] rounded-[50px]" />

        <div className="absolute bottom-3.5 right-3.5">
          <Skeleton className="mb-[10px] w-[70px] h-[25px] rounded-[10px]" />
        </div>
      </div>

      <Skeleton className="mt-6 w-[220px] ml-5 h-[40px] rounded-r-[15px]" />

      <Skeleton className="mt-3 px-4 sm:px-5 w-[220px] h-[26px] rounded-md ml-5" />

      <div className="px-4 sm:px-5 py-5 flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="w-[200px] h-[18px] rounded-md" />
      </div>

      <div className="px-5 flex items-center justify-between mt-8">
        <div>
          <Skeleton className="w-[100px] h-[20px] rounded-md" />
          <Skeleton className="w-[150px] h-[26px] rounded-md mt-2" />
        </div>
        <Skeleton className="w-[80px] h-[40px] rounded-[10px]" />
      </div>
    </div>
  );
}

function ProductCardPrimary() {
  return (
    <div className="rounded-2xl pb-5 w-full h-auto  overflow-hidden cursor-not-allowed">
      <div className="relative">
        <Skeleton className="w-full h-[280px] rounded-2xl" />
        <Skeleton className="absolute top-3 left-3 w-[70px] h-[30px] rounded-[50px]" />

        <div className="absolute bottom-3.5 right-3.5">
          <Skeleton className="mb-[10px] w-[70px] h-[25px] rounded-[10px]" />
        </div>
      </div>

      <Skeleton className="mt-6 w-[220px] ml-5 h-[40px] rounded-r-[15px]" />

      <Skeleton className="mt-3 px-4 sm:px-5 w-[220px] h-[26px] rounded-md ml-5" />

      <div className="px-4 sm:px-5 py-5 flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="w-[200px] h-[18px] rounded-md" />
      </div>

      <div className="px-4 sm:px-5 py-5 flex-col flex items-start gap-2">
        <Skeleton className="w-20 h-6 rounded-lg" />
        <Skeleton className="w-full h-[18px] rounded-md" />
      </div>

      <div className="px-5 flex items-center justify-between mt-8">
        <div>
          <Skeleton className="w-[100px] h-[20px] rounded-md" />
          <Skeleton className="w-[150px] h-[26px] rounded-md mt-2" />
        </div>
        <Skeleton className="w-[80px] h-[40px] rounded-[10px]" />
      </div>
    </div>
  );
}

function CompactProductCard() {
  return (
    <div className="rounded-2xl pb-5 w-full h-auto border  overflow-hidden cursor-not-allowed">
      <div className="relative">
        {/* Image Skeleton */}
        <Skeleton className="rounded-2xl w-full h-[280px]" />
      </div>

      {/* Title Skeleton */}
      <div className="mt-3 px-3">
        <Skeleton className="h-[26px] w-3/4" />
      </div>

      <div className="px-3">
        {/* Location Skeleton */}
        <div className="flex items-start gap-2 py-5">
          <Skeleton className="w-6 h-6 mt-0.5" />
          <Skeleton className="h-[23px] w-1/2" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-start flex-col">
            {/* Shares Purchased Label Skeleton */}
            <Skeleton className="h-[23px] w-24" />
            {/* Shares Purchased Value Skeleton */}
            <Skeleton className="h-[30px] w-20 mt-2" />
          </div>
          {/* Button Skeleton */}
          <Skeleton className="rounded-[15px] w-[102px] h-[45px]" />
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <>
      <div className="w-full grid grid-cols-1 xl:grid-cols-8 macBook:grid-cols-11 gap-6">
        {/* Left image slider placeholder */}
        <div className="xl:col-span-4 macBook:col-span-5">
          <Skeleton className="w-full h-[400px] rounded-3xl" />
        </div>

        {/* Right card placeholder */}
        <div
          className={cn(
            "xl:col-span-5 xl:col-start-5 macBook:col-span-6 macBook:col-start-6",
            "space-y-4"
          )}
        >
          {/* Sale ends bar */}
          <Skeleton className="w-full h-8 rounded-t-3xl" />

          {/* Card content placeholders */}
          <div className="space-y-3 p-4">
            {/* Title */}
            <Skeleton className="h-8 w-3/4" />

            {/* Location info */}
            <Skeleton className="h-6 w-1/2" />

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Stakes breakdown badges */}
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-8 w-full" />

            {/* Progress bar */}
            <Skeleton className="h-4 w-full" />

            {/* Buy section - payment tabs */}
            <Skeleton className="h-6 w-1/4" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 w-1/2" />
            </div>

            {/* Total price */}
            <Skeleton className="h-8 w-1/2" />

            {/* Quantity selector */}
            <div className="flex gap-2 items-center">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-10" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </div>

        {/* Description and 3D/documents section */}
        <div className="flex flex-col lg:flex-row gap-6 col-span-full">
          {/* Description */}
          <div className="w-full lg:w-1/2 xl:w-[45%] space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>

          {/* Swap / side component */}
          <div className="w-full lg:w-1/2 xl:w-[55%]">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </>
  );
}

function RequestNewPropertySkeleton() {
  return (
    <div className="w-full mx-auto px-4 py-6 sm:p-6">
      {/* Header Skeleton */}
      <div className="mb-12">
        <Skeleton className="h-12 w-1/2 mb-2" /> {/* Heading Skeleton */}
        <Skeleton className="h-6 w-1/3" /> {/* Subheading Skeleton */}
      </div>

      <div className="w-full">
        {/* File Upload Skeleton */}
        <Skeleton className="w-40 h-10 mb-5" />

        {/* Uploaded Files Skeleton */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          {[...Array(1)].map((_, index) => (
            <Skeleton key={index} className="w-full h-40" />
          ))}
        </div>

        {/* Form Fields Skeleton */}
        <div className="flex items-center justify-between w-full gap-7 my-12 flex-wrap md:flex-nowrap">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="w-full h-16" />
          ))}
        </div>

        {/* Description Skeleton */}
        <Skeleton className="w-full h-32 mb-12" />

        {/* Additional Form Fields Skeleton */}
        <div className="flex items-center justify-between w-full gap-7 my-12 flex-wrap md:flex-nowrap">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="w-full h-16" />
          ))}
        </div>

        {/* Submit Button Skeleton */}
        <div className="w-full max-w-[374px] mx-auto mb-12">
          <Skeleton className="h-[40px] w-full rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}

function PropertyRequestsSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-end flex-wrap gap-5 w-full">
        {/* Skeleton for the Add New Property Request button */}
        <Skeleton className="w-[294px] h-14 rounded-full" />
      </div>

      {/* Skeleton table rows for UserRequestedFormsTable */}
      <div className="w-full grid grid-cols-2 3xl:grid-cols-3 gap-6 3xl:gap:8">
        <Skeleton className="w-full h-[480px] 3xl:h-[550px] rounded-3xl" />
        <Skeleton className="w-full h-[480px] 3xl:h-[550px] rounded-3xl" />
        <Skeleton className="w-full h-[480px] 3xl:h-[550px] rounded-3xl" />
      </div>
    </div>
  );
}

function VotingCardSkeleton() {
  return (
    <Card className="w-full flex md:flex-row flex-col py-0 gap-0 h-full">
      {/* Image Skeleton */}
      <div className="w-full h-80 rounded-l-3xl md:w-3/6 overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      <CardContent className="p-6 w-full md:w-3/6 h-full flex flex-col gap-5">
        {/* Header Skeleton: Status Badge & Creator */}
        <div className="w-full flex justify-between items-center">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-32 h-4" />
        </div>

        {/* Title & Location Skeleton */}
        <div className="space-y-2">
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/2 h-6" />
        </div>

        {/* Description Skeleton */}
        <Skeleton className="w-full h-16" />

        {/* Voting Bars Skeleton */}
        <div className="flex items-center gap-4 pt-3">
          <Skeleton className="w-full h-12 rounded-lg" />
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function RentTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-3xl border">
        <thead>
          <tr className="text-left text-base font-medium text-grey-2 uppercase tracking-wider">
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap text-left w-1/5">
              Property Id
            </th>
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap text-center w-1/5">
              End Time
            </th>
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap text-center w-1/5">
              Stakes Owned
            </th>
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap text-center w-1/5">
              Payout
            </th>
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap text-center w-1/5">
              Claim
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={i} className="text-nowrap">
              <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Skeleton className="h-8 w-12" />
              </td>
              <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Skeleton className="h-8 mx-auto w-32" />
              </td>
              <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Skeleton className="h-8 mx-auto w-16" />
              </td>
              <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Skeleton className="h-8 mx-auto w-16" />
              </td>
              <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Skeleton className="h-8 mx-auto w-24 rounded-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PastRentTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-3xl border">
        <thead>
          <tr className="text-left text-base font-medium text-grey-2 uppercase tracking-wider">
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap text-left w-1/5">
              Property Id
            </th>
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap text-center w-1/5">
              Payout
            </th>
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap text-center w-1/5">
              Date / Time
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={i} className="text-nowrap">
              <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Skeleton className="h-8 w-20" />
              </td>
              <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Skeleton className="h-8 mx-auto w-28" />
              </td>
              <td className="px-3 sm:px-6 py-4 border-b text-center">
                <Skeleton className="h-8 mx-auto w-32 rounded-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PastTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="text-left text-xs font-medium text-grey-5 uppercase tracking-wider">
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">
              Property Id
            </th>
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">
              Payout
            </th>
            <th className="px-3 sm:px-6 py-3 border-b whitespace-nowrap">
              Date / Time
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={i} className="text-nowrap">
              <td className="px-3 sm:px-6 py-4 border-b">
                <Skeleton className="h-5 w-12" />
              </td>
              <td className="px-3 sm:px-6 py-4 border-b">
                <Skeleton className="h-5 w-32" />
              </td>
              <td className="px-3 sm:px-6 py-4 border-b">
                <Skeleton className="h-5 w-10" />
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RentingSkeletonCard() {
  return <div className="w-full overflow-hidden px-4 md:px-5 flex items-stretch justify-between xl:flex-row max-w-full flex-col xl:gap-4 gap-10 h-[500px]">
    <div className="flex flex-col xl:w-[45%] w-full gap-4 3xl:gap-8">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="xl:w-[55%] w-full flex flex-col h-full">
      <Skeleton className="h-8 w-2/3 mb-4" />
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="grid grid-cols-2 gap-3 py-5">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full col-span-2" />
      </div>
    </div>
  </div>
}

// Exporting both components
export {
  CompactProductCard,
  ProductCard,
  ProductDetailSkeleton,
  RequestNewPropertySkeleton,
  PropertyRequestsSkeleton,
  ProductCardPrimary,
  VotingCardSkeleton,
  RentTableSkeleton,
  PastTableSkeleton,
  RentingSkeletonCard,
  PastRentTableSkeleton
};
