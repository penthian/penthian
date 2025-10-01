// "use client";

// import Image from "next/image";
// import React, { useState } from "react";
// import {
//     _buyPrimarySharesByWert,
//     _getPrimaryListedProperty,
//     _getQuote,
// } from "@/app/context/helper-market";
// import { Activity, ListedPropertyData, NftMetadata, SecondaryListing } from "@/app/context/types";
// import { getCurrentTimeInSeconds } from "@/app/context/helper";
// import { maxDescriptionLength } from "@/app/utils/constants";
// import {
//     Coins,
//     CreditCard,
//     Eye,
//     HandCoins,
//     ListFilter,
//     MapPin,
//     Minus,
//     Plus,
//     User,
// } from "lucide-react";
// import Link from "next/link";
// import { MapPreview } from "@/app/components/MapPicker";
// import PropertyCalculator from "@/app/dashboard/my-properties/productdetail/[id]/PropertyCalculator";
// import Swap from "@/app/components/Swap";
// import FinancialBreakdown from "@/app/dashboard/my-properties/productdetail/[id]/FinancialBreakdown";
// import ImageSlider from "@/app/components/dashboard/image-slider";
// import { Card, CardAction, CardContent } from "@/app/components/ui/card";
// import InfoCard from "@/app/components/dashboard/infoCard";
// import IconTitle from "@/app/components/dashboard/icon-title";
// import { Badge } from "@/app/components/ui/badge";
// import ProgressOfShares from "@/app/components/dashboard/progress-of-shares";
// import { Button } from "@/app/components/ui/button";
// import { Input } from "@/app/components/ui/input";
// import { HeadingPara } from "@/app/components/layout/heading";
// import { cn, getDisplayText } from "@/lib/utils";
// import DownloadDocuments from "@/app/dashboard/primary-marketplace/productdetail/[id]/DownloadDocumentSection";
// import PropertyActivityTable from "../FAQTable";
// import { useBitStakeContext } from "@/app/context/BitstakeContext";
// import ReferralLinkButton from "../ReferralLinkButton";
// import { CountdownTimer } from "../CountdownTimer";

// type ProductDetailedPageType = {
//     pageType: "primary" | "secondary" | "auction" | "my_property";
//     product: any;
//     metadata: NftMetadata | undefined;
//     metadataLoading: boolean;
//     loading: boolean;
//     loading2: boolean;
//     quantity: number | string;
//     account: `0x${string}` | undefined;
//     selectedTab: string;
//     propertyActivities?: Activity[];
//     propertyActivitiesLoading?: boolean;
//     setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
//     handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     handleIncrement: () => void;
//     handleDecrement: () => void;
//     handlePrimaryBuyCrypto?: (
//         propertyId: number,
//         pricePerShare: number
//     ) => Promise<void>;
//     handlePrimaryBuyCard?: (
//         propertyId: number,
//         pricePerShare: number,
//         image: string,
//         name: string
//     ) => Promise<void>;
//     handleSecondaryBuyCrypto?: (
//         listingId: number,
//         propertyId: number,
//         pricePerShare: number,
//         seller: string
//     ) => Promise<void>;
//     handleSecondaryBuyCard?: (
//         listingId: number,
//         propertyId: number,
//         pricePerShare: number,
//         seller: string,
//         image: string,
//         name: string
//     ) => Promise<void>;
// };

// const ProductDetailedPage: React.FC<ProductDetailedPageType> = ({
//     product,
//     metadata,
//     loading,
//     loading2,
//     metadataLoading,
//     quantity,
//     account,
//     selectedTab,
//     propertyActivities,
//     propertyActivitiesLoading,
//     pageType,
//     handleChange,
//     handleDecrement,
//     handleIncrement,
//     handlePrimaryBuyCrypto,
//     handlePrimaryBuyCard,
//     handleSecondaryBuyCrypto,
//     handleSecondaryBuyCard,
//     setSelectedTab,
// }) => {
//     const { userAccess } = useBitStakeContext();
//     const [showFull, setShowFull] = useState(false);

//     const hasDocuments = !!metadata?.documents && metadata.documents.length > 0;
//     const hasView3D = !!metadata?.view3d;

//     const hasSharesRemaining = product ? product?.sharesRemaining > 0 : false;
//     const saleTimeEnded = product
//         ? hasSharesRemaining && getCurrentTimeInSeconds() > product.endTime
//         : false;

//     const canRefer =
//         account && pageType == "primary" && userAccess.isAgent && hasSharesRemaining && !saleTimeEnded;

//     return (
//         <div className="space-y-6">
//             <div className="w-full grid grid-cols-1 xl:grid-cols-8 macBook:grid-cols-11 gap-6">
//                 <div className="xl:col-span-4 macBook:col-span-5 rounded-3xl bg-transparent">
//                     <ImageSlider images={product.images} />
//                 </div>

//                 <Card
//                     className={`xl:col-span-5 xl:col-start-5 macBook:col-span-6 macBook:col-start-6`}
//                 >
//                     <CardContent className="space-y-3">
//                         <HeadingPara title={product?.name} className="text-xl md:!text-2xl" tag="h1" />

//                         <div className="flex items-center gap-2">
//                             <div className="flex items-start gap-1">
//                                 <MapPin className="h-5 w-5 text-grey-2" />
//                                 <h3 className="text-base font-medium text-grey-6">
//                                     {product.attributes[0]?.value}, {product.attributes[1]?.value}
//                                 </h3>
//                             </div>
//                             {canRefer && <ReferralLinkButton agentAddress={account} />}
//                         </div>

//                         <div
//                             className="border-t border-b border
//                       grid grid-cols-1 md:grid-cols-2
//                       md:divide-x divide-y md:divide-border"
//                         >
//                             <InfoCard
//                                 title="Property Worth"
//                                 value={`$${product?.totalPrice.toLocaleString()}`}
//                                 Icon={HandCoins}
//                             />

//                             <InfoCard
//                                 title="Your Listing Price"
//                                 value={`$${listedProduct?.pricePerShare.toLocaleString()}`}
//                                 Icon={User}
//                             />
//                             <InfoCard
//                                 title="Total Owners"
//                                 value={product?.totalOwners}
//                                 Icon={User}
//                             />

//                             <div className="flex md:col-span-2 w-full border-t p-3">
//                                 <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 w-full">
//                                     <IconTitle Icon={Coins} title="Stakes Breakdown" />
//                                     <div className="flex flex-1 flex-wrap sm:justify-end items-center gap-1">
//                                         <Badge>
//                                             Stakes Owned: ${product.pricePerShare.toLocaleString()}
//                                         </Badge>

//                                         <Badge>
//                                             No. of Stakes Listed: {product.totalShares}
//                                         </Badge>
//                                     </div>
//                                 </div>
//                             </div>

//                             <ProgressOfShares
//                                 product={product}
//                                 className="md:col-span-2 p-3"
//                             />
//                         </div>

//                         {product?.sharesRemaining > 0 ? (
//                             <>
//                                 {product.endTime > getCurrentTimeInSeconds() ? (
//                                     <>
//                                         <div className="space-y-3 mt-2">
//                                             <h4 className=" text-grey-2">Buy With</h4>
//                                             {/* Tabs */}
//                                             <div className="flex items-center gap-4 mt-2">
//                                                 <Button
//                                                     onClick={() => setSelectedTab("USDC")}
//                                                     variant={
//                                                         selectedTab === "USDC" ? "default" : "outline"
//                                                     }
//                                                     className="w-full"
//                                                 >
//                                                     <Image
//                                                         src="/assets/USDC.svg"
//                                                         alt="buy-now"
//                                                         width={24}
//                                                         height={24}
//                                                     />
//                                                     USDC
//                                                 </Button>

//                                                 <Button
//                                                     onClick={() => setSelectedTab("ETH")}
//                                                     variant={
//                                                         selectedTab === "ETH" ? "default" : "outline"
//                                                     }
//                                                     className="w-full"
//                                                 >
//                                                     <Image
//                                                         src="/assets/eth.svg"
//                                                         alt="buy-now"
//                                                         width={24}
//                                                         height={24}
//                                                     />
//                                                     ETH
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                         <div className="mt-4">
//                                             <h4 className="text-grey-2">Total Price</h4>
//                                             <div className="flex items-center gap-2 justify-between mt-2">
//                                                 <div className="flex items-center gap-1.5">
//                                                     <h3 className="text-2xl xl:text-3xl macBook:text-4xl font-bold">
//                                                         $
//                                                         {(
//                                                             product?.pricePerShare * Number(quantity)
//                                                         ).toLocaleString()}
//                                                     </h3>
//                                                 </div>

//                                                 <div className="flex items-center gap-1">
//                                                     <Button
//                                                         disabled={typeof quantity !== "number" || quantity <= 1}
//                                                         onClick={handleDecrement}
//                                                         variant="skyBlue"
//                                                     >
//                                                         <Minus size={20} />
//                                                     </Button>
//                                                     <Input
//                                                         type="number"
//                                                         min={1}
//                                                         value={quantity}
//                                                         onChange={handleChange}
//                                                         className="max-w-28"
//                                                     />
//                                                     <Button
//                                                         disabled={quantity >= product?.sharesRemaining}
//                                                         onClick={handleIncrement}
//                                                         variant="skyBlue"
//                                                     >
//                                                         <Plus size={20} />
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                             <div className="flex w-full flex-col sm:flex-row items-center gap-4 mt-6">
//                                                 {/* Buy Now Button */}
//                                                 <Button
//                                                     onClick={() => {
//                                                         if (pageType === "primary" && handlePrimaryBuyCrypto) {
//                                                             return handlePrimaryBuyCrypto(
//                                                                 product.propertyId,
//                                                                 product.pricePerShare
//                                                             );
//                                                         }

//                                                         if (pageType === "secondary" && handleSecondaryBuyCrypto) {
//                                                             const sec = product as SecondaryListing;
//                                                             return handleSecondaryBuyCrypto(
//                                                                 sec.listingId,
//                                                                 sec.propertyId,
//                                                                 sec.pricePerShare,
//                                                                 sec.seller
//                                                             );
//                                                         }
//                                                     }}
//                                                     variant="outline"
//                                                     disabled={quantity === 0 || quantity === '' || loading || loading2 || !account}
//                                                     loading={loading}
//                                                     className="w-full"
//                                                 >
//                                                     <Coins />
//                                                     Buy Now
//                                                 </Button>

//                                                 {/* Buy with Card Button */}
//                                                 <Button
//                                                     onClick={() => {

//                                                         if (pageType === "primary" && handlePrimaryBuyCard) {
//                                                             return handlePrimaryBuyCard(
//                                                                 product.propertyId,
//                                                                 product.pricePerShare,
//                                                                 product.image,
//                                                                 product.name
//                                                             );
//                                                         }

//                                                         if (pageType === "secondary" && handleSecondaryBuyCard) {
//                                                             const sec = product as SecondaryListing;
//                                                             return handleSecondaryBuyCard(
//                                                                 sec.listingId,
//                                                                 sec.propertyId,
//                                                                 sec.pricePerShare,
//                                                                 sec.seller,
//                                                                 sec.image,
//                                                                 sec.name
//                                                             );
//                                                         }
//                                                     }}
//                                                     variant="outline"
//                                                     disabled={quantity === 0 || quantity === '' || loading || loading2 || !account}
//                                                     loading={loading2}
//                                                     className="w-full"
//                                                 >
//                                                     <CreditCard />
//                                                     Buy with Card
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <Button
//                                         variant="disabled"
//                                         size="lg"
//                                         disabled
//                                         className="w-full cursor-not-allowed"
//                                     >
//                                         Sale Ended
//                                     </Button>
//                                 )}
//                             </>
//                         ) : (
//                             <div className="bg-grey-3 text-grey-2 font-bold w-full p-5 rounded-full flex items-center justify-center">
//                                 <p>Sold Out</p>
//                             </div>
//                         )}
//                     </CardContent>
//                 </Card>
//             </div>

//             <div className="flex justify-between flex-col lg:flex-row gap-6">
//                 <Card className="w-full lg:w-1/2 xl:w-[45%]">
//                     <CardContent className="space-y-4">
//                         <HeadingPara
//                             title="Description"
//                             classNameTitle="text-base xl:text-lg macBook:text-xl"
//                         />

//                         {!metadataLoading && metadata && (
//                             <p className="text-sm text-grey-1 font-medium">
//                                 {getDisplayText({
//                                     text: metadata.description,
//                                     showFull: showFull,
//                                 })}
//                                 {metadata.description.length > maxDescriptionLength && (
//                                     <Button
//                                         onClick={() => setShowFull(!showFull)}
//                                         variant="outline"
//                                         size="sm"
//                                         className="ml-2 mt-1"
//                                     >
//                                         {showFull ? "See less" : "See more"}
//                                     </Button>
//                                 )}
//                             </p>
//                         )
//                         }

//                         {
//                             (hasDocuments || hasView3D) && (
//                                 <div className="flex w-full border overflow-hidden">
//                                     {hasDocuments && (
//                                         <div
//                                             className={cn(
//                                                 "flex items-center justify-center px-4 py-4 w-full",
//                                                 hasView3D && "w-1/2 border-r"
//                                             )}
//                                         >
//                                             <DownloadDocuments documents={metadata!.documents!} />
//                                         </div>
//                                     )}

//                                     {hasView3D && (
//                                         <div
//                                             className={cn(
//                                                 "flex items-center justify-center px-4 py-4 text-grey-6 w-full",
//                                                 hasDocuments && "w-1/2"
//                                             )}
//                                         >
//                                             <Link
//                                                 href={metadata!.view3d!}
//                                                 target="_blank"
//                                                 className="flex items-center justify-between w-full"
//                                             >
//                                                 <IconTitle Icon={HandCoins} title="3D Model" />
//                                                 <Eye className="h-10 w-10 p-1 border rounded-full" />
//                                             </Link>
//                                         </div>
//                                     )}
//                                 </div>
//                             )
//                         }
//                     </CardContent >
//                 </Card >
//                 <Swap className="w-full lg:w-1/2 xl:w-[55%]" />
//             </div >

//             {
//                 pageType !== "primary" && (
//                     <PropertyActivityTable
//                         activities={propertyActivities ?? []}
//                         isLoading={propertyActivitiesLoading}
//                     />
//                 )
//             }

//             {
//                 metadata?.location && (
//                     <fieldset className="mb-6 px-6 space-y-6">
//                         <legend className="px-2 text-2xl front-semibold">
//                             Location Preview
//                         </legend>
//                         <MapPreview
//                             latitude={metadata.location.latitude}
//                             longitude={metadata.location.longitude}
//                             className="h-80"
//                         />
//                     </fieldset>
//                 )
//             }

//             <PropertyCalculator apr={product.aprBips ?? 0} />
//             <FinancialBreakdown
//                 transactionBreakdown={metadata?.transactionBreakdown || []}
//                 rentalBreakdown={metadata?.rentalBreakdown || []}
//                 loading={metadataLoading}
//             />
//         </div >
//     );
// };

// export default ProductDetailedPage;
