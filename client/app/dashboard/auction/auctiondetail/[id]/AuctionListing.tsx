"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  _buySecondaryShares,
  _cancelAuction,
  _concludeAuction,
  _getAuctionDetail,
  _getAuctionListing,
  _getBidAmount,
  _getPrimaryListedProperty,
  _getQuote,
  _getSecondaryListing,
  _placeBid,
} from "@/app/context/helper-market";
import {
  Activity,
  AuctionDetail,
  AuctionProduct,
  AuctionState,
  NftMetadata,
} from "@/app/context/types";
import Loader from "@/app/components/Loader";
import { useAccount } from "wagmi";
import {
  getCurrentTimeInSeconds,
  NotifyError,
  NotifySuccess,
  shortenWalletAddress,
} from "@/app/context/helper";
import { IoArrowBackCircle, IoArrowForwardCircle } from "react-icons/io5";
import {
  _getAllSecondaryEventsById,
  getAllBidsInAuction,
} from "@/app/context/subgraph-helpers/market-subgraph";

import { useKYCModal } from "@/app/context/KYCModalContext";
import { ProductDetailSkeleton } from "@/app/components/ui/SkeletonCard";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import UserDashboard from "@/app/components/UserDashboard";
import PropertyActivityTable from "@/app/components/FAQTable";
import BidModal from "@/app/components/modals/bid-modal";
import { DEFAULT_IMAGES, maxDescriptionLength } from "@/app/utils/constants";
import { _getPropertyDetails } from "@/app/context/helper-rwa";
import axios from "axios";
import { Coins, Eye, Hammer, HandCoins, ListFilter, MapPin, User, User2 } from "lucide-react";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { Metadata } from "@/app/components/dashboard/ProductCard";
import ImageSlider from "@/app/components/dashboard/image-slider";
import { Card, CardContent } from "@/app/components/ui/card";
import Swap from "@/app/components/Swap";
import IconTitle from "@/app/components/dashboard/icon-title";
import Link from "next/link";
import { HeadingPara } from "@/app/components/layout/heading";
import { cn, getDisplayText } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import DownloadDocuments from "@/app/dashboard/primary-marketplace/productdetail/[id]/DownloadDocumentSection";
import PropertyCalculator from "@/app/dashboard/my-properties/productdetail/[id]/PropertyCalculator";
import FinancialBreakdown from "@/app/dashboard/my-properties/productdetail/[id]/FinancialBreakdown";
import { MapPreview } from "@/app/components/MapPicker";
import InfoCard from "@/app/components/dashboard/infoCard";
import { Badge } from "@/app/components/ui/badge";

const AuctionListing: React.FC = () => {
  const { address: account } = useAccount();
  const { kycStatus } = useKYCModal();
  const { id } = useParams();
  const [product, setProduct] = useState<AuctionProduct | null>(null);
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetail | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [propertyActivities, setPropertyActivities] = useState<Activity[]>([]);
  const [propertyActivitiesLoading, setPropertyActivitiesLoading] =
    useState<boolean>(true);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [defaultBid, setDefaultBid] = useState<string>("");
  const [showFull, setShowFull] = useState(false);

  const { particleProvider } = useBitStakeContext();

  const getListing = async (
    auctionId: number,
    account: `0x${string}` | undefined
  ) => {
    const auctionDetailsFound = await _getAuctionDetail({
      auctionId,
      account,
      particleProvider,
    });

    if (auctionDetailsFound) {
      setAuctionDetails(auctionDetailsFound);
      // You may need to fetch property details and metadata here as well, similar to your useEffect
      const propertyId = auctionDetailsFound.propertyId;
      if (propertyId === undefined) {
        setProduct(null);
        return;
      }
      try {
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
          view3d: '',
          documents: [],
          transactionBreakdown: [],
          rentalBreakdown: []
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
        } catch {
          // ignore metadata errors
        }
        setProduct({
          auctionId,
          propertyId,
          owner: details.owner,
          pricePerShare: details.pricePerShare,
          totalOwners: details.totalOwners,
          totalShares: details.totalShares,
          totalPrice: details.totalShares * details.pricePerShare,
          uri: details.uri,
          startTime: Number(auctionDetailsFound.startTime) * 1000,
          endTime: Number(auctionDetailsFound.endTime) * 1000,
          noOfShares: Number(auctionDetailsFound.noOfShares),
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
          seller: auctionDetailsFound.seller,
          quantity: auctionDetailsFound.noOfShares,
          basePrice: auctionDetailsFound.basePrice,
          highestBid: auctionDetailsFound.highestBid,
          highestBidder: auctionDetailsFound.highestBidder,
          isHighestBidder:
            auctionDetailsFound.highestBidder?.toLowerCase() ===
            account?.toLowerCase(),
          isSeller:
            auctionDetailsFound.seller?.toLowerCase() ===
            account?.toLowerCase(),
          status: auctionDetailsFound.status,
          rentalBreakdown: meta.rentalBreakdown,
          transactionBreakdown: meta.transactionBreakdown,
          documents: meta.documents,
          location: meta.location,
          view3d: meta.view3d,
          aprBips: details.aprBips
        });
      } catch (err) {
        setProduct(null);
      }
    }
  };

  useEffect(() => {
    const auctionId = Number(id);
    const load = async () => {
      setLoading(true);
      try {
        // 1️⃣ on-chain auction auctionListing
        const auctionListing = await _getAuctionDetail({
          auctionId,
          account,
          particleProvider,
        });

        setAuctionDetails(auctionListing);

        const propertyId = auctionListing?.propertyId;

        // 2️⃣ on-chain property details
        if (propertyId === undefined) {
          throw new Error("Property ID is undefined");
        }

        const details = await _getPropertyDetails({ propertyId });

        if (details === null) {
          setProduct(null);
          return;
        }

        // 3️⃣ off-chain metadata
        let meta: NftMetadata = {
          name: "—",
          description: "—",
          image: DEFAULT_IMAGES[0],
          images: DEFAULT_IMAGES,
          attributes: [],
          view3d: '',
          documents: [],
          transactionBreakdown: [],
          rentalBreakdown: []
        };
        try {
          const { data } = await axios.get(details.uri);
          meta = {
            name: data?.name || "",
            image: data?.image || "",
            images: data?.images || [],
            attributes: data?.attributes || [],
            documents: data?.documents || [],
            description: data?.description || "",
            view3d: data?.view3d || "",
            transactionBreakdown: data?.transactionBreakdown || [],
            rentalBreakdown: data?.rentalBreakdown || [],
            ...(data?.location && {
              location: {
                latitude: data.location.latitude,
                longitude: data.location.longitude,
              },
            }),
          };
        } catch {
          // ignore metadata errors
        }

        // 4️⃣ assemble one product object
        if (!auctionListing) {
          throw new Error("Auction listing not found");
        }
        setProduct({
          auctionId,
          propertyId,
          owner: details.owner,
          pricePerShare: details.pricePerShare,
          totalOwners: details.totalOwners,
          totalShares: details.totalShares,
          totalPrice: details.totalShares * details.pricePerShare,
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
          aprBips: details.aprBips
        });
      } catch (err) {
        console.log("AuctionCard load error:", err);
        setProduct(null);
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };
    load();
  }, [id, account, particleProvider]);

  const handleBid = async (bidPrice: string) => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed")
        throw new Error("Complete KYC in order to continue");
      if (!product) throw new Error("Product Not Available");
      if (quantity == 0 || bidPrice == "" || Number(bidPrice) <= 0)
        throw new Error("Invalid Parameters");

      setLoading(true);

      // actually place the bid on-chain
      await _placeBid({
        auctionId: product.id,
        accountAddress: account,
        particleProvider,
        bidPrice,
      });

      setIsBidModalOpen(false);
      NotifySuccess("Bid Placed Successfully");

      await getListing(Number(id), account);
      // await handleRefreshAllAuctionListings()
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBids = async () => {
      if (!id) return;
      setPropertyActivitiesLoading(true);
      try {
        const events = await getAllBidsInAuction(Number(id));

        const activities: Activity[] = events.map((ev) => ({
          // matches Activity = { event, userWalletAddress, date, txHash }
          event: "Bid",
          userWalletAddress: ev._bidder,
          date: new Date(Number(ev.blockTimestamp) * 1000).toLocaleString(
            "en-US",
            {
              dateStyle: "short",
              timeStyle: "short",
            }
          ),
          txHash: ev.transactionHash,
        }));

        setPropertyActivities(activities);
      } catch (err) {
        console.log("Failed to load bids:", err);
        setPropertyActivities([]);
      } finally {
        setPropertyActivitiesLoading(false);
      }
    };

    loadBids();
  }, [id]);

  // when user clicks “Place Bid” — fetch the current minimum and open modal:
  const openBidModal = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const { bidAmount } = await _getBidAmount({
        auctionId: product.id,
        particleProvider,
      });
      setDefaultBid(bidAmount.toString());
      setIsBidModalOpen(true);
    } catch (err) {
      NotifyError("Failed to fetch minimum bid");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAuction = async () => {
    try {
      setLoading(true);
      await _cancelAuction({ auctionId: product!.id, particleProvider });
      NotifySuccess("Auction cancelled");
      await getListing(Number(id), account);

      window.location.href = "/dashboard/auction";
    } catch (err: any) {
      NotifyError(err.reason || err.message || "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConcludeAuction = async () => {
    try {
      setLoading(true);
      await _concludeAuction({ auctionId: product!.id, particleProvider });
      NotifySuccess("Auction concluded");
      await getListing(Number(id), account);

      window.location.href = "/dashboard/auction";
    } catch (err: any) {
      NotifyError(err.reason || err.message || "Conclude failed");
    } finally {
      setLoading(false);
    }
  };

  // canConclude: you need to be connected and have auction details loaded
  const canConclude = Boolean(account && auctionDetails);

  // canCancel: you need to be connected, have auction details, and be the seller
  const canCancel = Boolean(
    account &&
    auctionDetails &&
    auctionDetails.seller.toLowerCase() === account.toLowerCase()
  );

  const status = auctionDetails?.status ?? "not_started";

  const statusTextMap: Record<AuctionState, string> = {
    not_started: "Upcoming",
    on_going: "On-Going",
    cancelled: "Cancelled",
    ended: "Ended",
    concluded: "Concluded",
  };

  const badgeClassesMap: Record<AuctionState, string> = {
    not_started: "bg-blue-100 text-blue-800",
    on_going: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    ended: "bg-gray-200 text-gray-600",
    concluded: "bg-purple-100 text-purple-800",
  };

  const startTime = product?.startTime ?? 0;
  const endTime = product?.endTime ?? 0;

  const nowSecs = getCurrentTimeInSeconds();
  // console.log("🚀 ~ AuctionListing ~ nowSecs:", nowSecs)
  const startSecs = Math.floor(startTime / 1000);
  // console.log("🚀 ~ AuctionListing ~ startSecs:", startSecs)
  const endSecs = Math.floor(endTime / 1000);
  // console.log("🚀 ~ AuctionListing ~ endSecs:", endSecs)

  // 2. Pick the right bg + text color
  const badgeClasses =
    status === "not_started"
      ? "bg-blue-500 text-white"
      : status === "on_going"
        ? "bg-green-500 text-white"
        : "bg-gray-400 text-white";

  const hasDocuments = !!product?.documents && product.documents.length > 0;
  const hasView3D = !!product?.view3d;

  return (
    <UserDashboard>
      {pageLoading ? (
        <ProductDetailSkeleton />
      ) : !product ? (
        <div className="col-span-3 w-full min-h-[80vh] flex items-center justify-center">
          <p className="shadow-md rounded-lg p-5">No Auction Listing Found</p>
        </div>
      ) : (
        <div className='space-y-6'>
          <div className="w-full grid grid-cols-1 xl:grid-cols-8 macBook:grid-cols-11 gap-6">
            <div className="xl:col-span-4 macBook:col-span-5 rounded-3xl bg-transparent">
              <ImageSlider images={product.images} />
            </div>

            <Card
              className={`xl:col-span-5 xl:col-start-5 macBook:col-span-6 macBook:col-start-6 relative pt-0`}
            >
              <div className={`w-full py-2 flex items-center rounded-t-3xl justify-center font-semibold text-base gap-2 ${badgeClassesMap[status]
                }`}
              >
                {statusTextMap[status]}
                <div className="text-sm text-grey-6">
                  {status === "on_going" && (
                    <CountdownTimer
                      endTime={endSecs}
                    />
                  )}
                </div>
              </div>

              {/* <div
                className={cn(
                  `w-full py-2 flex items-center rounded-t-3xl justify-center font-semibold text-base gap-2`,
                  status === '' ? "bg-grey-3 text-grey-2" : "bg-Orange text-white"
                )}
              >
                {saleTimeEnded ? (
                  <p>Sale Ended</p>
                ) : (
                  <>
                    <p>Sale Ends In</p>
                    <CountdownTimer endTime={product.endTime} />
                  </>
                )}
              </div> */}
              <CardContent className="space-y-6">
                <HeadingPara title={product?.name} className="text-xl md:!text-2xl" tag="h1" />

                <div className="flex items-center gap-4">
                  <div className="flex items-start gap-1">
                    <MapPin className="h-5 w-5 text-grey-2" />
                    <h3 className="text-base font-medium text-grey-6">
                      {product.attributes[0]?.value}, {product.attributes[1]?.value}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <User2 className="h-5 w-5 text-grey-2" />
                    <p className="text-base font-medium text-grey-6">{shortenWalletAddress(product.seller)}</p>
                  </div>
                </div>

                <div
                  className="border-t border-b border
                      grid grid-cols-1 md:grid-cols-3 
                      md:divide-x divide-y md:divide-border"
                >
                  <InfoCard
                    title="Starting Price"
                    value={`$${product.pricePerShare.toLocaleString()}`}
                    Icon={HandCoins}
                  />

                  <InfoCard
                    title="Highest Bid"
                    value={
                      (auctionDetails?.highestBid ?? 0) > 0
                        ? `$${auctionDetails?.highestBid}`
                        : "--"
                    }
                    Icon={Coins}
                  />

                  <InfoCard
                    title="Highest Bidder"
                    value={auctionDetails?.highestBidder ===
                      "0x0000000000000000000000000000000000000000"
                      ? "--"
                      : `$${shortenWalletAddress(
                        auctionDetails?.highestBidder ?? ""
                      )}`}
                    Icon={ListFilter}
                  />

                  <div className="flex md:col-span-3 w-full border-t p-3">
                    <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 w-full">
                      <IconTitle Icon={Coins} title="Detail" className="!flex-row" />
                      <div className="flex flex-1 flex-wrap sm:justify-end items-center gap-1">
                        <Badge>
                          Total Owners: ${product.totalOwners}
                        </Badge>

                        <Badge>
                          No. of Stakes Listed: {product.noOfShares}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ongoing → allow bidding */}
                {status === "on_going" && (
                  <Button
                    onClick={openBidModal}
                    disabled={loading || loading2 || !account}
                    size='lg'
                    className="w-full"
                  >
                    <Hammer />
                    Place Bid
                  </Button>
                )}

                {/* Before it ends, if you’re the seller → cancel */}
                {status === "not_started" && canCancel && (
                  <Button
                    onClick={handleCancelAuction}
                    loading={loading}
                    size='lg'
                    className="w-full"
                    variant='destructive_outline'
                  >
                    Cancel Auction
                  </Button>
                )}

                {/* Once ended, if allowed → conclude */}
                {status === "ended" && canConclude && (
                  <Button
                    onClick={handleConcludeAuction}
                    loading={loading}
                    size='lg'
                    className="w-full"
                    variant='outline'
                  >
                    Conclude Auction
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-between flex-col lg:flex-row gap-6">
            <Card className="w-full lg:w-1/2 xl:w-[45%]">
              <CardContent className="space-y-4">
                <HeadingPara
                  title="Description"
                  classNameTitle="text-base xl:text-lg macBook:text-xl"
                />

                {product && (
                  <p className="text-sm text-grey-1 font-medium">
                    {getDisplayText({
                      text: product.description,
                      showFull: showFull,
                    })}
                    {product.description.length > maxDescriptionLength && (
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
                )
                }

                {
                  (hasDocuments || hasView3D) && (
                    <div className="flex w-full border overflow-hidden">
                      {hasDocuments && (
                        <div
                          className={cn(
                            "flex items-center justify-center px-4 py-4 w-full",
                            hasView3D && "w-1/2 border-r"
                          )}
                        >
                          <DownloadDocuments documents={product!.documents!} />
                        </div>
                      )}

                      {hasView3D && (
                        <div
                          className={cn(
                            "flex items-center justify-center px-4 py-4 text-grey-6 w-full",
                            hasDocuments && "w-1/2"
                          )}
                        >
                          <Link
                            href={product!.view3d!}
                            target="_blank"
                            className="flex items-center justify-between w-full"
                          >
                            <IconTitle Icon={HandCoins} title="3D Model" className="!flex-row" />
                            <Eye className="h-8 3xl:h-10 w-8 3xl:w-10 p-1 border rounded-full" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                }
              </CardContent >
            </Card >
            <Swap className="w-full lg:w-1/2 xl:w-[55%]" />
          </div >

          <PropertyActivityTable
            activities={propertyActivities ?? []}
            isLoading={propertyActivitiesLoading}
          />

          {
            product?.location && (
              <Card className="pb-0">
                <HeadingPara
                  title="Location Preview"
                  classNameTitle="text-base xl:text-lg px-4 macBook:text-xl"
                />
                <MapPreview
                  latitude={product.location.latitude}
                  longitude={product.location.longitude}
                  className="h-80 rounded-b-3xl"
                />
              </Card>
            )
          }

          <PropertyCalculator apr={product.aprBips} />
          <FinancialBreakdown
            transactionBreakdown={product?.transactionBreakdown || []}
            rentalBreakdown={product?.rentalBreakdown || []}
            loading={loading}
          />
        </div>
      )}

      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        product={{
          image: product?.image || "/placeholder.svg",
          pricePerShare: product?.pricePerShare || 0,
          sharesRemaining: product?.sharesRemaining || 0,
          basePrice: auctionDetails?.basePrice ?? undefined,
          noOfShares: auctionDetails?.noOfShares || 0,
          isHighestBidder: auctionDetails?.isHighestBidder,
          highestBid: auctionDetails?.highestBid ?? null,
          highestBidder: auctionDetails?.highestBidder ?? null,
        }}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onBid={handleBid}
        loading={loading}
      />
    </UserDashboard>
  );
};

export default AuctionListing;
