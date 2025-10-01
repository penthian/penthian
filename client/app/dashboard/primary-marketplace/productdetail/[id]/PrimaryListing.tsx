"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  _buyPrimaryShares,
  _buyPrimarySharesByWert,
  _getPrimaryListedProperty,
  _getQuote,
  _getValidAndWhitelistedAgent,
} from "@/app/context/helper-market";
import { ListedPropertyData, NftMetadata } from "@/app/context/types";
import UserDashboard from "@/app/components/UserDashboard";
import {
  approveUsdcSpender,
  getUsdcAllowance,
} from "@/app/context/helper-usdc";
import { useAccount } from "wagmi";
import {
  NotifyError,
  NotifySuccess,
  ZERO_ADDRESS,
  fetchNftMetadata,
  getCurrentTimeInSeconds,
  getEthFrom,
} from "@/app/context/helper";
import {
  PLATFORM_LOGO,
  BITSTAKE_CONFIG,
  SALT_ETH,
  WERT_CONFIG,
} from "@/app/utils/constants";
import WertWidget from "@wert-io/widget-initializer";
import { signSmartContractData } from "@wert-io/widget-sc-signer";
import { ethers } from "ethers";
import { useKYCModal } from "@/app/context/KYCModalContext";
import { ProductDetailSkeleton } from "@/app/components/ui/SkeletonCard";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import ProductDetailedPage from "@/app/components/dashboard/product-detailed-page";

const PrimaryListing: React.FC = () => {
  const searchParams = useSearchParams();
  const agent = searchParams.get("agent");
  const { particleProvider, userAccess } = useBitStakeContext();
  const [selectedTab, setSelectedTab] = useState("USDC");
  const { id } = useParams();
  const { kycStatus, openModal } = useKYCModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);

  const [product, setProduct] = useState<ListedPropertyData | null>();

  // State for NFT metadata from the product URI
  const [metadata, setMetadata] = useState<NftMetadata>();
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);

  const [quantity, setQuantity] = useState<number | "">(1);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const { address: account } = useAccount();

  const _getListing = async (productId: number) => {
    const foundProduct = await _getPrimaryListedProperty({
      propertyId: productId,
    });

    setProduct(foundProduct);
  };

  useEffect(() => {
    const productId = Number(id);
    (async () => {
      await _getListing(productId);
      setPageLoading(false);
    })();
  }, [id]);

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

  const handleIncrement = () => {
    setQuantity((prev) => {
      // treat empty as 0
      const current = typeof prev === "number" ? prev : 0;
      const next = current + 1;
      // clamp to sharesRemaining
      if (product && next > product.sharesRemaining) {
        NotifyError("Share limit exceeded");
        return product.sharesRemaining;
      }
      return next;
    });
  };

  const handleDecrement = () => {
    setQuantity((prev) => {
      // treat empty as 1 (so you never go below 1)
      const current = typeof prev === "number" ? prev : 1;
      // floor at 1
      return current > 1 ? current - 1 : 1;
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;

    // A) allow the user to clear the field completely
    if (raw === "") {
      setQuantity("");
      return;
    }

    // B) try parsing the value
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      // ignore non‑numeric keystrokes
      return;
    }

    // C) enforce a minimum of 1 share
    if (parsed < 1) {
      setQuantity(1);
      return;
    }

    // D) enforce a maximum of sharesRemaining
    if (product && parsed > product.sharesRemaining) {
      NotifyError("Share limit exceeded");
      setQuantity(product.sharesRemaining);
      return;
    }

    // E) everything’s valid!
    setQuantity(parsed);
  };

  const handleBuyNow = async (propertyId: number, pricePerShare: number) => {
    try {
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed") {
        await openModal(account);
        throw new Error("Complete KYC in order to continue");
      }
      setLoading(true);
      const buyAmount = pricePerShare * Number(quantity);
      let currency = ZERO_ADDRESS;

      console.log("🚀 ~ handleBuyNow ~ agent requested:", agent);
      const validReferralAddress = await _getValidAndWhitelistedAgent(
        agent,
        account
      );

      if (selectedTab === "USDC") {
        const allowance = await getUsdcAllowance({
          owner: account as string,
          spenderType: "market",
        });
        if (buyAmount > allowance)
          await approveUsdcSpender({
            amount: String(buyAmount),
            particleProvider,
            spenderType: "market",
          });

        currency = BITSTAKE_CONFIG.usdc;
      }
      console.log("🚀 ~ handleBuyNow ~ quantity:", quantity);

      await _buyPrimaryShares({
        recipient: account,
        currency: currency,
        pricePerShare: pricePerShare,
        propertyId: propertyId,
        sharesToBuy: Number(quantity),
        referralAddress: validReferralAddress,
        particleProvider,
      });

      setQuantity(1);
      NotifySuccess("Shares Bought Successfully");
      await _getListing(propertyId);
    } catch (error: any) {
      NotifyError(error.reason || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyWithCard = async (
    propertyId: number,
    pricePerShare: number,
    image: string,
    name: string
  ) => {
    try {
      window.Buffer = Buffer;
      if (!account) throw new Error("Wallet is not Connected");
      if (kycStatus !== "completed") {
        await openModal(account);
        throw new Error("Complete KYC in order to continue");
      }

      setLoading2(true);

      console.log("🚀 ~ handleBuyNow ~ agent:", agent);
      const validReferralAddress = await _getValidAndWhitelistedAgent(
        agent,
        account
      );

      await _buyPrimarySharesByWert({
        recipient: account,
        currency: ZERO_ADDRESS,
        pricePerShare: pricePerShare,
        propertyId: propertyId,
        sharesToBuy: Number(quantity),
        referralAddress: validReferralAddress,
        particleProvider,
      });

      let ABI = [
        "function buyPrimaryShares(address _recipient, address _currency, uint256 _propertyId, uint256 _sharesToBuy )",
      ];
      let iface = new ethers.utils.Interface(ABI);
      const sc_input_data = iface.encodeFunctionData("buyPrimaryShares", [
        account,
        ZERO_ADDRESS,
        propertyId,
        quantity,
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
      console.log(signedData, "signedData");

      const extraOptions = {
        item_info: {
          author: "Penthian",
          author_image_url: PLATFORM_LOGO,
          image_url: image,
          name: name,
          category: "Primary Listing",
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
                await _getListing(propertyId);
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
    } finally {
      setLoading2(false);
    }
  };

  return (
    <UserDashboard>
      {pageLoading ? (
        <ProductDetailSkeleton />
      ) : !product || !metadata ? (
        <div className="col-span-3 w-full min-h-[80vh] flex items-center justify-center">
          <p className="shadow-md rounded-lg p-5">No Primary Listing Found</p>
        </div>
      ) : (
        <ProductDetailedPage
          product={product}
          metadata={metadata}
          metadataLoading={metadataLoading}
          loading={loading}
          loading2={loading2}
          quantity={quantity}
          account={account}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          handleChange={handleChange}
          handleIncrement={handleIncrement}
          handleDecrement={handleDecrement}
          handlePrimaryBuyCrypto={handleBuyNow}
          handlePrimaryBuyCard={handleBuyWithCard}
          pageType="primary"
        />
      )}
    </UserDashboard>
  );
};

export default PrimaryListing;
