// ConcludePrimarySale.tsx
"use client";

import { useBitStakeContext } from "@/app/context/BitstakeContext";
import {
  fetchNftMetadata,
  HandleTxError,
  NotifyError,
  NotifySuccess,
} from "@/app/context/helper";
import { _addRent } from "@/app/context/helper-rent";
import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { _delistProperty, _getPropertyDetails } from "@/app/context/helper-rwa";
import { NftMetadata } from "@/app/context/types";
import { DEFAULT_IMAGES, maxDescriptionLength } from "@/app/utils/constants";
import Image from "next/image";
import { getDisplayText } from "@/lib/utils";
import Link from "next/link";
import {
  Coins,
  HandCoins,
  LinkIcon,
  ListFilter,
  MapPin,
  User,
} from "lucide-react";
import { RentingSkeletonCard } from "@/app/components/ui/SkeletonCard";
import { Button } from "@/app/components/ui/button";
import ImageSlider from "@/app/components/dashboard/image-slider";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import { HeadingPara } from "@/app/components/layout/heading";
import InfoCard from "@/app/components/dashboard/infoCard";
import ProgressOfShares from "@/app/components/dashboard/progress-of-shares";
import IconTitle from "@/app/components/dashboard/icon-title";
import { Badge } from "@/app/components/ui/badge";

const DelistProperty: React.FC = () => {
  const { particleProvider } = useBitStakeContext();
  const { address } = useAccount();

  const [propertyId, setPropertyId] = useState("");

  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<any>(null);
  const [metadata, setMetadata] = useState<NftMetadata>();
  const [showFull, setShowFull] = useState(false);
  const [isSearchDone, setIsSearchDone] = useState(false); // Flag to indicate search completion
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [deListingProperty, setDeListingProperty] = useState(false);

  const totalPrice = product?.pricePerShare * product?.totalShares;

  const handleGetPropertyDetails = async (propertyId: number) => {
    setProductLoading(true); // Start loading
    setProduct(null); // Set the product details
    setMetadata(undefined); // Set the metadata
    try {
      const details = await _getPropertyDetails({ propertyId });
      if (details === null) {
        setProduct(null); // Set the product details
        setMetadata(undefined); // Set the metadata
        setIsSearchDone(true);
        return;
      }
      const metadata: NftMetadata | null = await fetchNftMetadata(details.uri);

      const validMetadata: NftMetadata = {
        description: metadata?.description || "----",
        image: metadata?.image || DEFAULT_IMAGES[0],
        images: metadata?.images || DEFAULT_IMAGES,
        name: metadata?.name || "----",
        attributes: metadata?.attributes || [],
        transactionBreakdown: metadata?.transactionBreakdown || [],
        rentalBreakdown: metadata?.rentalBreakdown || [],
      };

      setProduct(details); // Set the product details
      setMetadata(validMetadata); // Set the metadata
      setIsSearchDone(true); // Indicate that the search is done
    } catch (error) {
      console.log("Error fetching property details:", error);
    } finally {
      setProductLoading(false); // Stop loading after data is fetched or error occurs
    }
  };

  const handlePropertyIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductLoading(true); // Start loading when input changes

    const value = e.target.value;
    setPropertyId(value);
    setIsSearchDone(false); // Reset the search result when user is typing

    // Clear the previous timeout if it exists
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout to debounce the input
    debounceTimeout.current = setTimeout(() => {
      if (value && !isNaN(Number(value))) {
        handleGetPropertyDetails(Number(value)); // Call the handler after debounce
      }
    }, 1000); // 1000 ms debounce time (1 second)
  };

  const handleDelistProperty = async () => {
    if (!address) return NotifyError("Please connect your wallet.");
    if (!propertyId || isNaN(Number(propertyId)) || Number(propertyId) <= 0) {
      return NotifyError("Please enter a valid Property ID.");
    }

    try {
      setDeListingProperty(true);
      await _delistProperty({
        propertyId: Number(propertyId),
        particleProvider,
      });
      NotifySuccess("Property removed successfully.");
      setPropertyId("");
    } catch (error: any) {
      HandleTxError(error);
    } finally {
      setDeListingProperty(false);
    }
  };

  useEffect(() => {
    if (!propertyId || propertyId === "") {
      // if the input is cleared, cancel any loading state
      setProductLoading(false);
    }
  }, [propertyId]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      <Card className="max-w-full md:max-w-xs w-full h-fit">
        <CardContent className="space-y-6">
          <Card className="rounded-xl">
            <CardContent className="font-medium">
              Enter Property ID to delist
            </CardContent>
          </Card>
          <Input
            type="number"
            placeholder="Enter Property ID"
            className="border rounded px-4 py-2"
            value={propertyId}
            onChange={handlePropertyIdChange}
          />

          <Button
            className="w-full"
            variant={"destructive"}
            onClick={handleDelistProperty}
            loading={deListingProperty}
          >
            Remove Property
          </Button>
        </CardContent>
      </Card>

      {/* Display Skeleton or Property Preview when loading or no product found */}
      {productLoading ? (
        <RentingSkeletonCard />
      ) : !propertyId ? (
        <div className="w-full flex justify-center items-center flex-col gap-40">
          <br />
          <h3>Property Preview</h3>
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      ) : !product && isSearchDone ? (
        <div className="w-full flex justify-center items-center flex-col gap-40">
          <br />
          <h3>No Property Found</h3>
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      ) : (
        <div className="w-full overflow-hidden md:px-4 flex items-stretch justify-between xl:flex-row max-w-full flex-col xl:gap-4 gap-10 pb-6">
          <div className="flex flex-col xl:w-[45%] w-full gap-4 3xl:gap-8">
            <ImageSlider images={metadata?.images ?? []} />
          </div>

          <Card className="xl:w-[55%] w-full flex flex-col h-full">
            <CardContent className="flex flex-col h-full gap-2">
              <HeadingPara
                title={metadata?.name}
                className="text-xl md:!text-2xl"
                tag="h1"
              />

              <div className="flex items-center gap-2">
                <div className="flex items-start gap-1">
                  <MapPin className="h-5 w-5 text-grey-2" />
                  <h3 className="text-base font-medium text-grey-6">
                    {metadata?.attributes[0]?.value},{" "}
                    {metadata?.attributes[1]?.value}
                  </h3>
                </div>
              </div>

              <div
                className="border-t border-b border
                      grid grid-cols-1 md:grid-cols-2 
                      md:divide-x divide-y md:divide-border"
              >
                <InfoCard
                  title="Property Price"
                  value={`$${product?.totalShares * product?.pricePerShare}`}
                  Icon={HandCoins}
                />

                <InfoCard
                  title="Owners"
                  value={product?.totalOwners}
                  Icon={User}
                />

                <InfoCard
                  title="Price Per Share"
                  value={`$${product.pricePerShare.toLocaleString()}`}
                  Icon={HandCoins}
                />

                <InfoCard
                  title="No. of Stakes Listed"
                  value={product.totalShares}
                  Icon={User}
                />
              </div>
              <div className="space-y-2">
                <HeadingPara
                  title="Description"
                  classNameTitle="text-base xl:text-lg macBook:text-xl"
                />

                {metadata && (
                  <p className="text-sm text-grey-1 font-medium">
                    {getDisplayText({
                      text: metadata.description,
                      showFull: showFull,
                    })}
                    {metadata.description.length > maxDescriptionLength && (
                      <Button
                        onClick={() => setShowFull(!showFull)}
                        variant="outline"
                        size="sm"
                        className="ml-2 mt-1"
                      >
                        {showFull ? "See less" : "See more"}
                      </Button>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DelistProperty;
