"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Cart from "./Cart";
import { useAccount } from "wagmi";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import { Product, SecondaryListing } from "@/app/context/types";
import { _getAllSecondaryEvents } from "@/app/context/subgraph-helpers/market-subgraph";
import UserDashboard from "@/app/components/UserDashboard";
import { ProductCard } from "@/app/components/ui/SkeletonCard";
import { NotifyError, shortenWalletAddress } from "@/app/context/helper";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
// import { mockSecondaryListings } from "@/app/assets/mock-data";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { MapPin, ShoppingCart, X } from "lucide-react";
import ProgressOfShares from "@/app/components/dashboard/progress-of-shares";
import { Badge } from "@/app/components/ui/badge";
import { HeadingPara } from "@/app/components/layout/heading";
import { ScrollArea } from "@/app/components/ui/scroll-area";

const Marketplace: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { address: account } = useAccount();
  const {
    getAllSecondaryListingsData,
    allSecondaryListingEvents,
    allSecondaryListingEventLoading,
  } = useBitStakeContext();
  const [bulkBuyMode, setBulkBuyMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [secondaryListingsData, setSecondaryListings] = useState<
    SecondaryListing[]
  >([]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setBulkBuyMode(!bulkBuyMode);
  };

  const _getAllListings = async () => {
    const res = await getAllSecondaryListingsData(allSecondaryListingEvents);
    console.log("🚀 ~ getAllSecondaryListingsData ~ res:", res)
    setSecondaryListings(res);
    // setSecondaryListings(mockSecondaryListings);
  };
  const handleReset = async () => {
    setIsOpen(false);
    setBulkBuyMode(false);
    setCartItems([]);

    _getAllListings();
  };

  useEffect(() => {
    setCartItems([]);
  }, [account]);

  useEffect(() => {
    (async () => {
      setPageLoading(true);
      await _getAllListings();
      setPageLoading(false);
    })();
  }, [allSecondaryListingEvents]);

  const addToCart = (product: Omit<Product, "quantity">) => {
    if (!account) {
      NotifyError("Wallet Not Connected");
      return;
    }
    const sellerIsBuyer =
      product.seller.toLowerCase() === account.toLowerCase();
    if (sellerIsBuyer) {
      NotifyError("Can't Buy Your Own Listing");
      return;
    }
    const productExits = cartItems.some(
      (item) => item.listingId === product.listingId
    );
    console.log("🚀 ~ addToCart ~ productExits:", {
      productExits,
      product,
      cartItems,
    });
    if (productExits) {
      NotifyError("Listing already exits in cart");
      return;
    }
    setCartItems((prevCartItems) => [
      ...prevCartItems,
      { ...product, quantity: 1 },
    ]);
  };

  return (
    <UserDashboard>
      <div className="w-full space-y-6">
        {secondaryListingsData.length > 0 && account && (
          <div className="flex justify-end">
            <Button onClick={toggleMenu} disabled={!account}>
              <ShoppingCart />
              Bulk Buy
            </Button>
          </div>
        )}

        {/* Products */}
        <div
          className={`grid gap-4 2xl:gap-6 ${
            bulkBuyMode
              ? "md:grid-cols-2 2xl:grid-cols-2 xl:w-[68%] 2xl:w-[70%] 3xl:w-[70%]"
              : "2xl:grid-cols-3 md:grid-cols-2 w-full"
          }`}
        >
          {pageLoading || allSecondaryListingEventLoading ? (
            <>
              <ProductCard />
              <ProductCard />
              <ProductCard />
            </>
          ) : secondaryListingsData.length == 0 ? (
            <div className="col-span-3 w-full min-h-[50vh] flex items-center justify-center">
              <p className="shadow-md rounded-lg p-5">
                {" "}
                No Secondary Listing Found
              </p>
            </div>
          ) : (
            secondaryListingsData.map((product) => (
              <>
                <Card key={product.propertyId} className="pt-0">
                  <Link
                    href={
                      account &&
                      product.seller.toLowerCase() === account.toLowerCase()
                        ? `/dashboard/my-properties/productdetail/${product.propertyId}`
                        : `/dashboard/secondary-marketplace/productdetail/${product.listingId}`
                    }
                    className="space-y-4"
                  >
                    <div className="w-full h-44 xl:h-48 3xl:h-64 overflow-hidden rounded-t-3xl">
                      <Image
                        src={product.image}
                        alt={product.name || "Product image"}
                        width={480}
                        height={280}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="space-y-4">
                      <Badge>Seller : {shortenWalletAddress(product.seller)}</Badge>
                      <Badge className="ml-1">Shares : {product.sharesRemaining}</Badge>
                      <Badge className="ml-1">{product.attributes[2]?.value}</Badge>

                      <div className="space-y-2">
                        <h2 className="text-lg sm:text-xl font-bold">
                          {product.name || "Property"}
                        </h2>

                        <div className="flex items-start gap-1 text-grey-6">
                          <MapPin className="h-5 w-5 text-grey-2" />
                          <h3 className="text-base font-medium">
                            <>
                              {product.attributes[0]?.value},{" "}
                              {product.attributes[1]?.value}
                            </>
                          </h3>
                        </div>
                      </div>
                      {/* <ProgressOfShares product={product} /> */}
                    </CardContent>
                  </Link>

                  <div className="px-5 flex items-center justify-between">
                    <div className="space-y-2">
                      <h4 className="text-grey-5 text-xs xl:text-sm">
                        Starting Price*
                      </h4>
                      <h3 className="text-xl font-bold">
                        $
                        {(
                          product.pricePerShare * product.totalShares
                        ).toLocaleString()}
                      </h3>
                    </div>
                    {!bulkBuyMode ? (
                      <Link
                        href={
                          account &&
                          product.seller.toLowerCase() === account.toLowerCase()
                            ? `/dashboard/my-properties/productdetail/${product.propertyId}`
                            : `/dashboard/secondary-marketplace/productdetail/${product.listingId}`
                        }
                      >
                        <Button>
                          {account &&
                          product.seller.toLowerCase() === account.toLowerCase()
                            ? " View "
                            : "BUY NOW"}
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          disabled={Boolean(
                            cartItems.some(
                              (item) => item.listingId === product.listingId
                            ) ||
                              product.seller.toLowerCase() ===
                                account?.toLowerCase()
                          )}
                          onClick={() => addToCart({ ...product })}
                        >
                          Add To Cart
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </>
            ))
          )}
        </div>
      </div>
      {/* Bulk Buy */}
      {isOpen && (
        <div className="right-0 fixed ml-1 top-0 bottom-0 h-full min-h-screen w-[24%] 2xl:w-[22%] 3xl:w-[25%] lg:h-screen bg-white overflow-hidden z-30 shadow-custom-2 space-y-6 px-5 py-8 sm:py-8">
          <div className="flex gap-2 items-center">
            <Button onClick={toggleMenu} variant="ghost" size="icon">
              <X size={16} />
            </Button>
            <HeadingPara
              title="Bulk Buy"
              classNameTitle="text-base xl:text-lg 3xl:text-xl"
            />
          </div>
          <ScrollArea className="h-[80dvh] 3xl:h-[90dvh]">
            <Cart
              cartItems={cartItems}
              setCartItems={setCartItems}
              handleReset={handleReset}
            />
          </ScrollArea>
        </div>
      )}
    </UserDashboard>
  );
};

export default Marketplace;
