"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAccount } from "wagmi";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { _getAuctionDetail } from "@/app/context/helper-market";
import { _getPropertyDetails } from "@/app/context/helper-rwa";
import { DEFAULT_IMAGES } from "@/app/utils/constants";
import {
  AuctionDetail,
  AuctionProduct,
  NftMetadata,
} from "@/app/context/types";
import { ProductCard } from "@/app/components/ui/SkeletonCard";
import { Calendar, Coins, User, User2 } from "lucide-react";
import {
  getCurrentTimeInSeconds,
  shortenWalletAddress,
} from "@/app/context/helper";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { Metadata } from "@/app/components/dashboard/ProductCard";
import { Card, CardContent } from "@/app/components/ui/card";
import Image from "next/image";
import InfoCard from "@/app/components/dashboard/infoCard";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface Props {
  propertyId: number;
  auctionId: number;
}

const AuctionCard: React.FC<Props> = ({ propertyId, auctionId }) => {
  const { address: account } = useAccount();
  const { particleProvider } = useBitStakeContext();

  const [product, setProduct] = useState<AuctionProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const auctionListing = await _getAuctionDetail({
          auctionId,
          account,
          particleProvider,
        });
        const details = await _getPropertyDetails({ propertyId });
        if (details === null) {
          setProduct(null);
          return;
        }
        let meta: NftMetadata = {
          name: "—",
          description: "—",
          image: DEFAULT_IMAGES[0],
          images: DEFAULT_IMAGES,
          attributes: [],
          view3d: "",
          documents: [],
          transactionBreakdown: [],
          rentalBreakdown: [],
        };
        try {
          const { data } = await axios.get(details.uri);
          meta = {
            name: data.name || meta.name,
            description: data.description || meta.description,
            image: data.image || meta.image,
            images: data.images || meta.images,
            attributes: data.attributes || [],
            view3d: data.view3d || null,
            documents: data?.documents || [],
            transactionBreakdown: data?.transactionBreakdown || [],
            rentalBreakdown: data?.rentalBreakdown || [],
            ...(data?.location && {
              location: {
                latitude: data.location.latitude,
                longitude: data.location.longitude,
              },
            }),
          };
        } catch {}
        if (!auctionListing) throw new Error("Auction not found");
        setProduct({
          auctionId,
          propertyId,
          owner: details.owner,
          pricePerShare: details.pricePerShare,
          totalOwners: details.totalOwners,
          totalShares: details.totalShares,
          totalPrice: details.totalShares * details.pricePerShare,
          aprBips: details.aprBips,
          uri: details.uri,
          startTime: Number(auctionListing.startTime) * 1000,
          endTime: Number(auctionListing.endTime) * 1000,
          noOfShares: Number(auctionListing.noOfShares),
          name: meta.name,
          description: meta.description,
          image: meta.image,
          images: meta.images,
          attributes: Array.isArray(meta.attributes)
            ? meta.attributes.map((attr: any) => ({
                trait_type: attr.trait_type ?? "",
                value: attr.value ?? "",
              }))
            : [],
          id: auctionId,
          seller: auctionListing.seller,
          quantity: auctionListing.noOfShares,
          basePrice: auctionListing.basePrice,
          highestBid: auctionListing.highestBid,
          highestBidder: auctionListing.highestBidder,
          isHighestBidder:
            auctionListing.highestBidder?.toLowerCase() ===
            account?.toLowerCase(),
          isSeller:
            auctionListing.seller?.toLowerCase() === account?.toLowerCase(),
          status: auctionListing.status,
          rentalBreakdown: meta.rentalBreakdown,
          transactionBreakdown: meta.transactionBreakdown,
          documents: meta.documents,
          location: meta.location,
          view3d: meta.view3d,
        });
      } catch (err) {
        console.log("AuctionCard load error:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auctionId, propertyId, account, particleProvider]);

  if (loading) return <ProductCard />;
  if (!product) return null;

  // status logic
  const { startTime, endTime, basePrice = 0, highestBid = 0 } = product;

  const nowSecs = getCurrentTimeInSeconds();
  const startSecs = Math.floor(startTime / 1000);
  const endSecs = Math.floor(endTime / 1000);

  // 1. Determine status
  const status =
    nowSecs < startSecs ? "upcoming" : nowSecs <= endSecs ? "ongoing" : "ended";

  // 2. Pick the right bg + text color
  const badgeClasses =
    status === "upcoming"
      ? "bg-blue-500 text-white"
      : status === "ongoing"
      ? "bg-green-500 text-white"
      : "bg-gray-400 text-white";

  const rawDiffPct =
    basePrice > 0 ? ((highestBid - basePrice) / basePrice) * 100 : 0;
  const diffPct = Math.abs(rawDiffPct).toFixed(0);
  const direction = rawDiffPct >= 0 ? "higher" : "lower";

  const fmt = { dateStyle: "short", timeStyle: "short" } as const;

  return (
    <Link href={`/dashboard/auction/auctiondetail/${product.auctionId}`}>
      <Card className="w-full h-auto overflow-hidden cursor-pointer py-0">
        <div className="relative">
          <div className="w-full h-44 xl:h-48 3xl:h-72 overflow-hidden rounded-t-3xl">
            {loading ? (
              <Skeleton className="w-full h-44 xl:h-56 3xl:h-48" />
            ) : (
              <>
                <Image
                  src={product.image}
                  alt={product.name || "Product image"}
                  width={480}
                  height={280}
                  className="w-full h-full object-cover"
                />
              </>
            )}
          </div>

          {/* {product.highestBidder !==
            "0x0000000000000000000000000000000000000000" && <div
              className={cn(
                `w-full py-2 flex items-center justify-center font-semibold text-base gap-2 bg-grey-3 text-grey-2`
              )}
            >
              <p>The highest current bid is {diffPct}% {direction} the market price</p>
            </div>} */}

          <div
            className={cn(
              `w-full p-2 flex items-center justify-center text-center font-semibold text-sm 4xl:text-base gap-2 bg-grey-3 text-grey-2`
            )}
          >
            <p>
              The highest current bid is {diffPct}% {direction} the market price
            </p>
          </div>
        </div>

        <CardContent className="pb-4 space-y-2 3xl:space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              {product.name}
            </h2>
            <p className="text-grey-2 text-sm sm:text-lg">
              Property ID: {product.propertyId}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <InfoCard
              className="border rounded-2xl"
              Icon={User}
              title="Seller"
              value={`${shortenWalletAddress(product.seller, 6, 6)}`}
            />
            <InfoCard
              className="border rounded-2xl"
              Icon={Coins}
              title="Sahres"
              value={`${product.noOfShares.toLocaleString()}`}
            />
            <InfoCard
              className="border rounded-2xl"
              Icon={Calendar}
              title="Start"
              value={new Date(startTime).toLocaleString("en-US", fmt)}
            />
            <InfoCard
              className="border rounded-2xl"
              Icon={Calendar}
              title="End"
              value={new Date(endTime).toLocaleString("en-US", fmt)}
            />
          </div>
          {status === "ongoing" ? (
            <Button className="w-full">Place Bid</Button>
          ) : status === "ended" ? (
            <Button variant="success" className="w-full">
              Conclude
            </Button>
          ) : (
            <Button variant="disabled" className="w-full">
              Upcoming
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default AuctionCard;
