"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image"; // Import Image component from next/image
import UserDashboard from "@/app/components/UserDashboard";
import { FiMinus, FiPlus, FiTrash } from "react-icons/fi";
import {
  Activity,
  NftMetadata,
  SecondaryListing,
  UserPropertyData,
  UserSecondaryListings,
} from "@/app/context/types";
import { useParams, useRouter } from "next/navigation";
import {
  _cancelSecondarySale,
  _createAuction,
  _getAuctionListing,
  _getSecondaryListing,
  _getUserProperty,
  _secondarySale,
  _updateSecondarySale,
  getMarketContract,
} from "@/app/context/helper-market";
import { useAccount } from "wagmi";
import Loader from "@/app/components/Loader";
import {
  fetchNftMetadata,
  NotifyError,
  NotifySuccess,
} from "@/app/context/helper";
import { _setApprovalForAll, getRwaContract } from "@/app/context/helper-rwa";
import { IoArrowBackCircle, IoArrowForwardCircle } from "react-icons/io5";
import { useKYCModal } from "@/app/context/KYCModalContext";
import { ProductDetailSkeleton } from "@/app/components/ui/SkeletonCard";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { _getAllSecondaryEventsById } from "@/app/context/subgraph-helpers/market-subgraph";
import PropertyActivityTable from "@/app/components/FAQTable";
import { Skeleton } from "@/app/components/ui/Skeleton";
import {
  maxDescriptionLength,
  MIN_AUCTION_DURATION_MS,
  MIN_START_OFFSET_MS,
} from "@/app/utils/constants";
import { toLocalInputString } from "@/app/utils";
import { Textarea } from "@/app/components/ui/textarea";
import FinancialBreakdown from "./FinancialBreakdown";
import PropertyCalculator from "./PropertyCalculator";
import ProposalModal from "@/app/components/modals/proposal-modal";
import Link from "next/link";
import {
  Coins,
  CreditCard,
  Eye,
  HandCoins,
  LinkIcon,
  MapPin,
  User,
} from "lucide-react";
import DownloadDocuments from "@/app/dashboard/primary-marketplace/productdetail/[id]/DownloadDocumentSection";
import { MapPreview } from "@/app/components/MapPicker";
import Swap from "@/app/components/Swap";
import { cn, getDisplayText } from "@/lib/utils";
import { _createProposal } from "@/app/context/helper-voting";
import { Button } from "@/app/components/ui/button";
import ImageSlider from "@/app/components/dashboard/image-slider";
import InfoCard from "@/app/components/dashboard/infoCard";
import ReferralLinkButton from "@/app/components/ReferralLinkButton";
import { HeadingPara } from "@/app/components/layout/heading";
import { Card, CardContent } from "@/app/components/ui/card";
import IconTitle from "@/app/components/dashboard/icon-title";
import ProgressOfShares from "@/app/components/dashboard/progress-of-shares";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

const MyProperty: React.FC = () => {
  const {
    particleProvider,
    userSecondaryListings,
    handleRefreshUserSecondaryListings,
    userSecondaryListingsLoading,
    handleRefreshAllProposals,
  } = useBitStakeContext();
  const { id } = useParams();

  const [product, setProduct] = useState<UserPropertyData | undefined>();
  const [listedProduct, setListedProduct] = useState<SecondaryListing>();
  const [isListed, setIsListed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [createProposalLoading, setCreateProposalLoading] =
    useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [listingLoading, setListingLoading] = useState<boolean>(true);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [userPrice, setUserPrice] = useState<string>("");
  const [proposalText, setProposalText] = useState<string>("");
  const { address: account } = useAccount();
  const { kycStatus, openModal } = useKYCModal();
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isProposalPopupOpen, setIsProposalPopupOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"sell" | "auction">("sell");
  const [propertyActivities, setPropertyActivities] = useState<Activity[]>([]);
  const [propertyActivitiesLoading, setPropertyActivitiesLoading] =
    useState<boolean>(true);
  // State for NFT metadata from the product URI
  const [metadata, setMetadata] = useState<NftMetadata>();
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);

  const [showFull, setShowFull] = useState(false);

  const nowMs = Date.now();
  const minStartMs = Math.ceil((nowMs + MIN_START_OFFSET_MS) / 60_000) * 60_000;
  const maxMs = minStartMs + 7 * 24 * 60 * 60_000;

  // const [startMs, setStartMs] = useState(minStartMs);
  // const [endMs, setEndMs] = useState(minStartMs + MIN_AUCTION_DURATION_MS);

  const [startMs, setStartMs] = useState(() => {
    const now = Date.now();
    const alignedNow = Math.ceil((now + MIN_START_OFFSET_MS) / 60_000) * 60_000;
    return alignedNow;
  });
  const [endMs, setEndMs] = useState(() => startMs + MIN_AUCTION_DURATION_MS);

  const [startTouched, setStartTouched] = useState(false);
  // const [showFull, setShowFull] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const openProposalPopup = () => setIsProposalPopupOpen(true);
  const closeProposalPopup = () => setIsProposalPopupOpen(false);

  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrement = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 0));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!product?.sharesOwned) return;
    const value = Number(event.target.value);
    const sharesRemaining = product.sharesOwned;
    if (sharesRemaining < value) {
      NotifyError("Share limit exceeded");
      return;
    } else {
      setQuantity(value);
    }
  };

  const _getPropertyListing = async (
    propertyId: number,
    userSecondaryListings: UserSecondaryListings[]
  ) => {
    console.log(userSecondaryListings);

    const _isListed =
      userSecondaryListings.length > 0 &&
      userSecondaryListings.filter(
        (listing) => Number(listing._propertyId) === propertyId
      )[0];

    if (_isListed) {
      const foundListedProduct = await _getSecondaryListing({
        listingId: Number(_isListed._listingId),
      });
      if (foundListedProduct) {
        setListedProduct(foundListedProduct);
        if (foundListedProduct.pricePerShare > 0) setIsListed(true);
      }
    } else {
      setListedProduct(undefined);
      setIsListed(false);
    }
  };

  const _getProperty = async (userAddress: string, propertyId: number) => {
    setPageLoading(true);

    const rwaContract = getRwaContract();
    const foundProduct = await _getUserProperty({
      userAddress: userAddress,
      propertyId: propertyId,
      rwaContract,
    });

    setProduct(foundProduct);
    setPageLoading(false);
  };

  const handleRefreshProductActivities = async (_id: number) => {
    const res = await _getAllSecondaryEventsById(_id);
    setPropertyActivities(res);
  };

  const handleSellNow = async () => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed") {
        await openModal(account);
        throw new Error("Complete KYC in order to continue");
      }
      if (!product) throw new Error("Product Not Available");
      if (quantity == 0 || userPrice == "" || Number(userPrice) <= 0)
        throw new Error("Invalid Parameters");
      setLoading(true);

      await _setApprovalForAll({ userAddress: account, particleProvider });

      await _secondarySale({
        propertyId: product.propertyId,
        noOfShares: quantity,
        pricePerShare: userPrice,
        listingPricePerShare: product.pricePerShare,
        particleProvider,
      });

      setQuantity(0);
      setIsPopupOpen(false);
      NotifySuccess("Shares Listed Successfully");
      await _getProperty(account, product.propertyId);
      await handleRefreshUserSecondaryListings(account);
      await handleRefreshProductActivities(product.propertyId);
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAuction = async () => {
    if (endMs - startMs < 15 * 60_000) {
      NotifyError("End time must be at least 15 minutes after start time");
      return;
    }

    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed")
        throw new Error("Complete KYC in order to continue");
      if (!product) throw new Error("Product Not Available");
      if (quantity == 0 || userPrice == "" || Number(userPrice) <= 0)
        throw new Error("Invalid Parameters");
      if (endMs - startMs < 15 * 60_000) {
        throw new Error(
          "End time must be at least 15 minutes after start time"
        );
      }

      setLoading(true);

      await _setApprovalForAll({ userAddress: account, particleProvider });

      console.log("PAYLOADDDD: ", {
        propertyId: product.propertyId,
        noOfShares: quantity,
        basePrice: userPrice,
        startTime: Math.floor(startMs / 1000),
        endTime: Math.floor(endMs / 1000),
      });

      await _createAuction({
        propertyId: product.propertyId,
        noOfShares: quantity,
        basePrice: userPrice,
        startTime: Math.floor(startMs / 1000),
        endTime: Math.floor(endMs / 1000),
        listingPricePerShare: product.pricePerShare,
        particleProvider,
      });

      setQuantity(0);
      setIsPopupOpen(false);
      NotifySuccess("Auction Listed Successfully");
      await _getProperty(account, product.propertyId);
      await handleRefreshUserSecondaryListings(account);
      await handleRefreshProductActivities(product.propertyId);

      window.location.href = "/dashboard/auction";
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed")
        throw new Error("Complete KYC in order to continue");
      if (!product) throw new Error("Product Not Available");
      if (proposalText == "")
        throw new Error("Please add proposal description");

      setCreateProposalLoading(true);

      console.log("PAYLOADDDD: ", {
        propertyId: product.propertyId,
        description: proposalText,
        connectedAddress: account,
        particleProvider,
      });

      await _createProposal({
        propertyId: product.propertyId,
        description: proposalText,
        connectedAddress: account,
        particleProvider,
      });

      setIsProposalPopupOpen(false);
      NotifySuccess("Proposal Created Successfully");
      await handleRefreshAllProposals(account);

      window.location.href = "/dashboard/vote";
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setCreateProposalLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed") {
        await openModal(account);
        throw new Error("Complete KYC in order to continue");
      }
      if (!product || !listedProduct) throw new Error("Property Not Available");
      if (quantity == 0 && (userPrice == "" || userPrice == "0"))
        throw new Error("Invalid Parameters");
      setLoading(true);

      await _setApprovalForAll({ userAddress: account, particleProvider });

      await _updateSecondarySale({
        propertyId: product.propertyId,
        listingId: listedProduct.listingId,
        noOfShares: quantity,
        pricePerShare: userPrice == "" ? "0" : userPrice,
        listingPricePerShare: product.pricePerShare,
        particleProvider,
      });

      setQuantity(0);
      setIsPopupOpen(false);
      NotifySuccess("Listing Updated Successfully");
      await _getProperty(account, product.propertyId);
      await handleRefreshUserSecondaryListings(account);
      await handleRefreshProductActivities(product.propertyId);
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed") {
        await openModal(account);
        throw new Error("Complete KYC in order to continue");
      }
      if (!product || !listedProduct) throw new Error("Property Not Available");
      setLoading2(true);

      await _cancelSecondarySale({
        listingId: listedProduct.listingId,
        particleProvider,
      });

      NotifySuccess("Listing Cancel Successfully");
      await _getProperty(account, product.propertyId);

      await handleRefreshUserSecondaryListings(account);
      setIsListed(false);
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setLoading2(false);
    }
  };

  // Once product is loaded and has a valid URI, fetch NFT metadata.
  useEffect(() => {
    if (product?.uri) {
      const fetchMetadata = async (_uri: string) => {
        setMetadataLoading(true);
        try {
          const meta = await fetchNftMetadata(_uri);
          const newMetadata: NftMetadata = {
            name: meta?.name || "",
            image: meta?.image || "",
            images: meta?.images || [],
            attributes: meta?.attributes || [],
            documents: meta?.documents || [],
            description: meta?.description || "",
            view3d: meta?.view3d || "",
            transactionBreakdown: meta?.transactionBreakdown || [],
            rentalBreakdown: meta?.rentalBreakdown || [],
            location:
              meta?.location &&
                typeof meta.location === "object" &&
                "latitude" in meta.location &&
                "longitude" in meta.location
                ? meta.location
                : undefined,
          };
          setMetadata(newMetadata);
        } catch (error) {
          console.log("Error fetching metadata", error);
        } finally {
          setMetadataLoading(false);
        }
      };
      fetchMetadata(product.uri);
    }
  }, [product?.uri]);

  useEffect(() => {
    (async () => {
      setPropertyActivitiesLoading(true);
      const productId = Number(id);
      await handleRefreshProductActivities(productId);
      setPropertyActivitiesLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    const productId = Number(id);
    if (!account) return;
    (async () => {
      setListingLoading(true);
      await _getPropertyListing(productId, userSecondaryListings);
      setListingLoading(false);
    })();
  }, [product, userSecondaryListings, id]);

  useEffect(() => {
    const productId = Number(id);

    (async () => {
      if (account) {
        await _getProperty(account, productId);
      }

      setPageLoading(false);
    })();
  }, [id, account]);

  const hasDocuments = !!metadata?.documents && metadata.documents.length > 0;
  const hasView3D = !!metadata?.view3d;

  return (
    <UserDashboard>
      {pageLoading ? (
        <ProductDetailSkeleton />
      ) : !product ? (
        <div className="col-span-3 w-full min-h-[80vh] flex items-center justify-center">
          <p className="shadow-md rounded-lg p-5">No Property Found</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-full grid grid-cols-1 xl:grid-cols-8 macBook:grid-cols-11 gap-6">
            <div className="xl:col-span-4 macBook:col-span-5 rounded-3xl bg-transparent">
              <ImageSlider images={product.images} />
            </div>

            <Card
              className={`xl:col-span-5 xl:col-start-5 macBook:col-span-6 macBook:col-start-6`}
            >
              <CardContent className="space-y-6">
                <HeadingPara
                  title={product?.name}
                  className="text-xl md:!text-2xl"
                  tag="h1"
                />

                <div className="flex items-center gap-2">
                  <div className="flex items-start gap-1">
                    <MapPin className="h-5 w-5 text-grey-2" />
                    <h3 className="text-base font-medium text-grey-6">
                      {product.attributes[0]?.value},{" "}
                      {product.attributes[1]?.value}
                    </h3>
                  </div>
                </div>

                <div
                  className="border-t border-b border
                                  grid grid-cols-1 md:grid-cols-3 
                                  md:divide-x divide-y md:divide-border"
                >
                  <InfoCard
                    title="Property Worth"
                    value={`$${product?.totalPrice.toLocaleString()}`}
                    Icon={HandCoins}
                  />

                  <InfoCard
                    title="Total Shares"
                    value={product.totalShares}
                    Icon={User}
                  />
                  <InfoCard
                    title="Total Owners"
                    value={product?.totalOwners}
                    Icon={User}
                  />
                  <InfoCard
                    title="Price per Share"
                    value={product.pricePerShare.toLocaleString()}
                    Icon={HandCoins}
                  />
                  <InfoCard
                    title="Stakes Owned"
                    value={product.sharesOwned.toLocaleString()}
                    Icon={User}
                  />
                  <InfoCard
                    title="Your Listing Price"
                    value={
                      listedProduct?.pricePerShare.toLocaleString() ===
                        undefined
                        ? "--"
                        : `$${listedProduct?.pricePerShare.toLocaleString()}`
                    }
                    Icon={User}
                  />

                  {/* <div className="flex md:col-span-3 w-full border-t p-3">
                    <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 w-full">
                      <IconTitle Icon={Coins} title="Stakes Breakdown" className="!flex-row" />
                      <div className="flex flex-1 flex-wrap sm:justify-end items-center gap-1">
                        <Badge>
                          Stakes Owned: ${product.sharesOwned.toLocaleString()}
                        </Badge>

                        <Badge>
                          No. of Stakes Listed: {product.totalShares}
                        </Badge>
                      </div>
                    </div>
                  </div> */}
                </div>

                <div className="flex flex-col gap-5">
                  {listingLoading || userSecondaryListingsLoading ? (
                    <div className="flex flex-col gap-5">
                      <Skeleton className="w-full h-[64px] rounded-[15px]" />
                    </div>
                  ) : (
                    <div className="flex items-center flex-col justify-center gap-4 md:flex-row">
                      <Button
                        className="w-full"
                        onClick={openProposalPopup}
                        disabled={loading2 || loading2}
                        variant="outline"
                      >
                        Create Proposal
                      </Button>
                      <Button
                        className="w-full"
                        onClick={openPopup}
                        disabled={loading || loading2}
                      >
                        {isListed
                          ? "Update Listing / Auction"
                          : "Sell / Auction"}
                      </Button>
                    </div>
                  )}
                  {listingLoading || userSecondaryListingsLoading ? (
                    <div className="flex flex-col gap-5">
                      <Skeleton className="w-full h-[64px] rounded-[15px]" />
                    </div>
                  ) : (
                    isListed && (
                      <Button
                        variant="destructive_outline"
                        onClick={handleCancel}
                        disabled={loading2}
                      >
                        {loading2 ? (
                          <Loader classname="h-6 w-6" />
                        ) : (
                          "Cancel Listing"
                        )}
                      </Button>
                    )
                  )}
                </div>
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

                {!metadataLoading && metadata && (
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
                          <DownloadDocuments documents={metadata!.documents!} />
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
                            href={metadata!.view3d!}
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
            activities={propertyActivities}
            isLoading={propertyActivitiesLoading}
          />
          {metadata?.location && (
            <Card className="pb-0">
              <HeadingPara
                title="Location Preview"
                classNameTitle="text-base xl:text-lg px-4 macBook:text-xl"
              />
              <MapPreview
                latitude={metadata.location.latitude}
                longitude={metadata.location.longitude}
                className="h-80 rounded-b-3xl"
              />
            </Card>
          )}
          <PropertyCalculator apr={product.aprBips} />
          <FinancialBreakdown
            transactionBreakdown={metadata?.transactionBreakdown || []}
            rentalBreakdown={metadata?.rentalBreakdown || []}
            loading={metadataLoading}
          />
        </div>
      )}

      {/* Popup Component */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <Card className="w-[330px] sm:w-[480px] relative pt-0">
            {/* Header with Tabs */}
            <div className="p-6 pb-0">
              <div className="flex border-b mb-6 gap-4 items-center">
                <button
                  className={`px-4 w-full py-2 text-base font-medium border-b-2 transition-colors ${activeTab === "sell"
                    ? "text-primary border-primary"
                    : "text-grey-2 border-transparent hover:text-grey-4"
                    }`}
                  onClick={() => setActiveTab("sell")}
                >
                  {isListed ? "Update" : "Sell"} Listing
                </button>
                <button
                  className={`px-4 py-2 w-full text-base font-medium  border-b-2 transition-colors ${activeTab === "auction"
                    ? "text-primary border-primary"
                    : "text-grey-2 border-transparent hover:text-grey-4"
                    }`}
                  onClick={() => setActiveTab("auction")}
                >
                  Auction Listing
                </button>
              </div>
            </div>

            {/* Content */}
            <CardContent className="space-y-4">
              {/* Product */}
              <div className="w-full h-full">
                <Image
                  src={(product?.image as string) || "/placeholder.svg"}
                  alt="product"
                  width={500}
                  height={500}
                  className="w-full object-cover h-40 3xl:h-48 rounded-2xl"
                />
              </div>
              <div className="flex flex-col items-center gap-4 mb-6 w-full">
                <h2 className="text-black text-xl font-bold line-clamp-1">
                  No. of stakes{" "}
                  {activeTab === "auction"
                    ? "on auction"
                    : isListed
                      ? "to update listing"
                      : "to list"}
                </h2>
                <div className="flex items-center justify-between gap-2 w-full">
                  <Button
                    disabled={quantity < 1}
                    onClick={handleDecrement}
                    variant="skyBlue"
                  >
                    <FiMinus className="text-[15px]" />
                  </Button>
                  <Input
                    type="number"
                    placeholder="1"
                    value={quantity}
                    onChange={handleChange}
                    className=""
                  />
                  <Button
                    disabled={product && quantity >= product.sharesOwned}
                    onClick={handleIncrement}
                    variant="skyBlue"
                  >
                    <FiPlus className="text-[15px]" />
                  </Button>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-3">
                <Label>
                  {activeTab === "sell"
                    ? isListed
                      ? "New price per share (USDC)"
                      : "Sell price per share (USDC)"
                    : "Bid price for all shares"}
                </Label>
                <Input
                  type="number"
                  name="fractions"
                  className="border rounded px-4 py-2"
                  onChange={(e) => setUserPrice(e.target.value)}
                  placeholder={
                    activeTab === "sell"
                      ? "Sell price in USD"
                      : "Bid price in USD"
                  }
                />
              </div>

              {activeTab === "auction" && (
                <div className="flex items-center gap-4 pr-4 mt-4">
                  {/* START */}
                  <div className="w-1/2 space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <input
                      id="startTime"
                      type="datetime-local"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={toLocalInputString(startMs)}
                      min={toLocalInputString(minStartMs)}
                      step={60}
                      onChange={(e) => {
                        const v = new Date(e.target.value).getTime();
                        setStartMs(v);
                        setStartTouched(true);
                        setEndMs(v + MIN_AUCTION_DURATION_MS);
                      }}
                    />
                  </div>

                  {/* END */}
                  <div className="w-1/2 space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <input
                      id="endTime"
                      type="datetime-local"
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={toLocalInputString(endMs)}
                      min={toLocalInputString(
                        startMs + MIN_AUCTION_DURATION_MS
                      )}
                      step={60}
                      disabled={!startTouched}
                      onChange={(e) =>
                        setEndMs(new Date(e.target.value).getTime())
                      }
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <Button
                  onClick={closePopup}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (activeTab === "auction") {
                      handleAuction();
                    } else {
                      isListed ? handleUpdate() : handleSellNow();
                    }
                  }}
                  loading={loading}
                  className="w-full"
                >
                  {activeTab === "auction"
                    ? "Auction"
                    : isListed
                      ? "Update"
                      : "Sell"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ProposalModal
        isOpen={isProposalPopupOpen}
        product={product}
        proposalText={proposalText}
        setProposalText={setProposalText}
        onClose={closeProposalPopup}
        onCreateProposal={handleCreateProposal}
        isLoading={loading}
        createProposalLoading={createProposalLoading}
      />
      <br />
      <br />
      <br />
    </UserDashboard>
  );
};

export default MyProperty;
