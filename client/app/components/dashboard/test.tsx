// "use client";

// import Link from "next/link";
// import { Card, CardContent } from "../ui/card";
// import { ProductCardPrimary } from "../ui/SkeletonCard";
// import { Skeleton } from "../ui/Skeleton";
// import Image from "next/image";
// import { getCurrentTimeInSeconds } from "@/app/context/helper";
// import { useEffect, useState } from "react";
// import { ListedProperty } from "@/app/context/types";
// import { DEFAULT_IMAGES } from "@/app/utils/constants";
// import { _getPropertyDetails } from "@/app/context/helper-rwa";
// import { _getPrimarySale } from "@/app/context/helper-market";
// import axios from "axios";
// import { CountdownTimer } from "../CountdownTimer";
// import { cn } from "@/lib/utils";
// import { Button } from "../ui/button";
// import { Calendar, Coins, LocateIcon, MapPin, User } from "lucide-react";
// import { Badge } from "../ui/badge";
// import ProgressOfShares from "./progress-of-shares";
// import InfoCard from "./infoCard";

// interface ProductCardProps {
//     propertyId: number;
// }

// export interface Metadata {
//     description: string;
//     image: string;
//     images: string[];
//     view3d: string | null;
//     name: string;
//     attributes: { value: string }[];
// }

// const ProductCard = ({ propertyId }: ProductCardProps) => {
//     const [productDataLoading, setProductDataLoading] = useState<boolean>(true);
//     const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
//     const [soldPercentage, setSoldPercentage] = useState<string>("0%");
//     const [productData, setProductData] = useState<ListedProperty | null>(null);
//     const [metadata, setMetadata] = useState<Metadata>({
//         description: "----",
//         name: "----",
//         image: DEFAULT_IMAGES[0],
//         images: DEFAULT_IMAGES,
//         attributes: [],
//         view3d: null, 
//     });

//     const hasSharesRemaining = productData ? productData?.sharesRemaining > 0 : false;
//     const saleTimeEnded = productData
//         ? hasSharesRemaining && getCurrentTimeInSeconds() > productData.endTime
//         : false;

//     useEffect(() => {
//         const fetchProductData = async () => {
//             setProductDataLoading(true);
//             try {
//                 const details = await _getPropertyDetails({ propertyId });

//                 if (!details) {
//                     setProductData(null);
//                     return;
//                 }
//                 const listing = await _getPrimarySale({ propertyId });

//                 const property: ListedProperty = {
//                     propertyId: propertyId,
//                     owner: details.owner,
//                     pricePerShare: details.pricePerShare,
//                     sharesRemaining: listing.sharesRemaining,
//                     endTime: listing.endTime,
//                     totalOwners: details.totalOwners,
//                     totalShares: details.totalShares,
//                     totalPrice: details.totalShares * details.pricePerShare,
//                     uri: details.uri,
//                 };
//                 setProductData(property);
//                 const _soldPercentage =
//                     ((property.totalShares - property.sharesRemaining) /
//                         property.totalShares) *
//                     100;

//                 setSoldPercentage(`${_soldPercentage}%`);
//             } catch (error) {
//                 console.log("Error fetching product data", error);
//                 setProductData(null);
//             } finally {
//                 setProductDataLoading(false);
//             }
//         };

//         fetchProductData();
//     }, [propertyId]);

//     useEffect(() => {
//         if (productData) {
//             const fetchMetadata = async () => {
//                 setMetadataLoading(true);
//                 try {
//                     const response = await axios.get(productData.uri);
//                     const metadataResponse = response.data;

//                     const newMetadata: Metadata = {
//                         description: metadataResponse?.description || "----",
//                         image: metadataResponse?.image || DEFAULT_IMAGES[0],
//                         images: metadataResponse?.images || DEFAULT_IMAGES,
//                         name: metadataResponse?.name || "----",
//                         attributes: metadataResponse?.attributes || [],
//                         view3d: null, 
//                     };

//                     setMetadata(newMetadata);
//                 } catch (error) {
//                     console.log("Error fetching metadata", error);
//                 } finally {
//                     setMetadataLoading(false);
//                 }
//             };
//             fetchMetadata();
//         }
//     }, [productData]);

//     if (productDataLoading || !productData) {
//         return <ProductCardPrimary />;
//     }

//     return (
//         <Link href={`/dashboard/auction/auctiondetail/${product.auctionId}`}>
//             <Card className="w-full h-auto overflow-hidden cursor-pointer py-0">
//                 <div className="relative">
//                     <div className="w-full h-44 xl:h-48 3xl:h-72 overflow-hidden rounded-t-3xl">
//                         {metadataLoading ? (
//                             <Skeleton className="w-full h-44 xl:h-56 3xl:h-48" />
//                         ) : (
//                             <>
//                                 <Image
//                                     src={metadata.image}
//                                     alt={metadata.name || "Product image"}
//                                     width={480}
//                                     height={280}
//                                     className="w-full h-full object-cover"
//                                 />
//                             </>
//                         )}
//                     </div>

//                     {product.highestBidder !==
//                         "0x0000000000000000000000000000000000000000" && <div
//                             className={cn(
//                                 `w-full py-2 flex items-center justify-center font-semibold text-base gap-2 bg-grey-3 text-grey-2`
//                             )}
//                         >
//                             <p>The highest current bid is {diffPct}% {direction} the market price</p>
//                         </div>}
//                 </div>

//                 <CardContent className="pb-4 space-y-2 3xl:space-y-4">
//                     <div className="space-y-2">
//                         <h2 className="text-xl sm:text-2xl font-bold text-[#292A36]">
//                             {product.name}
//                         </h2>
//                         <p className="text-[#6B7380] text-sm sm:text-lg mt-1">
//                             Property ID: {product.propertyId}
//                         </p>
//                     </div>

//                     <div className="flex items-center justify-between">
//                         <div className="grid grid-cols-2 gap-2">
//                             <InfoCard
//                                 Icon={User}
//                                 title="Seller"
//                                 value={`${product.seller.toLocaleString()}`}
//                             />
//                             <InfoCard
//                                 Icon={Coins}
//                                 title="Sahres"
//                                 value={`${product.noOfShares.toLocaleString()}`}
//                             />
//                             <InfoCard
//                                 Icon={Calendar}
//                                 title="Start"
//                                 value={new Date(startTime).toLocaleString("en-US", fmt)}
//                             />
//                             <InfoCard
//                                 Icon={User}
//                                 title="Seller"
//                                 value={new Date(endTime).toLocaleString("en-US", fmt)}
//                             />
//                         </div>

//                         <Button>
//                             Bid
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>
//         </Link>
//     );
// };

// export default ProductCard;
