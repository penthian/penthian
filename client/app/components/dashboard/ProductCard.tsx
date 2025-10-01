"use client";

import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { ProductCardPrimary } from "../ui/SkeletonCard";
import { Skeleton } from "../ui/Skeleton";
import Image from "next/image";
import { getCurrentTimeInSeconds } from "@/app/context/helper";
import { useEffect, useState } from "react";
import { ListedProperty } from "@/app/context/types";
import { DEFAULT_IMAGES } from "@/app/utils/constants";
import { _getPropertyDetails } from "@/app/context/helper-rwa";
import { _getPrimarySale } from "@/app/context/helper-market";
import axios from "axios";
import { CountdownTimer } from "../CountdownTimer";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MapPin } from "lucide-react";
import { Badge } from "../ui/badge";
import ProgressOfShares from "./progress-of-shares";

interface ProductCardProps {
  propertyId: number;
}

export interface Metadata {
  description: string;
  image: string;
  images: string[];
  view3d: string | null;
  name: string;
  attributes: { value: string }[];
}

const ProductCard = ({ propertyId }: ProductCardProps) => {
  const [productDataLoading, setProductDataLoading] = useState<boolean>(true);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [soldPercentage, setSoldPercentage] = useState<string>("0%");
  const [productData, setProductData] = useState<ListedProperty | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    description: "----",
    name: "----",
    image: DEFAULT_IMAGES[0],
    images: DEFAULT_IMAGES,
    attributes: [],
    view3d: null
  });

  const hasSharesRemaining = productData ? productData?.sharesRemaining > 0 : false;
  const saleTimeEnded = productData
    ? hasSharesRemaining && getCurrentTimeInSeconds() > productData.endTime
    : false;
    
  useEffect(() => {
    const fetchProductData = async () => {
      setProductDataLoading(true);
      try {
        const details = await _getPropertyDetails({ propertyId });

        if (!details) {
          setProductData(null);
          return;
        }
        const listing = await _getPrimarySale({ propertyId });

        const property: ListedProperty = {
          propertyId: propertyId,
          owner: details.owner,
          pricePerShare: details.pricePerShare,
          sharesRemaining: listing.sharesRemaining,
          endTime: listing.endTime,
          totalOwners: details.totalOwners,
          totalShares: details.totalShares,
          totalPrice: details.totalShares * details.pricePerShare,
          uri: details.uri,
        };
        setProductData(property);
        const _soldPercentage =
          ((property.totalShares - property.sharesRemaining) /
            property.totalShares) *
          100;

        setSoldPercentage(`${_soldPercentage}%`);
      } catch (error) {
        console.log("Error fetching product data", error);
        setProductData(null);
      } finally {
        setProductDataLoading(false);
      }
    };

    fetchProductData();
  }, [propertyId]);

  useEffect(() => {
    if (productData) {
      const fetchMetadata = async () => {
        setMetadataLoading(true);
        try {
          const response = await axios.get(productData.uri);
          const metadataResponse = response.data;

          const newMetadata: Metadata = {
            description: metadataResponse?.description || "----",
            image: metadataResponse?.image || DEFAULT_IMAGES[0],
            images: metadataResponse?.images || DEFAULT_IMAGES,
            name: metadataResponse?.name || "----",
            attributes: metadataResponse?.attributes || [],
            view3d: metadataResponse?.view3d || null, 
          };

          setMetadata(newMetadata);
        } catch (error) {
          console.log("Error fetching metadata", error);
        } finally {
          setMetadataLoading(false);
        }
      };
      fetchMetadata();
    }
  }, [productData]);

  if (productDataLoading || !productData) {
    return <ProductCardPrimary />;
  }

  return (
    <Link href={`/dashboard/primary-marketplace/productdetail/${propertyId}`}>
      <Card className="w-full h-auto overflow-hidden cursor-pointer py-0">
        <div className="relative">
          <div className="w-full h-44 xl:h-48 3xl:h-72 overflow-hidden rounded-t-3xl">
            {metadataLoading ? (
              <Skeleton className="w-full h-44 xl:h-56 3xl:h-48" />
            ) : (
              <>
                <Image
                  src={metadata.image}
                  alt={metadata.name || "Product image"}
                  width={480}
                  height={280}
                  className="w-full h-full object-cover"
                />
              </>
            )}
          </div>

          {productDataLoading ? (
            <Skeleton className="w-full h-6" />
          ) : (
            <div
              className={cn(
                `w-full py-2 flex items-center justify-center font-semibold text-base gap-2`,
                saleTimeEnded ? "bg-grey-3 text-grey-2" : "bg-Orange text-white"
              )}
            >
              {saleTimeEnded ? (
                <p>Sale Ended</p>
              ) : (
                <>
                  <p>Sale Ends In</p>
                  <CountdownTimer endTime={productData.endTime} />
                </>
              )}
            </div>
          )}
        </div>

        <CardContent className="pb-4 space-y-2 3xl:space-y-4">
          {metadataLoading ? (
            <Skeleton className="w-full h-10" />
          ) : (
            <Badge>{metadata.attributes[2]?.value}</Badge>
          )}

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold">
              {metadataLoading ? (
                <Skeleton className="rounded-lg w-20 h-5" />
              ) : (
                <>{metadata.name || "Property"}</>
              )}
            </h2>

            <div className="flex items-start gap-1 text-grey-6">
              <MapPin className="h-5 w-5 text-grey-2" />
              <h3 className="text-base font-medium">
                {metadataLoading ? (
                  <Skeleton className="w-40 h-6" />
                ) : (
                  <>
                    {metadata.attributes[0]?.value},{" "}
                    {metadata.attributes[1]?.value}
                  </>
                )}
              </h3>
            </div>
          </div>

          <ProgressOfShares product={productData} />

          <div className="flex items-center justify-between">
            <div>
              {productDataLoading ? (
                <Skeleton className="w-20 h-5" />
              ) : (
                <>
                  <h4 className="text-grey-5 text-xs xl:text-sm">
                    Starting Price*
                  </h4>
                  <h3 className="text-xl font-bold">
                    $
                    {(
                      productData.pricePerShare * productData.totalShares
                    ).toLocaleString()}
                  </h3>
                </>
              )}
            </div>

            {productDataLoading ? (
              <Skeleton className="h-10 w-20 rounded-lg" />
            ) : (
              productData.endTime > getCurrentTimeInSeconds() && (
                <Button>
                  {productData.sharesRemaining > 0 ? "BUY NOW" : "SOLD OUT"}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
