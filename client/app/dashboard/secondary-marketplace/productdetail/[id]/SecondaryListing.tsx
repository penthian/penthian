"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  _buySecondaryShares,
  _getPrimaryListedProperty,
  _getQuote,
  _getSecondaryListing,
} from "@/app/context/helper-market";
import { Activity, NftMetadata, SecondaryListing } from "@/app/context/types";
import { useAccount } from "wagmi";
import {
  DELAY,
  NotifyError,
  NotifySuccess,
  ZERO_ADDRESS,
  fetchNftMetadata,
  getEthFrom,
  shortenWalletAddress,
} from "@/app/context/helper";
import {
  PLATFORM_LOGO,
  BITSTAKE_CONFIG,
  maxDescriptionLength,
  SALT_ETH,
  WERT_CONFIG,
} from "@/app/utils/constants";
import {
  approveUsdcSpender,
  getUsdcAllowance,
} from "@/app/context/helper-usdc";
import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { ethers } from "ethers";
import { _getAllSecondaryEventsById } from "@/app/context/subgraph-helpers/market-subgraph";

import { useKYCModal } from "@/app/context/KYCModalContext";
import { ProductDetailSkeleton } from "@/app/components/ui/SkeletonCard";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import UserDashboard from "@/app/components/UserDashboard";
import PropertyActivityTable from "@/app/components/FAQTable";
import { MapPreview } from "@/app/components/MapPicker";
import PropertyCalculator from "@/app/dashboard/my-properties/productdetail/[id]/PropertyCalculator";
import Swap from "@/app/components/Swap";
import FinancialBreakdown from "@/app/dashboard/my-properties/productdetail/[id]/FinancialBreakdown";
import Image from "next/image";
import {
  Coins,
  CreditCard,
  Eye,
  HandCoins,
  ListFilter,
  MapPin,
  Minus,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import ImageSlider from "@/app/components/dashboard/image-slider";
import { Card, CardContent } from "@/app/components/ui/card";
import { HeadingPara } from "@/app/components/layout/heading";
import { cn, getDisplayText } from "@/lib/utils";
import DownloadDocuments from "@/app/dashboard/primary-marketplace/productdetail/[id]/DownloadDocumentSection";
import Link from "next/link";
import IconTitle from "@/app/components/dashboard/icon-title";
import InfoCard from "@/app/components/dashboard/infoCard";
import ProgressOfShares from "@/app/components/dashboard/progress-of-shares";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";

const SingleSecondaryListing: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("USDC");
  const { address: account } = useAccount();
  const { kycStatus, openModal } = useKYCModal();
  const { id } = useParams();
  const [product, setProduct] = useState<SecondaryListing>();
  const [quantity, setQuantity] = useState<number | "">(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  // State for NFT metadata from the product URI
  const [metadata, setMetadata] = useState<NftMetadata>();
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const { particleProvider, handleRefreshAllSecondaryListings } =
    useBitStakeContext();
  const [propertyActivities, setPropertyActivities] = useState<Activity[]>([]);
  const [propertyActivitiesLoading, setPropertyActivitiesLoading] =
    useState<boolean>(true);
  const [showFull, setShowFull] = useState(false);

  const router = useRouter();

  const getListing = async (
    listingId: number,
    connectedAddress?: `0x${string}`
  ) => {
    const foundProduct = await _getSecondaryListing({ listingId });

    if (foundProduct) {
      if (
        connectedAddress &&
        foundProduct.seller.toLowerCase() === connectedAddress.toLowerCase()
      ) {
        router.push(
          `/dashboard/my-properties/productdetail/${foundProduct.propertyId}`
        );
        await DELAY(3);

        return;
      }
      setProduct(foundProduct);
    }
  };

  useEffect(() => {
    const listingId = Number(id);

    (async () => {
      setPageLoading(true);
      if (listingId) {
        await getListing(listingId, account);
      }
      setPageLoading(false);
    })();
  }, [id, account]);

  const handleIncrement = () => {
    setQuantity((prev) => {
      const current = typeof prev === "number" ? prev : 0;
      const next = current + 1;
      if (product && next > product.sharesRemaining) {
        NotifyError("Share limit exceeded");
        return product.sharesRemaining;
      }
      return next;
    });
  };

  const handleDecrement = () => {
    setQuantity((prev) => {
      const current = typeof prev === "number" ? prev : 1;
      return current > 1 ? current - 1 : 1;
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;

    if (raw === "") {
      setQuantity("");
      return;
    }

    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      return;
    }

    if (parsed < 1) {
      setQuantity(1);
      return;
    }

    if (product && parsed > product.sharesRemaining) {
      NotifyError("Share limit exceeded");
      setQuantity(product.sharesRemaining);
      return;
    }

    setQuantity(parsed);
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
            ...(meta?.location && {
              location: {
                latitude: meta.location.latitude,
                longitude: meta.location.longitude,
              },
            }),
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

  const handleRefreshProductActivities = async (_id: number) => {
    const res = await _getAllSecondaryEventsById(_id);
    setPropertyActivities(res);
  };

  useEffect(() => {
    (async () => {
      if (!product) return;
      setPropertyActivitiesLoading(true);
      await handleRefreshProductActivities(product.propertyId);
      setPropertyActivitiesLoading(false);
    })();
  }, [product]);

  const handleBuyNow = async (
    listingId: number,
    propertyId: number,
    pricePerShare: number,
    _seller: string
  ) => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed") {
        await openModal(account);
        throw new Error("Complete KYC in order to continue");
      }
      if (account.toLowerCase() == _seller.toLowerCase())
        throw new Error("Can't Buy Your Own Listing");
      setLoading(true);
      const buyAmount = pricePerShare * Number(quantity);
      let currency = ZERO_ADDRESS;
      if (selectedTab === "USDC") {
        const allowance = await getUsdcAllowance({
          owner: account as string,
          spenderType: "market",
        });
        if (buyAmount > allowance) {
          await approveUsdcSpender({
            amount: String(buyAmount),
            particleProvider,
            spenderType: "market",
          });
        }
        currency = BITSTAKE_CONFIG.usdc;
      }

      await _buySecondaryShares({
        property: {
          listingId: listingId,
          sharesToBuy: Number(quantity),
        },
        recipient: account as string,
        currency: currency,
        pricePerShare: pricePerShare,
        particleProvider,
      });
      setQuantity(1);
      NotifySuccess("Shares Bought Successfully");
      await getListing(listingId);
      await handleRefreshProductActivities(propertyId);
      await handleRefreshAllSecondaryListings();
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyWithCard = async (
    listingId: number,
    propertyId: number,
    pricePerShare: number,
    _seller: string,
    _propertyImage: string,
    _propertyName: string
  ) => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed") {
        await openModal(account);
        throw new Error("Complete KYC in order to continue");
      }
      if (!_seller) throw new Error("Seller id is not provided");
      if (account.toLowerCase() === _seller.toLowerCase())
        throw new Error("Can't Buy Your Own Listing");
      setLoading2(true);

      const property = {
        listingId: listingId,
        sharesToBuy: quantity,
      };

      let ABI = [
        {
          inputs: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "listingId",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "sharesToBuy",
                  type: "uint256",
                },
              ],
              internalType: "struct MarketPlace.Purchase",
              name: "_property",
              type: "tuple",
            },
            {
              internalType: "address",
              name: "_recipient",
              type: "address",
            },
            {
              internalType: "address",
              name: "_currency",
              type: "address",
            },
          ],
          name: "buySecondaryShares",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ];

      let iface = new ethers.utils.Interface(ABI);
      const sc_input_data = iface.encodeFunctionData("buySecondaryShares", [
        property,
        account,
        ZERO_ADDRESS,
      ]);

      const amountConversion = await _getQuote({
        sharesToBuy: Number(quantity),
        pricePerShare: pricePerShare,
      });

      const amountToBeSend = Number(
        parseFloat(getEthFrom(amountConversion)).toFixed(8)
      );
      if (amountToBeSend === 0) throw new Error("Invalid amount provided");

      const signedData = signSmartContractData(
        {
          address: account,
          commodity: WERT_CONFIG.commodity,
          commodity_amount: amountToBeSend + SALT_ETH,
          network: WERT_CONFIG.network,
          sc_address: BITSTAKE_CONFIG.market,
          sc_input_data,
        },
        WERT_CONFIG.privateKey
      );

      const extraOptions = {
        item_info: {
          author: "Penthian",
          author_image_url: PLATFORM_LOGO,
          image_url: _propertyImage,
          name: _propertyName,
          category: "Secondary Listing",
        },
      };
      const otherWidgetOptions = {
        partner_id: WERT_CONFIG.partnerId,
        origin: WERT_CONFIG.origin,
        extra: extraOptions,
      };
      const wertWidget = new WertWidget({
        ...signedData,
        ...otherWidgetOptions,
        listeners: {
          "payment-status": async (data) => {
            try {
              if (data.status === "success") {
                setQuantity(1);
                setLoading2(false);
                NotifySuccess("Shares Bought Successfully");
                await getListing(listingId);
                await handleRefreshProductActivities(propertyId);
                await handleRefreshAllSecondaryListings();
              } else if (
                data.status === "failed" ||
                data.status === "failover" ||
                data.status === "canceled"
              ) {
                setLoading2(false);
                NotifyError("Payment Failed or Canceled");
              }
            } catch (error: any) {
              NotifyError(
                error.reason || error.message || "Something went wrong"
              );
            }
          },
          close: () => {
            setLoading2(false);
          },
        },
      });

      wertWidget.open();
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    }
  };

  const hasDocuments = !!metadata?.documents && metadata.documents.length > 0;
  const hasView3D = !!metadata?.view3d;

  if (product?.seller.toLowerCase() === account?.toLocaleLowerCase()) {
    return (
      <UserDashboard>
        <ProductDetailSkeleton />
      </UserDashboard>
    );
  }

  return (
    <UserDashboard>
      {pageLoading ? (
        <ProductDetailSkeleton />
      ) : !product ? (
        <div className="col-span-3 w-full min-h-[80vh] flex items-center justify-center">
          <p className="shadow-md rounded-lg p-5">No Secondary Listing Found</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-full grid grid-cols-1 xl:grid-cols-8 macBook:grid-cols-11 gap-6">
            <div className="xl:col-span-4 macBook:col-span-5 rounded-3xl bg-transparent">
              <ImageSlider images={product.images} />
            </div>

            <Card className="xl:col-span-5 xl:col-start-5 macBook:col-span-6 macBook:col-start-6">
              <CardContent className="space-y-3">
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
                    title="Property Price"
                    value={`$${product?.totalPrice.toLocaleString()}`}
                    Icon={HandCoins}
                  />

                  <InfoCard
                    title="Owners"
                    value={product?.totalOwners}
                    Icon={User}
                  />

                  <InfoCard
                    title="Type"
                    value={product?.attributes[2].value}
                    Icon={ListFilter}
                  />

                  <div className="flex md:col-span-3 w-full border-t p-3">
                    <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 w-full">
                      <IconTitle
                        Icon={Coins}
                        title="Stakes Breakdown"
                        className="!flex-row"
                      />
                      <div className="flex flex-1 flex-wrap sm:justify-end items-center gap-1">
                        <Badge>
                          Seller : {shortenWalletAddress(product.seller)}
                        </Badge>
                        <Badge>
                          Price Per Share: $
                          {product.pricePerShare.toLocaleString()}
                        </Badge>

                        <Badge>
                          Shares Available:{" "}
                          {product.sharesRemaining.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* <ProgressOfShares
                    product={product}
                    className="md:col-span-3 p-3"
                  /> */}
                </div>

                <h4 className="text-grey-2">Buy With</h4>
                {/* Tabs */}
                <div className="flex items-center gap-4">
                  <Button
                    variant={selectedTab === "USDC" ? "default" : "outline"}
                    onClick={() => setSelectedTab("USDC")}
                    className="w-full"
                    size="lg"
                  >
                    <Image
                      src="/assets/USDC.svg"
                      alt="buy-now"
                      width={24}
                      height={24}
                    />
                    USDC
                  </Button>

                  <Button
                    variant={selectedTab === "ETH" ? "default" : "outline"}
                    onClick={() => setSelectedTab("ETH")}
                    className="w-full"
                    size="lg"
                  >
                    <Image
                      src="/assets/eth.svg"
                      alt="buy-now"
                      width={24}
                      height={24}
                    />
                    ETH
                  </Button>
                </div>

                {product?.sharesRemaining > 0 ? (
                  <>
                    <h4 className="text-grey-2">Price Per Share</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-[40px] font-bold">
                          $
                          {(
                            product?.pricePerShare * Number(quantity)
                          ).toLocaleString()}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          disabled={
                            typeof quantity !== "number" || quantity <= 1
                          }
                          onClick={handleDecrement}
                          variant="skyBlue"
                        >
                          <Minus size={20} />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={handleChange}
                          className="max-w-28"
                        />
                        <Button
                          disabled={
                            Number(quantity) >= product?.sharesRemaining
                          }
                          onClick={handleIncrement}
                          variant="skyBlue"
                        >
                          <Plus size={20} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-col md:flex-row">
                     
                      <Button
                        onClick={() =>
                          handleBuyNow(
                            product.listingId,
                            product.propertyId,
                            product.pricePerShare,
                            product.seller
                          )
                        }
                        disabled={
                          quantity === 0 ||
                          quantity === "" ||
                          loading2 ||
                          !account
                        }
                        loading={loading}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <Coins />
                        Buy Now
                      </Button>

                      {/* Buy with Card Button */}
                      <Button
                        onClick={() =>
                          handleBuyWithCard(
                            product.listingId,
                            product.propertyId,
                            product.pricePerShare,
                            product.seller,
                            product.image,
                            product.name
                          )
                        }
                        disabled={
                          quantity === 0 ||
                          quantity === "" ||
                          loading ||
                          !account
                        }
                        loading={loading2}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <CreditCard />
                        Buy with Card
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled
                  >
                    <CreditCard />
                    No Stakes Available
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
                )}

                {(hasDocuments || hasView3D) && (
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
                          <IconTitle
                            Icon={HandCoins}
                            title="3D Model"
                            className="!flex-row"
                          />
                          <Eye className="h-8 3xl:h-10 w-8 3xl:w-10 p-1 border rounded-full" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            <Swap className="w-full lg:w-1/2 xl:w-[55%]" />
          </div>

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
    </UserDashboard>
  );
};

export default SingleSecondaryListing;
